import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';
import { getFileById, getFileDetail, appendAuditEvent } from '@/lib/smartFiles/repo';
import { generateAndUploadPdf } from '@/lib/smartFiles/generatePdf';

export const dynamic = 'force-dynamic';

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response!;
  const { admin } = guard;

  const fileId = Number(params.id);
  if (!fileId) return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });

  const file = await getFileDetail(fileId);
  if (!file) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  try {
    const pdfUrl = await generateAndUploadPdf(file);

    await appendAuditEvent({
      fileId,
      event: 'pdf_generated',
      actorType: 'admin',
      actorId: String(admin.id),
      payload: { pdfUrl },
    });

    return NextResponse.json({ success: true, data: { pdfUrl } });
  } catch (err) {
    console.error('PDF generation error:', err);
    return NextResponse.json({ success: false, error: 'PDF generation failed' }, { status: 500 });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const guard = await requireAdmin();
  if ('response' in guard) return guard.response!;

  const fileId = Number(params.id);
  if (!fileId) return NextResponse.json({ success: false, error: 'Invalid id' }, { status: 400 });

  const file = await getFileById(fileId);
  if (!file) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  return NextResponse.json({
    success: true,
    data: { pdfUrl: file.pdfUrl ?? null },
  });
}
