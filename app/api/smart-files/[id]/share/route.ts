import { NextRequest, NextResponse } from 'next/server';
import { randomBytes, createHash } from 'crypto';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';
import { createShareToken, listShareTokens, appendAuditEvent, getFileById } from '@/lib/smartFiles/repo';
import { Resend } from 'resend';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

const getResend = () => new Resend(process.env.RESEND_API_KEY);
const TOKEN_TTL_DAYS = 30;

// GET — list existing share tokens for a file
export async function GET(_req: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const tokens = await listShareTokens(Number(id));
    // Omit the hash; return only safe metadata
    const safe = tokens.map(({ tokenHash: _h, ...rest }) => rest);
    return NextResponse.json({ success: true, data: safe });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to list share tokens' }, { status: 500 });
  }
}

// POST — generate a share token and email the client
export async function POST(request: NextRequest, { params }: Params) {
  const { admin, response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const fileId = Number(id);
    const body = await request.json();
    const { recipientEmail, recipientName, message } = body;

    if (!recipientEmail) {
      return NextResponse.json({ success: false, error: 'recipientEmail required' }, { status: 400 });
    }

    const file = await getFileById(fileId);
    if (!file) return NextResponse.json({ success: false, error: 'File not found' }, { status: 404 });

    // Generate raw token; store hash
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

    await createShareToken({ fileId, tokenHash, recipientEmail, expiresAt });

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://externallyyyoursproductions.com';
    const shareUrl = `${baseUrl}/s/${rawToken}`;

    // Send email via Resend
    try {
      await getResend().emails.send({
        from: process.env.RESEND_FROM_EMAIL ?? 'lee@externallyyyoursproductions.com',
        to: recipientEmail,
        subject: `Your Smart File from Externally Yours Productions: ${file.title}`,
        html: `
          <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
            <h2 style="color:#1a1a1a">${file.title}</h2>
            <p>Hi ${recipientName ?? 'there'},</p>
            <p>${message ?? 'Please review and sign your contract using the link below.'}</p>
            <p style="margin:24px 0">
              <a href="${shareUrl}" style="background:#1a1a1a;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
                View Smart File
              </a>
            </p>
            <p style="color:#666;font-size:13px">
              This link expires in ${TOKEN_TTL_DAYS} days.<br>
              Questions? Reply to this email or call (229) 326-5408.
            </p>
            <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
            <p style="color:#999;font-size:12px">Externally Yours Productions, LLC · 181 Cedar Ridge Rd, Tifton, GA 31794</p>
          </div>
        `,
      });
    } catch (emailErr) {
      console.error('Share email send error:', emailErr);
      // Don't fail the whole request — token is created; email can be resent
    }

    await appendAuditEvent({
      fileId,
      actorType: 'admin',
      actorId: admin.username,
      event: 'share_sent',
      payload: { recipientEmail, expiresAt: expiresAt.toISOString() },
      ip: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    // Update file status to 'sent' if still draft
    if (file.status === 'draft') {
      const { updateFile } = await import('@/lib/smartFiles/repo');
      await updateFile(fileId, { status: 'sent' });
    }

    return NextResponse.json({
      success: true,
      data: { shareUrl, expiresAt: expiresAt.toISOString(), recipientEmail },
    });
  } catch (error) {
    console.error('POST /api/smart-files/[id]/share error:', error);
    return NextResponse.json({ success: false, error: 'Failed to create share token' }, { status: 500 });
  }
}
