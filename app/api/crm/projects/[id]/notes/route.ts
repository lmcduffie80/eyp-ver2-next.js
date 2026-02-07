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

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await verifyCRMAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = parseInt(params.id);

    const notes = await sql`
      SELECT 
        n.*,
        u.username as created_by_username
      FROM meeting_notes n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.project_id = ${projectId}
      ORDER BY n.meeting_date DESC
    `;

    return NextResponse.json({
      success: true,
      notes
    });

  } catch (error: any) {
    console.error('Get notes error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = await verifyCRMAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const projectId = parseInt(params.id);
    const body = await request.json();

    const {
      meeting_title,
      meeting_date,
      meeting_type,
      attendees,
      notes,
      action_items,
      visible_to_client
    } = body;

    // Get client_id from project
    const projects_tmp = await sql`
      SELECT client_id FROM projects WHERE id = ${projectId} LIMIT 1
    `;
    const projects = normalizeRows(projects_tmp);

    if (projects.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Project not found'
      }, { status: 404 });
    }

    const clientId = projects[0].client_id;

    const insertResult = await sql`
      INSERT INTO meeting_notes (
        project_id,
        client_id,
        created_by,
        meeting_title,
        meeting_date,
        meeting_type,
        attendees,
        notes,
        action_items,
        visible_to_client
      ) VALUES (
        ${projectId},
        ${clientId},
        ${userId},
        ${meeting_title},
        ${meeting_date || new Date()},
        ${meeting_type || 'other'},
        ${attendees || []},
        ${notes},
        ${action_items || []},
        ${visible_to_client || false}
      )
      RETURNING *
    `;
    const result = normalizeRows(insertResult);

    return NextResponse.json({
      success: true,
      note: result[0]
    });

  } catch (error: any) {
    console.error('Create note error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
