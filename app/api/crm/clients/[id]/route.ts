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

    const clientsResult = await sql`
      SELECT * FROM clients WHERE id = ${id} LIMIT 1
    `;
    const clients = normalizeRows(clientsResult);

    if (clients.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Client not found'
      }, { status: 404 });
    }

    // Get client projects
    const projectsResult = await sql`
      SELECT * FROM projects 
      WHERE client_id = ${id}
      ORDER BY created_at DESC
    `;
    const projects = normalizeRows(projectsResult);

    return NextResponse.json({
      success: true,
      client: clients[0],
      projects
    });

  } catch (error: any) {
    console.error('Get client error:', error);
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
    if (body.client_name !== undefined) updates.client_name = body.client_name;
    if (body.client_email !== undefined) updates.client_email = body.client_email;
    if (body.client_phone !== undefined) updates.client_phone = body.client_phone;
    if (body.client_company !== undefined) updates.client_company = body.client_company;
    if (body.preferred_contact_method !== undefined) updates.preferred_contact_method = body.preferred_contact_method;
    if (body.timezone !== undefined) updates.timezone = body.timezone;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fields to update'
      }, { status: 400 });
    }

    const updateResult = await sql`
      UPDATE clients
      SET ${sql(updates, ...Object.keys(updates))}
      WHERE id = ${id}
      RETURNING *
    `;
    const result = normalizeRows(updateResult);

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Client not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      client: result[0]
    });

  } catch (error: any) {
    console.error('Update client error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
