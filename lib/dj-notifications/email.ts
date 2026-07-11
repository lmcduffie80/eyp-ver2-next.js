import { Resend } from 'resend';
import { signConfirmToken } from './token';
import { formatEventDate, reminderLabel, type ReminderType } from './schedule';

// Central config for all DJ notification emails.
// From: ey-productions.com is the domain verified in Resend (agrovus, LLC team).
// Reply-To / admin notify: Lee's real inbox on externallyyoursproductions.com.
export const NOTIFICATION_FROM = 'EYP <team@ey-productions.com>';
export const NOTIFICATION_REPLY_TO = 'Lee@externallyyoursproductions.com';
export const ADMIN_NOTIFY_TO = 'Lee@externallyyoursproductions.com';

export interface ReminderBooking {
  id: number;
  djUser: string;
  clientName: string | null;
  eventType: string | null;
  date: string;
  time: string | null;
  location: string | null;
}

export interface DigestBooking {
  id: number;
  clientName: string | null;
  eventType: string | null;
  date: string;
  time: string | null;
  location: string | null;
  notes: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
}

function baseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/+$/, '') ||
    'https://www.externallyyoursproductions.com'
  );
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[ch]!));
}

function projectTitle(b: { clientName: string | null; eventType: string | null }): string {
  const client = b.clientName?.trim();
  const type = b.eventType?.trim();

  // Some legacy/imported bookings have the exact same combined string
  // (e.g. "Client Name | DJ Entertainment | with lights") stored in both
  // client_name and event_type. Collapse that down to a single mention
  // instead of printing it twice.
  if (client && type) {
    if (client.toLowerCase() === type.toLowerCase()) return client;
    return `${client} — ${type}`;
  }
  if (client) return client;
  if (type) return type;
  return 'Upcoming project';
}

function eyLayout(inner: string, preheader: string): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Externally Yours Productions</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;color:#111827">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5">
      <tr>
        <td align="center" style="padding:32px 16px">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08)">
            <tr>
              <td style="background:#111827;padding:20px 24px;color:#ffffff">
                <div style="font-size:14px;letter-spacing:1px;color:#f97316;font-weight:600">EXTERNALLY YOURS PRODUCTIONS</div>
                <div style="font-size:12px;color:#9ca3af;margin-top:4px">DJ Notifications</div>
              </td>
            </tr>
            <tr><td style="padding:28px 28px 8px 28px">${inner}</td></tr>
            <tr>
              <td style="padding:20px 28px 28px 28px;color:#6b7280;font-size:12px;border-top:1px solid #e5e7eb">
                Questions? Reply to this email or contact
                <a href="mailto:${NOTIFICATION_REPLY_TO}" style="color:#f97316;text-decoration:none">${NOTIFICATION_REPLY_TO}</a>.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function confirmButton(url: string, label: string): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" style="margin:20px 0">
    <tr>
      <td style="border-radius:8px;background:#f97316">
        <a href="${url}" style="display:inline-block;padding:14px 28px;color:#ffffff;text-decoration:none;font-weight:600;font-size:16px">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}

function nl2br(s: string): string {
  return escapeHtml(s).replace(/\r?\n/g, '<br />');
}

function isDigestBooking(b: ReminderBooking | DigestBooking): b is DigestBooking {
  return 'notes' in b || 'contactEmail' in b || 'contactPhone' in b;
}

function bookingCard(b: ReminderBooking | DigestBooking, opts: { showDj?: boolean; djName?: string | null } = {}): string {
  const lines: string[] = [];
  lines.push(`<div style="font-size:16px;font-weight:600;color:#111827">${escapeHtml(projectTitle(b))}</div>`);
  lines.push(`<div style="font-size:14px;color:#374151;margin-top:6px">${escapeHtml(formatEventDate(b.date))}${b.time ? ` &middot; ${escapeHtml(b.time)}` : ''}</div>`);
  if (b.location) {
    lines.push(`<div style="font-size:13px;color:#6b7280;margin-top:4px">${escapeHtml(b.location)}</div>`);
  }
  if (opts.showDj && opts.djName) {
    lines.push(`<div style="font-size:13px;color:#6b7280;margin-top:4px">DJ: ${escapeHtml(opts.djName)}</div>`);
  }

  // Digest bookings carry client contact info + notes so DJs have everything
  // they need in the inbox without a login. Reminder bookings keep the compact
  // shape used in the countdown emails.
  if (isDigestBooking(b)) {
    const contactBits: string[] = [];
    if (b.contactEmail) {
      contactBits.push(
        `<a href="mailto:${escapeHtml(b.contactEmail)}" style="color:#f97316;text-decoration:none">${escapeHtml(b.contactEmail)}</a>`
      );
    }
    if (b.contactPhone) {
      contactBits.push(
        `<a href="tel:${escapeHtml(b.contactPhone.replace(/[^+\d]/g, ''))}" style="color:#f97316;text-decoration:none">${escapeHtml(b.contactPhone)}</a>`
      );
    }
    if (contactBits.length > 0) {
      lines.push(
        `<div style="font-size:13px;color:#374151;margin-top:10px"><span style="color:#6b7280">Client:</span> ${contactBits.join(' &middot; ')}</div>`
      );
    }

    const notes = (b.notes ?? '').trim();
    if (notes) {
      lines.push(
        `<div style="margin-top:12px;padding:10px 12px;border-left:3px solid #f97316;background:#fff7ed;border-radius:0 6px 6px 0">
          <div style="font-size:11px;letter-spacing:0.6px;color:#c2410c;font-weight:600;text-transform:uppercase">Client notes</div>
          <div style="font-size:13px;color:#374151;margin-top:4px;line-height:1.5">${nl2br(notes)}</div>
        </div>`
      );
    }
  }

  return `<div style="border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;margin:10px 0;background:#fafafa">${lines.join('')}</div>`;
}

