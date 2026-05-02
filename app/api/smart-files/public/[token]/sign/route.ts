// Public: client submits their signature

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import {
  getShareTokenByHash,
  upsertSignature,
  appendAuditEvent,
  listSignatures,
  updateFile,
} from '@/lib/smartFiles/repo';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ token: string }> };

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const shareToken = await getShareTokenByHash(tokenHash);

    if (!shareToken) {
      return NextResponse.json({ success: false, error: 'Invalid or expired link' }, { status: 404 });
    }

    const body = await request.json();
    const { typedName, signaturePngUrl, signerName, signerEmail, htmlSnapshotHash } = body;

    if (!typedName && !signaturePngUrl) {
      return NextResponse.json(
        { success: false, error: 'typedName or signaturePngUrl required' },
        { status: 400 }
      );
    }

    const fileId = shareToken.fileId;
    const ip = request.headers.get('x-forwarded-for') ?? undefined;
    const userAgent = request.headers.get('user-agent') ?? undefined;

    const sig = await upsertSignature(fileId, {
      signerRole: 'client',
      signerName: signerName ?? shareToken.recipientEmail,
      signerEmail: signerEmail ?? shareToken.recipientEmail,
      status: 'signed',
      typedName,
      signaturePngUrl,
      ip,
      userAgent,
      htmlSnapshotHash,
    });

    await appendAuditEvent({
      fileId,
      actorType: 'client',
      actorId: shareToken.recipientEmail,
      event: 'client_signed',
      payload: { signerName: sig.signerName, htmlSnapshotHash: htmlSnapshotHash ?? null },
      ip,
      userAgent,
    });

    // Check if both parties have signed — update status to 'completed' if so
    const allSigs = await listSignatures(fileId);
    const providerSigned = allSigs.some((s) => s.signerRole === 'provider' && s.status === 'signed');
    const clientSigned = allSigs.some((s) => s.signerRole === 'client' && s.status === 'signed');

    if (providerSigned && clientSigned) {
      await updateFile(fileId, { status: 'completed' });
      await appendAuditEvent({
        fileId,
        actorType: 'system',
        event: 'file_fully_executed',
        payload: {},
      });
    } else if (clientSigned) {
      await updateFile(fileId, { status: 'partial' });
    }

    // Notify admin of client signature
    try {
      const adminEmail = process.env.ADMIN_NOTIFY_EMAIL ?? 'lee@externallyyyoursproductions.com';
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'lee@externallyyyoursproductions.com',
        to: adminEmail,
        subject: `Client Signed: ${signerName ?? shareToken.recipientEmail}`,
        html: `<p>The client <strong>${signerName ?? shareToken.recipientEmail}</strong> has signed the contract (File ID: ${fileId}).</p>
               <p>Log in to the admin panel to counter-sign.</p>`,
      });
    } catch (emailErr) {
      console.error('Admin notify email error:', emailErr);
    }

    return NextResponse.json({ success: true, data: { status: sig.status, signedAt: sig.signedAt } });
  } catch (error) {
    console.error('POST /public/[token]/sign error:', error);
    return NextResponse.json({ success: false, error: 'Failed to submit signature' }, { status: 500 });
  }
}
