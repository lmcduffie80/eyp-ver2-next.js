import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';
import { createBlock, reorderBlocks } from '@/lib/smartFiles/repo';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

// POST /api/smart-files/[id]/blocks — add a block to a page
export async function POST(request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await request.json();
    const { pageId, blockType, content, position } = body;

    if (!pageId || !blockType) {
      return NextResponse.json({ success: false, error: 'pageId and blockType required' }, { status: 400 });
    }

    const block = await createBlock({ pageId: Number(pageId), blockType, content: content ?? {}, position });
    return NextResponse.json({ success: true, data: block }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create block' }, { status: 500 });
  }
}

// PUT /api/smart-files/[id]/blocks — bulk reorder { items: [{id, position}] }
export async function PUT(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await request.json();
    const { items } = body;
    if (!Array.isArray(items)) return NextResponse.json({ success: false, error: 'items[] required' }, { status: 400 });
    await reorderBlocks(items);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to reorder blocks' }, { status: 500 });
  }
}
