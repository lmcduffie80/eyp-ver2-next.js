import { NextResponse } from 'next/server';
import { getConnection } from '@/api-old/db/connection';

export const dynamic = 'force-dynamic';

// Idempotent migration for DJ notification tables.
export async function POST() {
  let client;
  try {
    client = await getConnection();

    await client.query(`
      CREATE TABLE IF NOT EXISTS dj_email_sends (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER REFERENCES bookings(id) ON DELETE CASCADE,
        dj_user TEXT NOT NULL,
        dj_email TEXT NOT NULL,
        email_type TEXT NOT NULL,
        resend_id TEXT,
        sent_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS uniq_dj_email_sends_booking
        ON dj_email_sends (booking_id, dj_user, email_type)
        WHERE booking_id IS NOT NULL
    `);

    // Digest dedup is enforced at the application layer (dj-digest cron)
    // because Postgres won't accept sent_at::date in a unique-index predicate
    // (it isn't IMMUTABLE). A plain btree index still speeds up the lookup.
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_dj_email_sends_digest_lookup
        ON dj_email_sends (dj_user, email_type, sent_at DESC)
        WHERE booking_id IS NULL
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_dj_email_sends_sent_at
        ON dj_email_sends (sent_at DESC)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS dj_confirmations (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        dj_user TEXT NOT NULL,
        dj_email TEXT,
        confirmed_at TIMESTAMPTZ DEFAULT NOW(),
        confirmed_from_email_type TEXT,
        UNIQUE (booking_id, dj_user)
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_dj_confirmations_booking
        ON dj_confirmations (booking_id)
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS dj_email_admin_alerts (
        id SERIAL PRIMARY KEY,
        booking_id INTEGER NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        dj_user TEXT NOT NULL,
        reason TEXT NOT NULL,
        sent_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE (booking_id, reason)
      )
    `);

    return NextResponse.json({ success: true, message: 'DJ notification tables ready' });
  } catch (error) {
    console.error('[migrate/dj-notifications] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
