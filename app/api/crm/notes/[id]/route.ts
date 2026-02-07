import { NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { normalizeRows } from '@/lib/db-utils';
import { cookies } from 'next/headers';

async function verifyCRMAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('crm_session');
  const userId = cookieStore.get('crm_user_id');
  
  if (!session || !userId) {
    return null;
  }
  
  return userId.value;
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await verifyCRMAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);
    const body = await request.json();

    const updates: any = {};
    if (body.meeting_title !== undefined) updates.meeting_title = body.meeting_title;
    if (body.meeting_date !== undefined) updates.meeting_date = body.meeting_date;
    if (body.meeting_type !== undefined) updates.meeting_type = body.meeting_type;
    if (body.attendees !== undefined) updates.attendees = body.attendees;
    if (body.notes !== undefined) updates.notes = body.notes;
    if (body.action_items !== undefined) updates.action_items = body.action_items;
    if (body.visible_to_client !== undefined) updates.visible_to_client = body.visible_to_client;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fields to update'
      }, { status: 400 });
    }

    const result_tmp = await sql`
      UPDATE meeting_notes
      SET ${sql(updates, ...Object.keys(updates))}
      WHERE id = ${id}
      RETURNING *
    `;
    const result = normalizeRows(result_tmp);

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Note not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      note: result[0]
    });

  } catch (error: any) {
    console.error('Update note error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await verifyCRMAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);

    await sql`
      DELETE FROM meeting_notes
      WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Note deleted'
    });

  } catch (error: any) {
    console.error('Delete note error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
