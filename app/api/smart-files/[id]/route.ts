import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';
import { getFileDetail, updateFile, deleteFile, appendAuditEvent } from '@/lib/smartFiles/repo';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

// GET /api/smart-files/[id] — full detail (pages + blocks + fields + signatures)
export async function GET(_req: NextRequest, { params }: Params) {
  const { admin, response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const file = await getFileDetail(Number(id));
    if (!file) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: file });
  } catch (error) {
    console.error('GET /api/smart-files/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch file' }, { status: 500 });
  }
}

// PATCH /api/smart-files/[id] — update metadata / theme / status
export async function PATCH(request: NextRequest, { params }: Params) {
  const { admin, response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateFile(Number(id), body);
    if (!updated) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    await appendAuditEvent({
      fileId: Number(id),
      actorType: 'admin',
      actorId: admin.username,
      event: 'file_updated',
      payload: { fields: Object.keys(body) },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('PATCH /api/smart-files/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to update file' }, { status: 500 });
  }
}

// DELETE /api/smart-files/[id] — delete file and all children
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { admin, response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const deleted = await deleteFile(Number(id));
    if (!deleted) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/smart-files/[id] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete file' }, { status: 500 });
  }
}
