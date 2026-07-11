/**
 * One-off data cleanup for the bookings table:
 *
 * 1. Delete known duplicate booking rows (same client_name + date + dj_user,
 *    created minutes/hours apart from a bad import re-run). Always keeps the
 *    lower/older id, which has equal-or-more-complete data in every pair.
 *
 * 2. Split the combined "Client Name | Event Type | detail" string that was
 *    dumped into BOTH client_name and event_type back into proper columns.
 *    Any third+ segment (e.g. "with lights") is preserved by prepending a
 *    "Lighting: ..." line to notes, unless that text is already present in
 *    notes (many rows already have the full original questionnaire text
 *    there, in which case we don't want to duplicate it again).
 *
 * Usage:
 *   node --env-file=.env.local --import tsx scripts/cleanup-bookings-data.ts --dry-run
 *   node --env-file=.env.local --import tsx scripts/cleanup-bookings-data.ts
 */

import sql from '@/api-old/db/connection';
import { normalizeRows } from '@/lib/db-utils';

const DRY_RUN = process.argv.includes('--dry-run');

// Higher id in each duplicate pair, confirmed against created_at + notes
// completeness (the surviving lower id always has equal-or-richer data).
const DUPLICATE_IDS_TO_DELETE = [242, 243, 244, 245, 246, 247, 489, 490];

async function main() {
  console.log(`[cleanup-bookings] Starting${DRY_RUN ? ' (DRY RUN)' : ''}...`);

  // --- Step 1: duplicates -----------------------------------------------
  const dupRows = normalizeRows(await sql`
    SELECT id, client_name, date, dj_user FROM bookings
    WHERE id = ANY(${DUPLICATE_IDS_TO_DELETE})
    ORDER BY id
  `);
  console.log(`\n[cleanup-bookings] Will delete ${dupRows.length} duplicate booking row(s):`);
  for (const r of dupRows) {
    console.log(`  - id=${r.id} "${r.client_name}" date=${r.date} dj=${r.dj_user}`);
  }

  if (!DRY_RUN) {
    const del = await sql`
      DELETE FROM bookings WHERE id = ANY(${DUPLICATE_IDS_TO_DELETE})
    `;
    console.log(`[cleanup-bookings] Deleted ${(del as any).rowCount ?? dupRows.length} row(s).`);
  }

  // --- Step 2: split client_name/event_type -------------------------------
  const rows = normalizeRows(await sql`
    SELECT id, client_name, event_type, notes
    FROM bookings
    WHERE client_name IS NOT NULL
      AND event_type IS NOT NULL
      AND lower(trim(client_name)) = lower(trim(event_type))
      AND NOT (id = ANY(${DUPLICATE_IDS_TO_DELETE}))
    ORDER BY id
  `);
  console.log(`\n[cleanup-bookings] Will split ${rows.length} booking(s) with duplicated client_name/event_type:`);

  let updated = 0;
  for (const row of rows) {
    const raw: string = (row.client_name ?? '').toString();
    const segments = raw.split('|').map(s => s.trim()).filter(Boolean);

    const newClientName = segments[0] ?? raw.trim();
    const newEventType = segments[1] ?? null;
    const extra = segments.slice(2).join(' | ').trim() || null;

    let newNotes: string | null = row.notes ?? null;
    if (extra) {
      const alreadyThere = newNotes && newNotes.toLowerCase().includes(extra.toLowerCase());
      if (!alreadyThere) {
        newNotes = newNotes ? `Lighting: ${extra}\n\n${newNotes}` : `Lighting: ${extra}`;
      }
    }

    console.log(
      `  - id=${row.id}: client_name="${newClientName}" event_type="${newEventType}"` +
      (extra ? ` extra="${extra}"` : '') +
      (newNotes !== (row.notes ?? null) ? ' [notes updated]' : '')
    );

    if (!DRY_RUN) {
      await sql`
        UPDATE bookings
        SET client_name = ${newClientName},
            event_type = ${newEventType},
            notes = ${newNotes},
            updated_at = NOW()
        WHERE id = ${row.id}
      `;
      updated++;
    }
  }

  if (DRY_RUN) {
    console.log('\n[cleanup-bookings] DRY RUN — no writes made.');
  } else {
    console.log(`\n[cleanup-bookings] Done. Updated ${updated} booking(s), deleted ${dupRows.length} duplicate(s).`);
  }
}

main().then(
  () => process.exit(0),
  err => {
    console.error('[cleanup-bookings] Fatal:', err);
    process.exit(1);
  }
);
