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

    const result = await sql`
      SELECT 
        i.*,
        u.username as assigned_to_username,
        u.email as assigned_to_email
      FROM client_inquiries i
      LEFT JOIN users u ON i.assigned_to = u.id
      WHERE i.id = ${id}
      LIMIT 1
    `;
    const inquiries = normalizeRows(result);

    if (inquiries.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Inquiry not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      inquiry: inquiries[0]
    });

  } catch (error: any) {
    console.error('Get inquiry error:', error);
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

    const {
      status,
      assigned_to,
      priority,
      last_contacted_at,
      client_name,
      client_email,
      client_phone,
      event_type,
      event_date,
      event_location,
      guest_count,
      budget_range,
      message
    } = body;

    // Build update query dynamically
    const updates: any = {};
    if (status !== undefined) updates.status = status;
    if (assigned_to !== undefined) updates.assigned_to = assigned_to;
    if (priority !== undefined) updates.priority = priority;
    if (last_contacted_at !== undefined) updates.last_contacted_at = last_contacted_at;
    if (client_name !== undefined) updates.client_name = client_name;
    if (client_email !== undefined) updates.client_email = client_email;
    if (client_phone !== undefined) updates.client_phone = client_phone;
    if (event_type !== undefined) updates.event_type = event_type;
    if (event_date !== undefined) updates.event_date = event_date;
    if (event_location !== undefined) updates.event_location = event_location;
    if (guest_count !== undefined) updates.guest_count = guest_count;
    if (budget_range !== undefined) updates.budget_range = budget_range;
    if (message !== undefined) updates.message = message;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fields to update'
      }, { status: 400 });
    }

    const updateResult = await sql`
      UPDATE client_inquiries
      SET ${sql(updates, ...Object.keys(updates))}
      WHERE id = ${id}
      RETURNING *
    `;
    const result = normalizeRows(updateResult);

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Inquiry not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      inquiry: result[0]
    });

  } catch (error: any) {
    console.error('Update inquiry error:', error);
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
      DELETE FROM client_inquiries
      WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted'
    });

  } catch (error: any) {
    console.error('Delete inquiry error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
