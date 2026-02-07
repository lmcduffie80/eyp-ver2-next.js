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

    const id = parseInt(params.id);

    const projects_tmp = await sql`
      SELECT 
        p.*,
        c.client_name,
        c.client_email,
        c.client_phone,
        u.username as assigned_to_username
      FROM projects p
      LEFT JOIN clients c ON p.client_id = c.id
      LEFT JOIN users u ON p.assigned_to = u.id
      WHERE p.id = ${id}
      LIMIT 1
    `;
    const projects = normalizeRows(projects_tmp);

    if (projects.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Project not found'
      }, { status: 404 });
    }

    // Get project contracts
    const contracts = await sql`
      SELECT * FROM contracts 
      WHERE project_id = ${id}
      ORDER BY created_at DESC
    `;

    // Get project payments
    const payments = await sql`
      SELECT * FROM payments 
      WHERE project_id = ${id}
      ORDER BY transaction_date DESC
    `;

    // Get project invoices
    const invoices = await sql`
      SELECT * FROM invoices 
      WHERE project_id = ${id}
      ORDER BY invoice_date DESC
    `;

    // Get meeting notes
    const notes = await sql`
      SELECT 
        n.*,
        u.username as created_by_username
      FROM meeting_notes n
      LEFT JOIN users u ON n.created_by = u.id
      WHERE n.project_id = ${id}
      ORDER BY n.meeting_date DESC
    `;

    return NextResponse.json({
      success: true,
      project: projects[0],
      contracts,
      payments,
      invoices,
      notes
    });

  } catch (error: any) {
    console.error('Get project error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
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
    if (body.project_name !== undefined) updates.project_name = body.project_name;
    if (body.event_type !== undefined) updates.event_type = body.event_type;
    if (body.event_date !== undefined) updates.event_date = body.event_date;
    if (body.event_location !== undefined) updates.event_location = body.event_location;
    if (body.guest_count !== undefined) updates.guest_count = body.guest_count;
    if (body.services !== undefined) updates.services = body.services;
    if (body.stage !== undefined) {
      updates.stage = body.stage;
      updates.stage_updated_at = new Date();
    }
    if (body.total_amount !== undefined) updates.total_amount = body.total_amount;
    if (body.deposit_amount !== undefined) updates.deposit_amount = body.deposit_amount;
    if (body.final_payment_amount !== undefined) updates.final_payment_amount = body.final_payment_amount;
    if (body.assigned_to !== undefined) updates.assigned_to = body.assigned_to;
    if (body.is_archived !== undefined) {
      updates.is_archived = body.is_archived;
      if (body.is_archived) {
        updates.archived_at = new Date();
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fields to update'
      }, { status: 400 });
    }

    const result_tmp = await sql`
      UPDATE projects
      SET ${sql(updates, ...Object.keys(updates))}
      WHERE id = ${id}
      RETURNING *
    `;
    const result = normalizeRows(result_tmp);

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Project not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      project: result[0]
    });

  } catch (error: any) {
    console.error('Update project error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
