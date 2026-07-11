import { NextRequest, NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { normalizeRows } from '@/lib/db-utils';
import { loadDjLookup, resolveDj, type DjRecord } from '@/lib/dj-notifications/djLookup';
import {
  NOTIFICATION_FROM,
  NOTIFICATION_REPLY_TO,
  getResend,
  renderMonthlyEmail,
  type DigestBooking,
} from '@/lib/dj-notifications/email';

export const dynamic = 'force-dynamic';

const MONTHLY_TYPE = 'monthly';

function verifyCron(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET ?? ''}`;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resend = getResend();
  const { byKey, all } = await loadDjLookup();

  // Load every booking in the next 12 months, then group by resolved DJ.
  const rows = normalizeRows(await sql`
    SELECT id, dj_user, client_name, event_type, date, time, location,
           notes, contact_email, contact_phone
    FROM bookings
    WHERE date >= CURRENT_DATE
      AND date <= CURRENT_DATE + INTERVAL '12 months'
    ORDER BY date ASC
  `);

  const bookingsByDj = new Map<string, { dj: DjRecord; bookings: DigestBooking[] }>();

  for (const row of rows) {
    const djUserRaw = (row.dj_user ?? '').toString().trim();
    const dj = resolveDj(djUserRaw, byKey);
    if (!dj) continue;

    const entry = bookingsByDj.get(dj.username) ?? { dj, bookings: [] };
    entry.bookings.push({
      id: row.id,
      clientName: row.client_name ?? null,
      eventType: row.event_type ?? null,
      date: typeof row.date === 'string' ? row.date : new Date(row.date).toISOString().slice(0, 10),
      time: row.time ?? null,
      location: row.location ?? null,
      notes: row.notes ?? null,
      contactEmail: row.contact_email ?? null,
      contactPhone: row.contact_phone ?? null,
    });
    bookingsByDj.set(dj.username, entry);
  }

  const results = {
    totalDjs: all.length,
    djsWithProjects: bookingsByDj.size,
    sent: 0,
    skippedAlreadySent: 0,
    errors: [] as { djUser: string; error: string }[],
  };

  for (const [, { dj, bookings }] of bookingsByDj) {
    // Idempotency: at most one monthly per DJ per calendar day. The cron only
    // fires on the 1st, but a manual retry the same day should be a no-op.
    const already = normalizeRows(await sql`
      SELECT 1 FROM dj_email_sends
      WHERE booking_id IS NULL
        AND dj_user = ${dj.username}
        AND email_type = ${MONTHLY_TYPE}
        AND sent_at::date = CURRENT_DATE
      LIMIT 1
    `);
    if (already.length > 0) {
      results.skippedAlreadySent++;
      continue;
    }

    try {
      const { subject, html, text } = renderMonthlyEmail({
        djFirstName: dj.firstName || dj.username || 'there',
        bookings,
      });

      const sendResult = await resend.emails.send({
        from: NOTIFICATION_FROM,
        to: dj.email,
        replyTo: NOTIFICATION_REPLY_TO,
        subject,
        html,
        text,
      });

      if (sendResult.error) {
        throw new Error(sendResult.error.message ?? JSON.stringify(sendResult.error));
      }

      const resendId = sendResult.data?.id ?? null;

      await sql`
        INSERT INTO dj_email_sends (booking_id, dj_user, dj_email, email_type, resend_id)
        VALUES (NULL, ${dj.username}, ${dj.email}, ${MONTHLY_TYPE}, ${resendId})
        ON CONFLICT DO NOTHING
      `;
      results.sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[dj-monthly] Failed for ${dj.username}:`, msg);
      results.errors.push({ djUser: dj.username, error: msg });
    }
  }

  return NextResponse.json({ success: true, ...results });
}