// -----------------------------------------------------------------------------
// Reminder email (per booking, per DJ)
// -----------------------------------------------------------------------------

export function renderReminderEmail(args: {
  djFirstName: string;
  booking: ReminderBooking;
  reminderType: ReminderType;
  confirmUrl: string;
}): { subject: string; html: string; text: string } {
  const { djFirstName, booking, reminderType, confirmUrl } = args;
  const title = projectTitle(booking);
  const label = reminderLabel(reminderType);
  const preheader = `${label}: ${title} on ${formatEventDate(booking.date)}. Tap to confirm.`;

  const inner = `
    <div style="font-size:12px;color:#f97316;font-weight:600;letter-spacing:0.5px">${escapeHtml(label.toUpperCase())}</div>
    <h1 style="font-size:22px;margin:8px 0 12px 0;color:#111827">Hi ${escapeHtml(djFirstName)},</h1>
    <p style="font-size:15px;line-height:1.55;color:#374151;margin:0 0 12px 0">
      You have an upcoming project. Please tap <strong>Confirm</strong> so Lee knows you're locked in.
    </p>
    ${bookingCard(booking)}
    ${confirmButton(confirmUrl, "Confirm I'll be there")}
    <p style="font-size:13px;color:#6b7280;margin:12px 0 0 0">
      If anything about this booking looks wrong, reply to this email and Lee will sort it out.
    </p>
  `;

  const subject = `[${label}] ${title} — ${formatEventDate(booking.date)}`;
  const text = [
    `Hi ${djFirstName},`,
    '',
    `${label}: ${title}`,
    formatEventDate(booking.date) + (booking.time ? ` at ${booking.time}` : ''),
    booking.location ?? '',
    '',
    `Confirm you'll be there: ${confirmUrl}`,
    '',
    `Questions? Reply to this email or contact ${NOTIFICATION_REPLY_TO}.`,
  ].filter(Boolean).join('\n');

  return { subject, html: eyLayout(inner, preheader), text };
}

// -----------------------------------------------------------------------------
// Biweekly digest (per DJ, one email listing everything on their plate)
// -----------------------------------------------------------------------------

export function renderDigestEmail(args: {
  djFirstName: string;
  bookings: DigestBooking[];
}): { subject: string; html: string; text: string } {
  const { djFirstName, bookings } = args;

  const inner = `
    <div style="font-size:12px;color:#f97316;font-weight:600;letter-spacing:0.5px">YOUR UPCOMING PROJECTS</div>
    <h1 style="font-size:22px;margin:8px 0 12px 0;color:#111827">Hi ${escapeHtml(djFirstName)},</h1>
    <p style="font-size:15px;line-height:1.55;color:#374151;margin:0 0 16px 0">
      Here's every project on your calendar right now, with client contact info and notes
      so you have everything you need in one place. You'll get individual confirmation
      requests starting two weeks before each event.
    </p>
    ${bookings.map(b => bookingCard(b)).join('')}
    <p style="font-size:13px;color:#6b7280;margin:18px 0 0 0">
      See something missing or wrong? Just reply and let Lee know.
    </p>
  `;

  const subject = `Your upcoming EYP projects — ${bookings.length} on the calendar`;
  const preheader = `${bookings.length} project${bookings.length === 1 ? '' : 's'} with client contacts and notes`;

  const textBits: string[] = [`Hi ${djFirstName},`, '', 'Your upcoming EYP projects:'];
  for (const b of bookings) {
    textBits.push('');
    textBits.push(`- ${projectTitle(b)}`);
    textBits.push(`  Date: ${formatEventDate(b.date)}${b.time ? ` at ${b.time}` : ''}`);
    if (b.location) textBits.push(`  Location: ${b.location}`);
    if (b.contactEmail) textBits.push(`  Client email: ${b.contactEmail}`);
    if (b.contactPhone) textBits.push(`  Client phone: ${b.contactPhone}`);
    const notes = (b.notes ?? '').trim();
    if (notes) {
      textBits.push('  Notes:');
      for (const line of notes.split(/\r?\n/)) textBits.push(`    ${line}`);
    }
  }
  textBits.push('');
  textBits.push(`Reply to this email or contact ${NOTIFICATION_REPLY_TO} with any changes.`);
  const text = textBits.join('\n');

  return { subject, html: eyLayout(inner, preheader), text };
}

