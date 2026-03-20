import { NextRequest, NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  try {
    // Check for admin authentication
    const cookieStore = await cookies();
    const userId = cookieStore.get('admin_session')?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Delete all analytics data
    const result = await sql`
      DELETE FROM analytics_visits
    `;
    
    const deletedCount = result.rowCount || 0;

    return NextResponse.json({
      success: true,
      deletedCount,
      message: `Deleted ${deletedCount} analytics records`
    });

  } catch (error: any) {
    console.error('Analytics clear error:', error);
    return NextResponse.json(
      { error: 'Failed to clear analytics', details: error.message },
      { status: 500 }
    );
  }
}
