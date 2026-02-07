import { NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
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
    const search = searchParams.get('search');

    let result;
    
    if (search) {
      result = await sql`
        SELECT 
          c.*,
          (SELECT COUNT(*) FROM projects WHERE client_id = c.id) as project_count
        FROM clients c
        WHERE c.client_name ILIKE ${`%${search}%`}
           OR c.client_email ILIKE ${`%${search}%`}
           OR c.client_number ILIKE ${`%${search}%`}
        ORDER BY c.created_at DESC
      `;
    } else {
      result = await sql`
        SELECT 
          c.*,
          (SELECT COUNT(*) FROM projects WHERE client_id = c.id) as project_count
        FROM clients c
        ORDER BY c.created_at DESC
      `;
    }

    const clients = result.rows || result;

    return NextResponse.json({
      success: true,
      clients
    });

  } catch (error: any) {
    console.error('Get clients error:', error);
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
      inquiry_id,
      client_name,
      client_email,
      client_phone,
      client_company,
      preferred_contact_method,
      create_portal_access
    } = body;

    // Check if client with this email already exists
    const existingResult = await sql`
      SELECT id FROM clients WHERE client_email = ${client_email} LIMIT 1
    `;

    const existing = existingResult.rows || existingResult;

    if (existing && existing.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Client with this email already exists'
      }, { status: 400 });
    }

    // Generate portal activation token and temporary password if requested
    let portalPassword = null;
    let portalActivationToken = null;
    
    if (create_portal_access) {
      portalActivationToken = Buffer.from(`${client_email}:${Date.now()}:${Math.random()}`).toString('base64');
      const tempPassword = Math.random().toString(36).slice(-10);
      portalPassword = await bcrypt.hash(tempPassword, 10);
    }

    const insertResult = await sql`
      INSERT INTO clients (
        client_number,
        inquiry_id,
        client_name,
        client_email,
        client_phone,
        client_company,
        preferred_contact_method,
        portal_password,
        portal_activation_token
      ) VALUES (
        '',
        ${inquiry_id || null},
        ${client_name},
        ${client_email},
        ${client_phone || null},
        ${client_company || null},
        ${preferred_contact_method || 'email'},
        ${portalPassword},
        ${portalActivationToken}
      )
      RETURNING *
    `;
    const result = normalizeRows(insertResult);

    return NextResponse.json({
      success: true,
      client: result[0]
    });

  } catch (error: any) {
    console.error('Create client error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
