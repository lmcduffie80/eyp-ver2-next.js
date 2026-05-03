import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/smartFiles/requireAdmin';
import sql from '@/api-old/db/connection';
import { normalizeRows, getSingleRow } from '@/lib/db-utils';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

function mapComment(row: Record<string, unknown>) {
  return {
    id: row.id as number,
    fileId: row.file_id as number,
    blockId: row.block_id as number | null,
    authorType: row.author_type as string,
    authorId: row.author_id as string,
    body: row.body as string,
    resolved: row.resolved as boolean,
    createdAt: String(row.created_at),
  };
}

// GET /api/smart-files/[id]/comments?blockId=123
export async function GET(request: NextRequest, { params }: Params) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const blockId = request.nextUrl.searchParams.get('blockId');

    const result = blockId
      ? await sql`SELECT * FROM sf_comments WHERE file_id = ${Number(id)} AND block_id = ${Number(blockId)} ORDER BY created_at ASC`
      : await sql`SELECT * FROM sf_comments WHERE file_id = ${Number(id)} ORDER BY created_at ASC`;

    return NextResponse.json({ success: true, data: normalizeRows(result).map(mapComment) });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to list comments' }, { status: 500 });
  }
}

// POST — add a comment
export async function POST(request: NextRequest, { params }: Params) {
  const { admin, response } = await requireAdmin();
  if (response) return response;

  try {
    const { id } = await params;
    const body = await request.json();
    const { blockId, authorBody } = body;

    if (!authorBody?.trim()) {
      return NextResponse.json({ success: false, error: 'body required' }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO sf_comments (file_id, block_id, author_type, author_id, body)
      VALUES (${Number(id)}, ${blockId ?? null}, 'admin', ${admin.username}, ${authorBody.trim()})
      RETURNING *
    `;
    return NextResponse.json({ success: true, data: mapComment(getSingleRow(result)) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to add comment' }, { status: 500 });
  }
}

// PATCH — resolve/unresolve a comment: /api/smart-files/[id]/comments?commentId=123
export async function PATCH(request: NextRequest) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const commentId = request.nextUrl.searchParams.get('commentId');
    if (!commentId) return NextResponse.json({ success: false, error: 'commentId required' }, { status: 400 });
    const body = await request.json();
    const result = await sql`
      UPDATE sf_comments SET resolved = ${!!body.resolved} WHERE id = ${Number(commentId)} RETURNING *
    `;
    return NextResponse.json({ success: true, data: mapComment(getSingleRow(result)) });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update comment' }, { status: 500 });
  }
}
