// Public viewer API — returns a Smart File scoped to a share token.
// No admin auth required; token is the credential.

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getShareTokenByHash, touchShareToken, getFileDetail } from '@/lib/smartFiles/repo';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ token: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const shareToken = await getShareTokenByHash(tokenHash);

    if (!shareToken) {
      return NextResponse.json({ success: false, error: 'Invalid or expired link' }, { status: 404 });
    }

    await touchShareToken(tokenHash);

    const file = await getFileDetail(shareToken.fileId);
    if (!file) return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });

    // Omit sensitive admin-only fields
    return NextResponse.json({
      success: true,
      data: {
        id: file.id,
        title: file.title,
        status: file.status,
        theme: file.theme,
        clientName: file.clientName,
        clientEmail: file.clientEmail,
        eventDate: file.eventDate,
        pages: file.pages,
        fields: file.fields,
        signatures: file.signatures.map((s) => ({
          signerRole: s.signerRole,
          signerName: s.signerName,
          status: s.status,
          signedAt: s.signedAt,
        })),
        invoiceItems: file.invoiceItems,
        paymentSchedule: file.paymentSchedule,
        recipientEmail: shareToken.recipientEmail,
      },
    });
  } catch (error) {
    console.error('GET /api/smart-files/public/[token] error:', error);
    return NextResponse.json({ success: false, error: 'Failed to load file' }, { status: 500 });
  }
}
