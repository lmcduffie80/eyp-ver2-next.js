import { NextRequest, NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { normalizeRows } from '@/lib/db-utils';
import { loadDjLookup, loadAllStaffLookup, resolveDj } from '@/lib/dj-notifications/djLookup';
import {
  NOTIFICATION_FROM,
  NOTIFICATION_REPLY_TO,
  getResend,
  renderDigestEmail,
  type DigestBooking,
} from '@/lib/dj-notifications/email';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';

export const dynamic = 'force-dynamic';

// POST /api/admin/send-dj-reminder
// Body: { djUser: string }
// Manually sends a digest reminder email to a single DJ. Admin-only.
export async function POST(req: NextRequest) {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response;

  let djUserRaw: string;
  try {
    const body = await req.json();
    djUserRaw = (body.djUser ?? '').toString().trim();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  if (!djUserRaw) {
    return NextResponse.json({ success: false, error: 'djUser is required' }, { status: 400 });
  }

  // Try DJ-only lookup first; fall back to all staff so non-DJ team members
  // (Lee, Misty, coordinators) can also receive digest reminder emails.
  const { byKey: djByKey } = await loadDjLookup();
  let dj = resolveDj(djUserRaw, djByKey);
  const isDj = dj !== null;

  if (!dj) {
    const { byKey: allByKey } = await loadAllStaffLookup();
    dj = resolveDj(djUserRaw, allByKey);
  }

  if (!dj) {
    return NextResponse.json(
      { success: false, error: `No account found matching "${djUserRaw}"` },
      { status: 404 }
    );
  }

  if (!dj.email) {
    return NextResponse.json(
      { success: false, error: `"${dj.username}" has no email address on file` },
      { status: 422 }
    );
  }

  // DJs: exclude non-DJ service rows (same filter as the digest cron).
  // Non-DJ staff (Lee, Misty, coordinators): fetch all event types — their
  // bookings ARE the coordination rows that the DJ filter deliberately strips.
  let rows: ReturnType<typeof normalizeRows>;
  if (isDj) {
    rows = normalizeRows(await sql`
      SELECT id, dj_user, client_name, event_type, date, time, location,
             notes, contact_email, contact_phone
      FROM bookings
      WHERE date >= CURRENT_DATE
        AND (archived = FALSE OR archived IS NULL)
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
  } else {
    rows = normalizeRows(await sql`
      SELECT id, dj_user, client_name, event_type, date, time, location,
             notes, contact_email, contact_phone
      FROM bookings
      WHERE date >= CURRENT_DATE
        AND (archived = FALSE OR archived IS NULL)
      ORDER BY date ASC
    `);
  }

  // For DJs: resolve each row through the lookup so fuzzy dj_user values
  // (username, full name, first name) all collapse to the right person.
  // For non-DJ staff: match directly by first-name prefix — simpler and
  // doesn't depend on the staff member existing in the users table with
  // a specific username format.
  const firstName = (dj.firstName || dj.username || '').toLowerCase();
  const djBookings: DigestBooking[] = rows
    .filter(row => {
      const rowDjUser = (row.dj_user ?? '').toString().trim();
      if (isDj) {
        const resolved = resolveDj(rowDjUser, djByKey);
        return resolved?.username === dj!.username;
      }
      return rowDjUser.toLowerCase().startsWith(firstName);
    })
    .map(row => ({
      id: row.id,
      clientName: row.client_name ?? null,
      eventType: row.event_type ?? null,
      date: typeof row.date === 'string' ? row.date : new Date(row.date).toISOString().slice(0, 10),
      time: row.time ?? null,
      location: row.location ?? null,
      notes: row.notes ?? null,
      contactEmail: row.contact_email ?? null,
      contactPhone: row.contact_phone ?? null,
    }));

  if (djBookings.length === 0) {
    return NextResponse.json(
      { success: false, error: `No upcoming bookings found for "${dj.username}"` },
      { status: 404 }
    );
  }

  const resend = getResend();
  const { subject, html, text } = renderDigestEmail({
    djFirstName: dj.firstName || dj.username || 'there',
    bookings: djBookings,
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
    console.error('[send-dj-reminder] Resend error:', sendResult.error);
    return NextResponse.json(
      { success: false, error: sendResult.error.message ?? 'Email send failed' },
      { status: 500 }
    );
  }

  await sql`
    INSERT INTO dj_email_sends (booking_id, dj_user, dj_email, email_type, resend_id)
    VALUES (NULL, ${dj.username}, ${dj.email}, 'manual-reminder', ${sendResult.data?.id ?? null})
    ON CONFLICT DO NOTHING
  `;

  return NextResponse.json({
    success: true,
    djUser: dj.username,
    email: dj.email,
    bookingCount: djBookings.length,
    resendId: sendResult.data?.id ?? null,
  });
}
