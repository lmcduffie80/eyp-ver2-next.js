import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function DELETE() {
  try {
    // Delete all bookings
    await sql`DELETE FROM bookings`;
    
    // Delete all photography data
    await sql`DELETE FROM photography_photos`;
    await sql`DELETE FROM photography_projects`;
    
    // Delete all videography data
    await sql`DELETE FROM videography_videos`;
    await sql`DELETE FROM videography_projects`;
    
    // Note: Actual file deletion from S3/storage would require additional logic
    // and AWS SDK integration to delete physical files
    
    return NextResponse.json({
      success: true,
      message: 'All projects cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing all projects:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to clear projects' },
      { status: 500 }
    );
  }
}
