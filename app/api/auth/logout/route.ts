import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';
import sql from '@/api-old/db/connection';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Delete admin session from DB if present
    const adminSession = cookieStore.get('admin_session');
    if (adminSession?.value) {
      const tokenHash = createHash('sha256').update(adminSession.value).digest('hex');
      await sql`DELETE FROM user_sessions WHERE token_hash = ${tokenHash}`.catch(() => {});
    }

    // Delete DJ session from DB if present
    const djSession = cookieStore.get('dj_session');
    if (djSession?.value) {
      const tokenHash = createHash('sha256').update(djSession.value).digest('hex');
      await sql`DELETE FROM user_sessions WHERE token_hash = ${tokenHash}`.catch(() => {});
    }

    // Clear all session cookies
    cookieStore.delete('admin_session');
    cookieStore.delete('admin_user_id');
    cookieStore.delete('dj_session');

    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
