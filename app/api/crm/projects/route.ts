import { NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { cookies } from 'next/headers';
import { normalizeRows } from '@/lib/db-utils';

async function verifyCRMAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('crm_session');
  const userId = cookieStore.get('crm_user_id');
  
  if (!session || !userId) {
    return null;
  }
  
  return userId.value;
}

export async function GET(request: Request) {
  try {
    const userId = await verifyCRMAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage');
    const client_id = searchParams.get('client_id');
    const search = searchParams.get('search');

    let projects;
    
    if (stage || client_id || search) {
      projects = await sql`
        SELECT 
          p.*,
          c.client_name,
          c.client_email,
          u.username as assigned_to_username
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN users u ON p.assigned_to = u.id
        WHERE 
          ${stage ? sql`p.stage = ${stage}` : sql`1=1`}
          ${client_id ? sql`AND p.client_id = ${parseInt(client_id)}` : sql``}
          ${search ? sql`AND (
            p.project_name ILIKE ${`%${search}%`} OR
            p.project_number ILIKE ${`%${search}%`} OR
            c.client_name ILIKE ${`%${search}%`}
          )` : sql``}
        ORDER BY p.created_at DESC
      `;
    } else {
      projects = await sql`
        SELECT 
          p.*,
          c.client_name,
          c.client_email,
          u.username as assigned_to_username
        FROM projects p
        LEFT JOIN clients c ON p.client_id = c.id
        LEFT JOIN users u ON p.assigned_to = u.id
        ORDER BY p.created_at DESC
      `;
    }

    return NextResponse.json({
      success: true,
      projects
    });

  } catch (error: any) {
    console.error('Get projects error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await verifyCRMAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      client_id,
      inquiry_id,
      project_name,
      event_type,
      event_date,
      event_location,
      guest_count,
      services,
      total_amount,
      deposit_amount,
      assigned_to
    } = body;

    if (!client_id || !project_name) {
      return NextResponse.json({
        success: false,
        error: 'Client ID and project name are required'
      }, { status: 400 });
    }

    const insertResult = await sql`
      INSERT INTO projects (
        project_number,
        client_id,
        inquiry_id,
        project_name,
        event_type,
        event_date,
        event_location,
        guest_count,
        services,
        total_amount,
        deposit_amount,
        final_payment_amount,
        assigned_to,
        stage,
        stage_updated_at
      ) VALUES (
        '',
        ${client_id},
        ${inquiry_id || null},
        ${project_name},
        ${event_type || null},
        ${event_date || null},
        ${event_location || null},
        ${guest_count || null},
        ${services || []},
        ${total_amount || 0},
        ${deposit_amount || 0},
        ${total_amount && deposit_amount ? total_amount - deposit_amount : 0},
        ${assigned_to || null},
        'inquiry',
        CURRENT_TIMESTAMP
      )
      RETURNING *
    `;
    const result = normalizeRows(insertResult);

    // If created from inquiry, update inquiry status to 'contracted'
    if (inquiry_id) {
      await sql`
        UPDATE client_inquiries
        SET status = 'contracted'
        WHERE id = ${inquiry_id}
      `;
    }

    return NextResponse.json({
      success: true,
      project: result[0]
    });

  } catch (error: any) {
    console.error('Create project error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
