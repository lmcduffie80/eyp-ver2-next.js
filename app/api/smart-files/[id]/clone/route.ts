import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';
import { cloneFile, appendAuditEvent } from '@/lib/smartFiles/repo';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

// POST /api/smart-files/[id]/clone — duplicate as template or regular file
export async function POST(request: NextRequest, { params }: Params) {
  const { admin, response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    const { title, isTemplate } = body;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'title required' }, { status: 400 });
    }

    const cloned = await cloneFile(Number(id), {
      ownerUserId: admin.id,
      title: title.trim(),
      isTemplate: !!isTemplate,
    });

    await appendAuditEvent({
      fileId: cloned.id,
      actorType: 'admin',
      actorId: admin.username,
      event: 'file_cloned',
      payload: { sourceId: Number(id), isTemplate: !!isTemplate },
    });

    return NextResponse.json({ success: true, data: cloned }, { status: 201 });
  } catch (error) {
    console.error('POST /api/smart-files/[id]/clone error:', error);
    return NextResponse.json({ success: false, error: 'Failed to clone file' }, { status: 500 });
  }
}
