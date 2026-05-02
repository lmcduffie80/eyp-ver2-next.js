import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';
import { listFields, upsertField, deleteField } from '@/lib/smartFiles/repo';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const fields = await listFields(Number(id));
    return NextResponse.json({ success: true, data: fields });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to list fields' }, { status: 500 });
  }
}

// POST — upsert a field (create or update by key)
export async function POST(request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.key || !body.label) {
      return NextResponse.json({ success: false, error: 'key and label required' }, { status: 400 });
    }
    const field = await upsertField(Number(id), body);
    return NextResponse.json({ success: true, data: field });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to upsert field' }, { status: 500 });
  }
}

// DELETE — remove a field by key: /api/smart-files/[id]/fields?key=venue
export async function DELETE(request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const key = request.nextUrl.searchParams.get('key');
    if (!key) return NextResponse.json({ success: false, error: 'key query param required' }, { status: 400 });
    await deleteField(Number(id), key);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete field' }, { status: 500 });
  }
}
