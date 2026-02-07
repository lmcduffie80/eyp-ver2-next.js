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

    const result = await sql`
      SELECT 
        c.*,
        cl.client_name,
        cl.client_email,
        p.project_name,
        p.event_type,
        p.event_date
      FROM contracts c
      LEFT JOIN clients cl ON c.client_id = cl.id
      LEFT JOIN projects p ON c.project_id = p.id
      WHERE c.id = ${id}
      LIMIT 1
    `;
    const contracts = normalizeRows(result);

    if (contracts.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Contract not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      contract: contracts[0]
    });

  } catch (error: any) {
    console.error('Get contract error:', error);
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
    if (body.contract_title !== undefined) updates.contract_title = body.contract_title;
    if (body.contract_content !== undefined) updates.contract_content = body.contract_content;
    if (body.status !== undefined) updates.status = body.status;
    if (body.expires_at !== undefined) updates.expires_at = body.expires_at;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fields to update'
      }, { status: 400 });
    }

    const updateResult = await sql`
      UPDATE contracts
      SET ${sql(updates, ...Object.keys(updates))}
      WHERE id = ${id}
      RETURNING *
    `;
    const result = normalizeRows(updateResult);

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Contract not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      contract: result[0]
    });

  } catch (error: any) {
    console.error('Update contract error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
