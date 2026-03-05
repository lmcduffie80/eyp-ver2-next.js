import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';
import sql from '@/api-old/db/connection';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('dj_session');

    if (!sessionCookie?.value) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated', authenticated: false },
        { status: 401 }
      );
    }

    // Hash the raw token to look up in DB
    const tokenHash = createHash('sha256').update(sessionCookie.value).digest('hex');

    const result = await sql`
      SELECT s.id AS session_id, u.id, u.username, u.email, u.first_name, u.last_name, u.user_type
      FROM user_sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.token_hash = ${tokenHash}
        AND s.user_type = 'dj'
        AND s.expires_at > NOW()
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      cookieStore.delete('dj_session');
      return NextResponse.json(
        { success: false, message: 'Session invalid or expired', authenticated: false },
        { status: 401 }
      );
    }

    const { session_id, ...user } = result.rows[0];

    // Update last_used_at for activity tracking
    await sql`
      UPDATE user_sessions SET last_used_at = NOW() WHERE id = ${session_id}
    `;

    const displayName = (user.first_name && user.last_name)
      ? `${user.first_name} ${user.last_name}`
      : user.username;

    return NextResponse.json(
      {
        success: true,
        authenticated: true,
        user: user.username,
        displayName,
        userId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DJ verification error:', error);
    return NextResponse.json(
      { success: false, message: 'Verification failed', authenticated: false },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
