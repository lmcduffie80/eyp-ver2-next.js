import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function DELETE() {
  try {
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
