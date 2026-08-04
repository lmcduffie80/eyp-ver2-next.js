/**
 * One-off: send the DJ digest right now, to every DJ with upcoming projects.
 *
 * Runs the same query and template as `/api/cron/dj-digest` but against the
 * local DATABASE_URL / RESEND_API_KEY. Uses the `dj_email_sends` table for
 * idempotency, so the scheduled cron won't double-send on the same day if it
 * runs later.
 *
 * Usage:
 *   pnpm exec tsx scripts/send-dj-digest-now.ts             # sends
 *   pnpm exec tsx scripts/send-dj-digest-now.ts --dry-run   # prints only
 */

import sql from '@/api-old/db/connection';
import { normalizeRows } from '@/lib/db-utils';
import { loadDjLookup, resolveDj, type DjRecord } from '@/lib/dj-notifications/djLookup';
import {
  NOTIFICATION_FROM,
  NOTIFICATION_REPLY_TO,
  getResend,
  renderDigestEmail,
  type DigestBooking,
} from '@/lib/dj-notifications/email';

const DIGEST_TYPE = 'digest';
const DRY_RUN = process.argv.includes('--dry-run');

async function main() {
  console.log(`[send-dj-digest-now] Starting${DRY_RUN ? ' (DRY RUN)' : ''}...`);

  const { byKey, all } = await loadDjLookup();
  console.log(`[send-dj-digest-now] Loaded ${all.length} DJ records with email:`);
  for (const dj of all) {
    console.log(`  - ${dj.firstName ?? ''} ${dj.lastName ?? ''} <${dj.email}> (username=${dj.username})`);
  }

  const rows = normalizeRows(await sql`
    SELECT id, dj_user, client_name, event_type, date, time, location,
           notes, contact_email, contact_phone
    FROM bookings
    WHERE date >= CURRENT_DATE
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
  console.log(`\n[send-dj-digest-now] Found ${rows.length} upcoming booking(s) (all future dates).`);

  const bookingsByDj = new Map<string, { dj: DjRecord; bookings: DigestBooking[] }>();
  const unresolved: string[] = [];

  for (const row of rows) {
    const djUserRaw = (row.dj_user ?? '').toString().trim();
    const dj = resolveDj(djUserRaw, byKey);
    if (!dj) {
      unresolved.push(`booking ${row.id}: dj_user="${djUserRaw}"`);
      continue;
    }

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

  if (unresolved.length > 0) {
    console.log(`\n[send-dj-digest-now] Skipped ${unresolved.length} booking(s) with no matching DJ record:`);
    for (const u of unresolved) console.log(`  - ${u}`);
  }

  console.log(`\n[send-dj-digest-now] Grouped into ${bookingsByDj.size} DJ(s) with projects:`);
  for (const [, { dj, bookings }] of bookingsByDj) {
    console.log(`  - ${dj.firstName ?? dj.username} <${dj.email}>: ${bookings.length} project(s)`);
    for (const b of bookings) {
      const notesPreview = (b.notes ?? '').trim().slice(0, 60);
      console.log(
        `     · #${b.id} ${b.date}${b.time ? ' ' + b.time : ''} — ${b.clientName ?? '?'} / ${b.eventType ?? '?'}` +
        (notesPreview ? ` [notes: ${notesPreview}${(b.notes ?? '').length > 60 ? '…' : ''}]` : '')
      );
    }
  }

  if (DRY_RUN) {
    console.log('\n[send-dj-digest-now] DRY RUN — no emails sent, no DB writes.');
    return;
  }

  if (bookingsByDj.size === 0) {
    console.log('\n[send-dj-digest-now] Nobody to email. Done.');
    return;
  }

  const resend = getResend();
  const results = { sent: 0, skippedAlreadySent: 0, errors: [] as { djUser: string; error: string }[] };

  for (const [, { dj, bookings }] of bookingsByDj) {
    const already = normalizeRows(await sql`
      SELECT 1 FROM dj_email_sends
      WHERE booking_id IS NULL
        AND dj_user = ${dj.username}
        AND email_type = ${DIGEST_TYPE}
        AND sent_at::date = CURRENT_DATE
      LIMIT 1
    `);
    if (already.length > 0) {
      console.log(`\n[send-dj-digest-now] SKIP ${dj.username} — already sent digest today.`);
      results.skippedAlreadySent++;
      continue;
    }

    try {
      const { subject, html, text } = renderDigestEmail({
        djFirstName: dj.firstName || dj.username || 'there',
        bookings,
      });

      console.log(`\n[send-dj-digest-now] Sending to ${dj.email} (${bookings.length} project(s))...`);
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
      console.log(`   -> Resend id: ${resendId}`);

      await sql`
        INSERT INTO dj_email_sends (booking_id, dj_user, dj_email, email_type, resend_id)
        VALUES (NULL, ${dj.username}, ${dj.email}, ${DIGEST_TYPE}, ${resendId})
        ON CONFLICT DO NOTHING
      `;
      results.sent++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`   -> FAILED for ${dj.username}: ${msg}`);
      results.errors.push({ djUser: dj.username, error: msg });
    }
  }

  console.log('\n[send-dj-digest-now] Done.');
  console.log(JSON.stringify(results, null, 2));
}

main().then(
  () => process.exit(0),
  err => {
    console.error('[send-dj-digest-now] Fatal:', err);
    process.exit(1);
  }
);
