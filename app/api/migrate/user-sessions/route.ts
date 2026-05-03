import { NextResponse } from 'next/server';
import { getConnection } from '@/api-old/db/connection';

export const dynamic = 'force-dynamic';

// One-time idempotent migration: creates user_sessions table if it doesn't exist.
export async function POST() {
  let client;
  try {
    client = await getConnection();

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token_hash TEXT NOT NULL UNIQUE,
        user_type TEXT NOT NULL CHECK (user_type IN ('admin', 'dj')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        last_used_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_token_hash ON user_sessions(token_hash);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
    `);

    return NextResponse.json({ success: true, message: 'user_sessions table ready' });
  } catch (error) {
    console.error('[migrate/user-sessions] Error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    if (client) client.release();
  }
}