// -----------------------------------------------------------------------------
// Monthly long-range look-ahead (per DJ, everything on their calendar in the
// next 12 months). Same shape as the digest, but wider window and different
// framing/subject so DJs can tell them apart in the inbox.
// -----------------------------------------------------------------------------

function monthName(monthIndex: number): string {
  return ['January','February','March','April','May','June','July','August','September','October','November','December'][monthIndex] ?? '';
}

export function renderMonthlyEmail(args: {
  djFirstName: string;
  bookings: DigestBooking[];
  now?: Date;
}): { subject: string; html: string; text: string } {
  const { djFirstName, bookings } = args;
  const now = args.now ?? new Date();

  // Group by year-month so the email reads like a calendar.
  const groups = new Map<string, DigestBooking[]>();
  for (const b of bookings) {
    // b.date is 'YYYY-MM-DD' by the time it reaches here.
    const [year, mon] = b.date.split('-');
    const key = `${year}-${mon}`;
    const list = groups.get(key) ?? [];
    list.push(b);
    groups.set(key, list);
  }
  const orderedGroups = Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));

  const monthBlocks = orderedGroups.map(([key, list]) => {
    const [y, m] = key.split('-');
    const label = `${monthName(Number(m) - 1)} ${y}`;
    return `
      <div style="margin:22px 0 6px 0;font-size:13px;letter-spacing:1px;color:#6b7280;font-weight:600;text-transform:uppercase">${escapeHtml(label)} &middot; ${list.length}</div>
      ${list.map(b => bookingCard(b)).join('')}
    `;
  }).join('');

  const currentMonthLabel = `${monthName(now.getMonth())} ${now.getFullYear()}`;

  const inner = `
    <div style="font-size:12px;color:#f97316;font-weight:600;letter-spacing:0.5px">YOUR NEXT 12 MONTHS</div>
    <h1 style="font-size:22px;margin:8px 0 12px 0;color:#111827">Hi ${escapeHtml(djFirstName)},</h1>
    <p style="font-size:15px;line-height:1.55;color:#374151;margin:0 0 4px 0">
      Here is your long-range calendar as of <strong>${escapeHtml(currentMonthLabel)}</strong>: every project on the books over the next 12 months, grouped by month, with client contact info and notes so you can plan travel, gear, and time off.
    </p>
    <p style="font-size:14px;line-height:1.5;color:#6b7280;margin:0 0 8px 0">
      You will still receive the closer-in biweekly digest and week-of confirmation emails as event dates approach.
    </p>
    ${monthBlocks}
    <p style="font-size:13px;color:#6b7280;margin:18px 0 0 0">
      See something missing or wrong? Reply and Lee will sort it out.
    </p>
  `;

  const subject = `Your next 12 months at EYP — ${bookings.length} project${bookings.length === 1 ? '' : 's'} on the books`;
  const preheader = `${bookings.length} project${bookings.length === 1 ? '' : 's'} across the next 12 months, with client contacts and notes`;

  const textBits: string[] = [`Hi ${djFirstName},`, '', `Your EYP calendar for the next 12 months (as of ${currentMonthLabel}):`];
  for (const [key, list] of orderedGroups) {
    const [y, m] = key.split('-');
    textBits.push('');
    textBits.push(`== ${monthName(Number(m) - 1)} ${y} (${list.length}) ==`);
    for (const b of list) {
      textBits.push(`- ${projectTitle(b)}`);
      textBits.push(`  Date: ${formatEventDate(b.date)}${b.time ? ` at ${b.time}` : ''}`);
      if (b.location) textBits.push(`  Location: ${b.location}`);
      if (b.contactEmail) textBits.push(`  Client email: ${b.contactEmail}`);
      if (b.contactPhone) textBits.push(`  Client phone: ${b.contactPhone}`);
      const notes = (b.notes ?? '').trim();
      if (notes) {
        textBits.push('  Notes:');
        for (const line of notes.split(/\r?\n/)) textBits.push(`    ${line}`);
      }
    }
  }
  textBits.push('');
  textBits.push(`Reply to this email or contact ${NOTIFICATION_REPLY_TO} with any changes.`);
  const text = textBits.join('\n');

  return { subject, html: eyLayout(inner, preheader), text };
}

