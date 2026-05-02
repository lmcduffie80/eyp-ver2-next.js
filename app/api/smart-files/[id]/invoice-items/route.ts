import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';
import { listInvoiceItems, upsertInvoiceItem, deleteInvoiceItem } from '@/lib/smartFiles/repo';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const { id } = await params;
    const items = await listInvoiceItems(Number(id));
    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to list invoice items' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.description || body.unitPrice === undefined) {
      return NextResponse.json({ success: false, error: 'description and unitPrice required' }, { status: 400 });
    }
    const item = await upsertInvoiceItem(Number(id), body);
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to upsert invoice item' }, { status: 500 });
  }
}

// DELETE ?itemId=123
export async function DELETE(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const itemId = request.nextUrl.searchParams.get('itemId');
    if (!itemId) return NextResponse.json({ success: false, error: 'itemId required' }, { status: 400 });
    await deleteInvoiceItem(Number(itemId));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete invoice item' }, { status: 500 });
  }
}
