import { NextRequest, NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { normalizeRows } from '@/lib/db-utils';
import { loadDjLookup, resolveDj, type DjRecord } from '@/lib/dj-notifications/djLookup';
import { isDigestWeek } from '@/lib/dj-notifications/schedule';
import {
  NOTIFICATION_FROM,
  NOTIFICATION_REPLY_TO,
  getResend,
  renderDigestEmail,
  type DigestBooking,
} from '@/lib/dj-notifications/email';

export const dynamic = 'force-dynamic';

const DIGEST_TYPE = 'digest';

function verifyCron(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET ?? ''}`;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // The cron runs every Sunday. Biweekly parity is enforced here: even ISO weeks
  // send, odd weeks are a no-op. Pass ?force=1 to override for manual testing.
  const url = new URL(req.url);
  const force = url.searchParams.get('force') === '1';

  if (!force && !isDigestWeek()) {
    return NextResponse.json({ success: true, skipped: true, reason: 'off-week (biweekly parity)' });
  }

  const resend = getResend();
  const { byKey, all } = await loadDjLookup();

  // Load DJ bookings in the next 60 days. Exclude non-DJ service rows
  // (Videography, Photography, Coordination) that are stored as separate rows
  // for the same event but should not appear in DJ notifications.
  const rows = normalizeRows(await sql`
    SELECT id, dj_user, client_name, event_type, date, time, location,
           notes, contact_email, contact_phone
    FROM bookings
    WHERE date >= CURRENT_DATE
      AND date <= CURRENT_DATE + INTERVAL '60 days'
      AND (
        event_type IS NULL
        OR event_type = ''
        OR (
          event_type NOT ILIKE '%videograph%'
          AND event_type NOT ILIKE '%photograph%'
          AND event_type NOT ILIKE '%coordinat%'
        )
      )
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
    // Idempotency: at most one digest per DJ per calendar day.
    const already = normalizeRows(await sql`
      SELECT 1 FROM dj_email_sends
      WHERE booking_id IS NULL
        AND dj_user = ${dj.username}
        AND email_type = ${DIGEST_TYPE}
        AND sent_at::date = CURRENT_DATE
      LIMIT 1
    `);
    if (already.length > 0) {
      results.skippedAlreadySent++;
      continue;
    }

    try {
      const { subject, html, text } = renderDigestEmail({
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
      const resendId = sendResult?.data?.id ?? null;

      await sql`
        INSERT INTO dj_email_sends (booking_id, dj_user, dj_email, email_type, resend_id)
        VALUES (NULL, ${dj.username}, ${dj.email}, ${DIGEST_TYPE}, ${resendId})
        ON CONFLICT DO NOTHING
      `;
      results.sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[dj-digest] Failed for ${dj.username}:`, msg);
      results.errors.push({ djUser: dj.username, error: msg });
    }
  }

  return NextResponse.json({ success: true, ...results });
}
