import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    // Debug logging
    const cookieHeader = request.headers.get('cookie') || '';
    console.log('[clear-all-projects] Cookie header present:', cookieHeader.length > 0);
    console.log('[clear-all-projects] admin_session cookie present:', !!sessionToken);

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in to the admin dashboard first' },
        { status: 401 }
      );
    }

    // Validate the session token against the database
    const hashedToken = hashToken(sessionToken);
    const sessionResult = await sql`
      SELECT user_id FROM user_sessions 
      WHERE token_hash = ${hashedToken} 
        AND expires_at > NOW()
      LIMIT 1
    `;

    if (sessionResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Session expired - Please log in again' },
        { status: 401 }
      );
    }

    // Delete all bookings
    const result = await sql`DELETE FROM bookings`;
    console.log('[clear-all-projects] Deleted rows:', result.rowCount);

    return NextResponse.json({
      success: true,
      message: 'All booking projects cleared successfully'
    });
  } catch (error) {
    console.error('[clear-all-projects] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear projects' },
      { status: 500 }
    );
  }
}
