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
        t.*,
        u.username as created_by_username
      FROM contract_templates t
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ${id}
      LIMIT 1
    `;
    const templates = normalizeRows(result);

    if (templates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Template not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      template: templates[0]
    });

  } catch (error: any) {
    console.error('Get template error:', error);
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
    if (body.template_name !== undefined) updates.template_name = body.template_name;
    if (body.service_type !== undefined) updates.service_type = body.service_type;
    if (body.template_content !== undefined) updates.template_content = body.template_content;
    if (body.variables !== undefined) updates.variables = body.variables;
    if (body.is_active !== undefined) updates.is_active = body.is_active;
    if (body.is_default !== undefined) {
      updates.is_default = body.is_default;
      
      // If setting as default, remove default from other templates
      if (body.is_default) {
        const templateResult = await sql`SELECT service_type FROM contract_templates WHERE id = ${id}`;
        const template = normalizeRows(templateResult);
        if (template.length > 0) {
          await sql`
            UPDATE contract_templates
            SET is_default = false
            WHERE service_type = ${template[0].service_type}
              AND id != ${id}
          `;
        }
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No fields to update'
      }, { status: 400 });
    }

    const updateResult = await sql`
      UPDATE contract_templates
      SET ${sql(updates, ...Object.keys(updates))}
      WHERE id = ${id}
      RETURNING *
    `;
    const result = normalizeRows(updateResult);

    if (result.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Template not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      template: result[0]
    });

  } catch (error: any) {
    console.error('Update template error:', error);
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
      DELETE FROM contract_templates
      WHERE id = ${id}
    `;

    return NextResponse.json({
      success: true,
      message: 'Template deleted'
    });

  } catch (error: any) {
    console.error('Delete template error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
