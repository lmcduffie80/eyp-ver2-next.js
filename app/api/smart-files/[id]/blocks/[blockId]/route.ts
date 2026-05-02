import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';
import { updateBlock, deleteBlock } from '@/lib/smartFiles/repo';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string; blockId: string }> };

// PATCH /api/smart-files/[id]/blocks/[blockId]
export async function PATCH(request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { blockId } = await params;
    const body = await request.json();
    const updated = await updateBlock(Number(blockId), body);
    if (!updated) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update block' }, { status: 500 });
  }
}

// DELETE /api/smart-files/[id]/blocks/[blockId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { blockId } = await params;
    const deleted = await deleteBlock(Number(blockId));
    if (!deleted) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete block' }, { status: 500 });
  }
}
