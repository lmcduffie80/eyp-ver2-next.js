import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session')?.value;

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    const result = await sql`
      DELETE FROM bookings
      WHERE archived = FALSE OR archived IS NULL
    `;
    console.log('[clear-all-projects] Deleted rows:', result.rowCount);

    return NextResponse.json({
      success: true,
      message: 'Active bookings cleared. Archived bookings preserved.',
      deleted: result.rowCount ?? 0
    });
  } catch (error) {
    console.error('[clear-all-projects] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear projects' },
      { status: 500 }
    );
  }
}
