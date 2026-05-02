// Public: client submits questionnaire answers and field values

import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { getShareTokenByHash, upsertAnswer, upsertField, appendAuditEvent } from '@/lib/smartFiles/repo';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ token: string }> };

// PATCH — save answers/fields from the client viewer
// Body: { answers?: { [questionKey]: value }, fields?: { [fieldKey]: { label, value } } }
export async function PATCH(request: NextRequest, { params }: Params) {
  try {
    const { token } = await params;
    const tokenHash = createHash('sha256').update(token).digest('hex');
    const shareToken = await getShareTokenByHash(tokenHash);

    if (!shareToken) {
      return NextResponse.json({ success: false, error: 'Invalid or expired link' }, { status: 404 });
    }

    const body = await request.json();
    const { answers, fields } = body;
    const fileId = shareToken.fileId;

    if (answers && typeof answers === 'object') {
      for (const [key, value] of Object.entries(answers)) {
        await upsertAnswer(fileId, key, value);
      }
    }

    if (fields && typeof fields === 'object') {
      for (const [key, meta] of Object.entries(fields as Record<string, { label: string; value: string }>)) {
        await upsertField(fileId, { key, label: meta.label, value: meta.value });
      }
    }

    await appendAuditEvent({
      fileId,
      actorType: 'client',
      actorId: shareToken.recipientEmail,
      event: 'answers_saved',
      payload: { keys: Object.keys({ ...answers, ...fields }) },
      ip: request.headers.get('x-forwarded-for') ?? undefined,
      userAgent: request.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PATCH /public/[token]/answers error:', error);
    return NextResponse.json({ success: false, error: 'Failed to save answers' }, { status: 500 });
  }
}