// -----------------------------------------------------------------------------
// Admin notification when a DJ confirms
// -----------------------------------------------------------------------------

export function renderAdminConfirmationEmail(args: {
  djName: string;
  djEmail: string | null;
  booking: ReminderBooking;
  reminderType: string | null;
}): { subject: string; html: string; text: string } {
  const { djName, djEmail, booking, reminderType } = args;
  const title = projectTitle(booking);

  const inner = `
    <div style="font-size:12px;color:#16a34a;font-weight:600;letter-spacing:0.5px">DJ CONFIRMED</div>
    <h1 style="font-size:22px;margin:8px 0 12px 0;color:#111827">${escapeHtml(djName)} confirmed</h1>
    <p style="font-size:15px;line-height:1.55;color:#374151;margin:0 0 12px 0">
      ${escapeHtml(djName)} just clicked confirm on:
    </p>
    ${bookingCard(booking)}
    <p style="font-size:13px;color:#6b7280;margin:12px 0 0 0">
      ${djEmail ? `DJ email: <a href="mailto:${escapeHtml(djEmail)}" style="color:#f97316;text-decoration:none">${escapeHtml(djEmail)}</a><br />` : ''}
      ${reminderType ? `From reminder: <code>${escapeHtml(reminderType)}</code>` : ''}
    </p>
  `;

  const subject = `[Confirmed] ${djName} — ${title} on ${formatEventDate(booking.date)}`;
  const text = [
    `${djName} confirmed:`,
    `${title} — ${formatEventDate(booking.date)}`,
    booking.location ?? '',
    djEmail ? `DJ email: ${djEmail}` : '',
    reminderType ? `From reminder: ${reminderType}` : '',
  ].filter(Boolean).join('\n');

  return { subject, html: eyLayout(inner, `${djName} confirmed ${title}`), text };
}

// -----------------------------------------------------------------------------
// Admin alert when a booking's dj_user cannot be resolved to an email
// -----------------------------------------------------------------------------

export function renderNoEmailAlertEmail(args: { booking: ReminderBooking }): {
  subject: string; html: string; text: string;
} {
  const { booking } = args;
  const title = projectTitle(booking);

  const inner = `
    <div style="font-size:12px;color:#dc2626;font-weight:600;letter-spacing:0.5px">NO DJ EMAIL FOUND</div>
    <h1 style="font-size:22px;margin:8px 0 12px 0;color:#111827">Reminders can't be sent for this booking</h1>
    <p style="font-size:15px;line-height:1.55;color:#374151;margin:0 0 12px 0">
      The DJ notification cron tried to reach the DJ for this booking but couldn't find
      a matching user record with an email.
    </p>
    ${bookingCard(booking, { showDj: true, djName: booking.djUser })}
    <p style="font-size:13px;color:#6b7280;margin:12px 0 0 0">
      Fix: add or update the DJ in the users table so their <code>first_name</code>,
      <code>last_name</code>, or <code>username</code> matches "<strong>${escapeHtml(booking.djUser)}</strong>",
      and make sure their email is filled in.
    </p>
  `;

  const subject = `[EYP] No DJ email on file for ${title}`;
  const text = [
    `Cannot send DJ reminders for: ${title}`,
    `Date: ${formatEventDate(booking.date)}`,
    `dj_user value on booking: "${booking.djUser}"`,
    '',
    `Fix by matching this to a users row with an email and user_type='dj'.`,
  ].join('\n');

  return { subject, html: eyLayout(inner, `No DJ email for ${title}`), text };
}

// -----------------------------------------------------------------------------
// URL builder used everywhere the cron generates confirm buttons
// -----------------------------------------------------------------------------

export function buildConfirmUrl(bookingId: number, djUser: string, emailType: ReminderType): string {
  const token = signConfirmToken({ bookingId, djUser, emailType });
  return `${baseUrl()}/dj-confirm?token=${encodeURIComponent(token)}`;
}

// -----------------------------------------------------------------------------
// Resend client
// -----------------------------------------------------------------------------

export function getResend(): Resend {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  return new Resend(key);
}
