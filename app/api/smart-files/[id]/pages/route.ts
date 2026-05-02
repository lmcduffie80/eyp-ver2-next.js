import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';
import { listPages, createPage, reorderPages } from '@/lib/smartFiles/repo';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

// GET /api/smart-files/[id]/pages
export async function GET(_req: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const pages = await listPages(Number(id));
    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to list pages' }, { status: 500 });
  }
}

// POST /api/smart-files/[id]/pages — add a page
export async function POST(request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    const { pageType, title, position, settings } = body;
    if (!pageType) return NextResponse.json({ success: false, error: 'pageType required' }, { status: 400 });

    const page = await createPage({ fileId: Number(id), pageType, title, position, settings });
    return NextResponse.json({ success: true, data: page }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create page' }, { status: 500 });
  }
}

// PUT /api/smart-files/[id]/pages — bulk reorder { items: [{id, position}] }
export async function PUT(request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await request.json();
    const { items } = body;
    if (!Array.isArray(items)) return NextResponse.json({ success: false, error: 'items[] required' }, { status: 400 });
    await reorderPages(items);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to reorder pages' }, { status: 500 });
  }
}
