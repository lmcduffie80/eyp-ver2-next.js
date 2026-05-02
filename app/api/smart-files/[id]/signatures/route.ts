import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';
import { listSignatures, upsertSignature, appendAuditEvent } from '@/lib/smartFiles/repo';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const { id } = await params;
    const sigs = await listSignatures(Number(id));
    return NextResponse.json({ success: true, data: sigs });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to list signatures' }, { status: 500 });
  }
}

// POST — admin counter-signs (provider role)
export async function POST(request: NextRequest, { params }: Params) {
  const { admin, response } = await requireAdmin();
  if (response) return response;
  try {
    const { id } = await params;
    const body = await request.json();
    const { signerRole, signerName, signerEmail, typedName, signaturePngUrl } = body;

    if (!signerRole || !signerName || !signerEmail) {
      return NextResponse.json({ success: false, error: 'signerRole, signerName, signerEmail required' }, { status: 400 });
    }

    const sig = await upsertSignature(Number(id), {
      signerRole,
      signerName,
      signerEmail,
      status: typedName || signaturePngUrl ? 'signed' : 'pending',
      typedName,
      signaturePngUrl,
      ip: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    if (sig.status === 'signed') {
      await appendAuditEvent({
        fileId: Number(id),
        actorType: 'admin',
        actorId: admin.username,
        event: 'provider_signed',
        payload: { signerRole, signerName },
        ip: request.headers.get('x-forwarded-for') ?? undefined,
        userAgent: request.headers.get('user-agent') ?? undefined,
      });
    }

    return NextResponse.json({ success: true, data: sig });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to upsert signature' }, { status: 500 });
  }
}
