import { NextRequest, NextResponse } from 'next/server';
import { getFileByToken, addComment, getComments } from '@/lib/smartFiles/repo';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

async function resolveFile(token: string) {
  const file = await getFileByToken(token);
  if (!file) return null;
  return file;
}

export async function GET(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const file = await resolveFile(params.token);
  if (!file) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const blockId = searchParams.get('blockId') ? Number(searchParams.get('blockId')) : undefined;

  const comments = await getComments(file.id, blockId);
  return NextResponse.json({ success: true, data: comments });
}

export async function POST(
  req: NextRequest,
  { params }: { params: { token: string } }
) {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown';
  const limited = checkRateLimit(`sf-comment-${ip}`);
  if (!limited.allowed) {
    return NextResponse.json({ success: false, error: 'Rate limited' }, { status: 429 });
  }

  const file = await resolveFile(params.token);
  if (!file) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

  const body = await req.json();
  const { blockId, body: text, authorName } = body as {
    blockId?: number;
    body: string;
    authorName?: string;
  };

  if (!text?.trim()) {
    return NextResponse.json({ success: false, error: 'Comment body required' }, { status: 400 });
  }

  const comment = await addComment({
    fileId: file.id,
    blockId: blockId ?? null,
    authorType: 'client',
    authorName: authorName ?? 'Client',
    body: text.trim(),
  });

  return NextResponse.json({ success: true, data: comment });
}
