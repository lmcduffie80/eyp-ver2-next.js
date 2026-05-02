import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';
import { listFiles, createFile, cloneFile } from '@/lib/smartFiles/repo';
import { appendAuditEvent } from '@/lib/smartFiles/repo';

export const dynamic = 'force-dynamic';

// GET /api/smart-files — list all Smart Files
export async function GET(request: NextRequest) {
  const { admin, response } = await requireAdmin();
  if (response) return response;

  try {
    const sp = request.nextUrl.searchParams;
    const files = await listFiles({
      isTemplate: sp.has('templates') ? sp.get('templates') === 'true' : undefined,
      status: sp.get('status') ?? undefined,
      search: sp.get('q') ?? undefined,
    });
    return NextResponse.json({ success: true, data: files });
  } catch (error) {
    console.error('GET /api/smart-files error:', error);
    return NextResponse.json({ success: false, error: 'Failed to list files' }, { status: 500 });
  }
}

// POST /api/smart-files — create a new Smart File (optionally from a template)
export async function POST(request: NextRequest) {
  const { admin, response } = await requireAdmin();
  if (response) return response;

  try {
    const body = await request.json();
    const { title, clientName, clientEmail, eventDate, notes, fromTemplateId } = body;

    if (!title?.trim()) {
      return NextResponse.json({ success: false, error: 'title is required' }, { status: 400 });
    }

    let file;
    if (fromTemplateId) {
      const cloned = await cloneFile(Number(fromTemplateId), {
        ownerUserId: admin.id,
        title: title.trim(),
        isTemplate: false,
      });
      file = cloned;
    } else {
      file = await createFile({
        ownerUserId: admin.id,
        title: title.trim(),
        clientName,
        clientEmail,
        eventDate,
        notes,
      });
    }

    await appendAuditEvent({
      fileId: file.id,
      actorType: 'admin',
      actorId: admin.username,
      event: 'file_created',
      payload: { title: file.title, fromTemplateId: fromTemplateId ?? null },
    });

    return NextResponse.json({ success: true, data: file }, { status: 201 });
  } catch (error) {
    console.error('POST /api/smart-files error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create file' }, { status: 500 });
  }
}
