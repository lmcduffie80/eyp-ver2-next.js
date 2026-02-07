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

export async function GET(request: Request) {
  try {
    const userId = await verifyCRMAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const service_type = searchParams.get('service_type');
    const is_active = searchParams.get('is_active');

    let templates;
    
    if (service_type || is_active) {
      templates = await sql`
        SELECT 
          t.*,
          u.username as created_by_username
        FROM contract_templates t
        LEFT JOIN users u ON t.created_by = u.id
        WHERE 
          ${service_type ? sql`t.service_type = ${service_type}` : sql`1=1`}
          ${is_active ? sql`AND t.is_active = ${is_active === 'true'}` : sql``}
        ORDER BY t.is_default DESC, t.created_at DESC
      `;
    } else {
      templates = await sql`
        SELECT 
          t.*,
          u.username as created_by_username
        FROM contract_templates t
        LEFT JOIN users u ON t.created_by = u.id
        ORDER BY t.is_default DESC, t.created_at DESC
      `;
    }

    return NextResponse.json({
      success: true,
      templates
    });

  } catch (error: any) {
    console.error('Get templates error:', error);
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
      template_name,
      service_type,
      template_content,
      variables,
      is_active,
      is_default
    } = body;

    if (!template_name || !template_content) {
      return NextResponse.json({
        success: false,
        error: 'Template name and content are required'
      }, { status: 400 });
    }

    // If setting as default, remove default from other templates of same service type
    if (is_default) {
      await sql`
        UPDATE contract_templates
        SET is_default = false
        WHERE service_type = ${service_type}
      `;
    }

    const insertResult = await sql`
      INSERT INTO contract_templates (
        template_name,
        service_type,
        template_content,
        variables,
        is_active,
        is_default,
        created_by
      ) VALUES (
        ${template_name},
        ${service_type || null},
        ${template_content},
        ${variables || []},
        ${is_active !== undefined ? is_active : true},
        ${is_default || false},
        ${userId}
      )
      RETURNING *
    `;
    const result = normalizeRows(insertResult);

    return NextResponse.json({
      success: true,
      template: result[0]
    });

  } catch (error: any) {
    console.error('Create template error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
