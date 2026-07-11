import { NextRequest, NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { normalizeRows } from '@/lib/db-utils';
import { loadDjLookup, resolveDj } from '@/lib/dj-notifications/djLookup';
import {
  daysUntilEvent,
  reminderTypeForDaysOut,
  type ReminderType,
} from '@/lib/dj-notifications/schedule';
import {
  ADMIN_NOTIFY_TO,
  NOTIFICATION_FROM,
  NOTIFICATION_REPLY_TO,
  buildConfirmUrl,
  getResend,
  renderNoEmailAlertEmail,
  renderReminderEmail,
  type ReminderBooking,
} from '@/lib/dj-notifications/email';

export const dynamic = 'force-dynamic';

function verifyCron(req: NextRequest): boolean {
  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${process.env.CRON_SECRET ?? ''}`;
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  if (!verifyCron(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const resend = getResend();
  const now = new Date();

  const results = {
    considered: 0,
    sent: 0,
    skippedAlreadySent: 0,
    skippedNoMatchingReminder: 0,
    skippedAlreadyConfirmed: 0,
    adminAlertsSent: 0,
    errors: [] as { bookingId: number; error: string }[],
  };

  // Pull every booking in the next 15 days. Milestone emails fire at exactly
  // 14/7/3/1 days out; every other day inside that 14-day window gets a daily
  // nag reminder instead, for as long as the DJ hasn't confirmed. If the cron
  // misses a day the UNIQUE constraint still keeps sends idempotent when it
  // runs later.
  const upcomingRows = normalizeRows(await sql`
    SELECT id, dj_user, client_name, event_type, date, time, location
    FROM bookings
    WHERE date >= CURRENT_DATE
      AND date <= CURRENT_DATE + INTERVAL '15 days'
    ORDER BY date ASC
  `);

  const { byKey } = await loadDjLookup();

  for (const row of upcomingRows) {
    results.considered++;

    const bookingId: number = row.id;
    const djUserRaw: string = (row.dj_user ?? '').toString().trim();
    const days = daysUntilEvent(row.date, now);
    const reminderType = reminderTypeForDaysOut(days, now);

    if (!reminderType) {
      results.skippedNoMatchingReminder++;
      continue;
    }

    const booking: ReminderBooking = {
      id: bookingId,
      djUser: djUserRaw,
      clientName: row.client_name ?? null,
      eventType: row.event_type ?? null,
      date: typeof row.date === 'string' ? row.date : new Date(row.date).toISOString().slice(0, 10),
      time: row.time ?? null,
      location: row.location ?? null,
    };

    // Already confirmed? Don't nag.
    const confirmed = normalizeRows(await sql`
      SELECT 1 FROM dj_confirmations
      WHERE booking_id = ${bookingId} AND dj_user = ${djUserRaw} LIMIT 1
    `);
    if (confirmed.length > 0) {
      results.skippedAlreadyConfirmed++;
      continue;
    }

    // Resolve DJ email.
    const dj = resolveDj(djUserRaw, byKey);
    if (!dj) {
      const alerted = await sendNoEmailAlertOnce(resend, bookingId, booking);
      if (alerted) results.adminAlertsSent++;
      continue;
    }

    // Already sent this reminder for this booking + DJ? Skip.
    const already = normalizeRows(await sql`
      SELECT 1 FROM dj_email_sends
      WHERE booking_id = ${bookingId}
        AND dj_user = ${djUserRaw}
        AND email_type = ${reminderType}
      LIMIT 1
    `);
    if (already.length > 0) {
      results.skippedAlreadySent++;
      continue;
    }

    try {
      const confirmUrl = buildConfirmUrl(bookingId, djUserRaw, reminderType);
      const { subject, html, text } = renderReminderEmail({
        djFirstName: dj.firstName || dj.username || 'there',
        booking,
        reminderType,
        confirmUrl,
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
        VALUES (${bookingId}, ${djUserRaw}, ${dj.email}, ${reminderType}, ${resendId})
        ON CONFLICT DO NOTHING
      `;
      results.sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[dj-reminders] Failed for booking ${bookingId}:`, msg);
      results.errors.push({ bookingId, error: msg });
    }
  }

  return NextResponse.json({ success: true, ...results });
}

async function sendNoEmailAlertOnce(
  resend: ReturnType<typeof getResend>,
  bookingId: number,
  booking: ReminderBooking
): Promise<boolean> {
  const reason = 'no_dj_email';

  // Skip if we've already alerted for this booking.
  const already = normalizeRows(await sql`
    SELECT 1 FROM dj_email_admin_alerts
    WHERE booking_id = ${bookingId} AND reason = ${reason} LIMIT 1
  `);
  if (already.length > 0) return false;

  try {
    const { subject, html, text } = renderNoEmailAlertEmail({ booking });
    await resend.emails.send({
      from: NOTIFICATION_FROM,
      to: ADMIN_NOTIFY_TO,
      replyTo: NOTIFICATION_REPLY_TO,
      subject,
      html,
      text,
    });

    await sql`
      INSERT INTO dj_email_admin_alerts (booking_id, dj_user, reason)
      VALUES (${bookingId}, ${booking.djUser}, ${reason})
      ON CONFLICT DO NOTHING
    `;
    return true;
  } catch (err) {
    console.error(`[dj-reminders] Admin alert failed for booking ${bookingId}:`, err);
    return false;
  }
}
