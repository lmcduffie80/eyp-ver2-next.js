import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createHash } from 'crypto';
import sql from '@/api-old/db/connection';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('dj_session');

    if (sessionCookie?.value) {
      const tokenHash = createHash('sha256').update(sessionCookie.value).digest('hex');
      await sql`DELETE FROM user_sessions WHERE token_hash = ${tokenHash}`.catch(() => {});
    }

    cookieStore.delete('dj_session');

    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('DJ logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
