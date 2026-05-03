import { NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';

export const dynamic = 'force-dynamic';

export async function DELETE() {
  try {
    const guard = await requireAdmin();
    if ('response' in guard) return guard.response;

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
