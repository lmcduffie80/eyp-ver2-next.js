import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';
import { updatePage, deletePage, listBlocks } from '@/lib/smartFiles/repo';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string; pageId: string }> };

// GET /api/smart-files/[id]/pages/[pageId] — page + its blocks
export async function GET(_req: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { pageId } = await params;
    const blocks = await listBlocks(Number(pageId));
    return NextResponse.json({ success: true, data: { blocks } });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch page' }, { status: 500 });
  }
}

// PATCH /api/smart-files/[id]/pages/[pageId]
export async function PATCH(request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { pageId } = await params;
    const body = await request.json();
    const updated = await updatePage(Number(pageId), body);
    if (!updated) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update page' }, { status: 500 });
  }
}

// DELETE /api/smart-files/[id]/pages/[pageId]
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { pageId } = await params;
    const deleted = await deletePage(Number(pageId));
    if (!deleted) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete page' }, { status: 500 });
  }
}
