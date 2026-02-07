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

function renderTemplate(template: string, variables: any): string {
  let rendered = template;
  
  // Replace all {{variable}} placeholders
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, variables[key] || '');
  });
  
  return rendered;
}

export async function POST(request: Request) {
  try {
    const userId = await verifyCRMAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      project_id,
      template_id,
      contract_title,
      custom_variables
    } = body;

    if (!project_id || !template_id) {
      return NextResponse.json({
        success: false,
        error: 'Project ID and Template ID are required'
      }, { status: 400 });
    }

    // Get project details with client info
    const projectsResult = await sql`
      SELECT 
        p.*,
        c.client_name,
        c.client_email,
        c.client_phone,
        c.client_company,
        c.id as client_id
      FROM projects p
      JOIN clients c ON p.client_id = c.id
      WHERE p.id = ${project_id}
      LIMIT 1
    `;
    const projects = normalizeRows(projectsResult);

    if (projects.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Project not found'
      }, { status: 404 });
    }

    const project = projects[0];

    // Get template
    const templatesResult = await sql`
      SELECT * FROM contract_templates
      WHERE id = ${template_id}
      LIMIT 1
    `;
    const templates = normalizeRows(templatesResult);

    if (templates.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Template not found'
      }, { status: 404 });
    }

    const template = templates[0];

    // Build variables object
    const depositAmount = parseFloat(project.deposit_amount) || 0;
    const totalAmount = parseFloat(project.total_amount) || 0;
    const finalPaymentAmount = totalAmount - depositAmount;

    // Format services as a list
    const serviceList = Array.isArray(project.services) && project.services.length > 0
      ? project.services.map((s: string) => `- ${s}`).join('\n')
      : 'Services to be determined';

    // Calculate payment due date (e.g., 2 weeks before event)
    let paymentDueDate = 'TBD';
    if (project.event_date) {
      const eventDate = new Date(project.event_date);
      const dueDate = new Date(eventDate);
      dueDate.setDate(dueDate.getDate() - 14); // 2 weeks before
      paymentDueDate = dueDate.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }

    const variables = {
      // Client info
      client_name: project.client_name || '',
      client_email: project.client_email || '',
      client_phone: project.client_phone || '',
      client_company: project.client_company || '',
      
      // Event info
      event_type: project.event_type || '',
      event_date: project.event_date 
        ? new Date(project.event_date).toLocaleDateString('en-US', { 
            weekday: 'long',
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
          })
        : '',
      event_location: project.event_location || '',
      guest_count: project.guest_count || '',
      
      // Services
      service_list: serviceList,
      
      // Financial
      total_amount: totalAmount ? `$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '',
      deposit_amount: depositAmount ? `$${depositAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '',
      final_payment_amount: finalPaymentAmount ? `$${finalPaymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '',
      payment_due_date: paymentDueDate,
      payment_schedule: `Deposit: ${depositAmount ? `$${depositAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'} (Due upon signing)\nFinal Payment: ${finalPaymentAmount ? `$${finalPaymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '$0.00'} (Due ${paymentDueDate})`,
      
      // Misc
      current_date: new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      }),
      terms_and_conditions: '',
      
      // Custom variables override defaults
      ...custom_variables
    };

    // Render template
    const renderedContent = renderTemplate(template.template_content, variables);

    // Create contract
    const insertResult = await sql`
      INSERT INTO contracts (
        contract_number,
        project_id,
        client_id,
        template_id,
        contract_title,
        contract_content,
        status
      ) VALUES (
        '',
        ${project_id},
        ${project.client_id},
        ${template_id},
        ${contract_title || `${project.event_type || 'Event'} Services Agreement`},
        ${renderedContent},
        'draft'
      )
      RETURNING *
    `;
    const result = normalizeRows(insertResult);

    // Update project with contract_id
    await sql`
      UPDATE projects
      SET contract_id = ${result[0].id}
      WHERE id = ${project_id}
    `;

    return NextResponse.json({
      success: true,
      contract: result[0]
    });

  } catch (error: any) {
    console.error('Generate contract error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
