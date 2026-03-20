import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { cookies } from 'next/headers';

export async function DELETE() {
  try {
    // CRITICAL: Check for admin authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('admin_session')?.value;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // Delete all bookings only
    await sql`DELETE FROM bookings`;

    return NextResponse.json({
      success: true,
      message: 'All booking projects cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing booking projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear projects' },
      { status: 500 }
    );
  }
}
