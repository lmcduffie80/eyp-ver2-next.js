import { NextRequest, NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { normalizeRows } from '@/lib/db-utils';
import { verifyConfirmToken } from '@/lib/dj-notifications/token';
import { loadDjLookup, resolveDj } from '@/lib/dj-notifications/djLookup';
import {
  ADMIN_NOTIFY_TO,
  NOTIFICATION_FROM,
  NOTIFICATION_REPLY_TO,
  getResend,
  renderAdminConfirmationEmail,
  type ReminderBooking,
} from '@/lib/dj-notifications/email';

export const dynamic = 'force-dynamic';

interface ConfirmResponse {
  success: boolean;
  alreadyConfirmed?: boolean;
  error?: string;
}

async function confirm(token: string): Promise<{ status: number; body: ConfirmResponse }> {
  const payload = verifyConfirmToken(token);
  if (!payload) {
    return { status: 400, body: { success: false, error: 'Invalid or expired confirmation link' } };
  }

  const { bookingId, djUser, emailType } = payload;

  const bookingRows = normalizeRows(await sql`
    SELECT id, dj_user, client_name, event_type, date, time, location
    FROM bookings
    WHERE id = ${bookingId} LIMIT 1
  `);
  if (bookingRows.length === 0) {
    return { status: 404, body: { success: false, error: 'Booking not found' } };
  }
  const row = bookingRows[0];

  const booking: ReminderBooking = {
    id: row.id,
    djUser: row.dj_user,
    clientName: row.client_name ?? null,
    eventType: row.event_type ?? null,
    date: typeof row.date === 'string' ? row.date : new Date(row.date).toISOString().slice(0, 10),
    time: row.time ?? null,
    location: row.location ?? null,
  };

  // Idempotency: if there's already a confirmation for this booking + DJ, just
  // acknowledge and skip the admin email.
  const existing = normalizeRows(await sql`
    SELECT 1 FROM dj_confirmations
    WHERE booking_id = ${bookingId} AND dj_user = ${djUser} LIMIT 1
  `);
  if (existing.length > 0) {
    return { status: 200, body: { success: true, alreadyConfirmed: true } };
  }

  const { byKey } = await loadDjLookup();
  const dj = resolveDj(djUser, byKey);
  const djEmail = dj?.email ?? null;
  const djName = dj
    ? (dj.firstName && dj.lastName ? `${dj.firstName} ${dj.lastName}` : dj.username)
    : djUser;

  await sql`
    INSERT INTO dj_confirmations (booking_id, dj_user, dj_email, confirmed_from_email_type)
    VALUES (${bookingId}, ${djUser}, ${djEmail}, ${emailType})
    ON CONFLICT (booking_id, dj_user) DO NOTHING
  `;

  // Fire-and-forget admin notification. Never let this fail the confirm.
  try {
    const resend = getResend();
    const { subject, html, text } = renderAdminConfirmationEmail({
      djName,
      djEmail,
      booking,
      reminderType: emailType,
    });
    await resend.emails.send({
      from: NOTIFICATION_FROM,
      to: ADMIN_NOTIFY_TO,
      replyTo: djEmail ?? NOTIFICATION_REPLY_TO,
      subject,
      html,
      text,
    });
  } catch (err) {
    console.error('[dj-confirm] Failed to notify Lee:', err);
  }

  return { status: 200, body: { success: true, alreadyConfirmed: false } };
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let token = '';
  try {
    const body = await req.json().catch(() => null);
    token = body?.token ?? '';
  } catch {
    // fall through
  }
  if (!token) {
    const url = new URL(req.url);
    token = url.searchParams.get('token') ?? '';
  }
  if (!token) {
    return NextResponse.json({ success: false, error: 'Missing token' }, { status: 400 });
  }

  const { status, body } = await confirm(token);
  return NextResponse.json(body, { status });
}
