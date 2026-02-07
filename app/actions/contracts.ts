'use server';

import sql from '@/api-old/db/connection';
import { revalidatePath } from 'next/cache';
import { requireAuth } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function generateContract(formData: FormData) {
  try {
    await requireAuth();

    const project_id = parseInt(formData.get('project_id') as string);
    const template_id = parseInt(formData.get('template_id') as string);
    const contract_title = formData.get('contract_title') as string;

    if (!project_id || !template_id) {
      return { error: 'Project ID and Template ID are required' };
    }

    // Get project details
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

    const projects = projectsResult.rows || projectsResult;

    if (!projects || projects.length === 0) {
      return { error: 'Project not found' };
    }

    const project = projects[0];

    // Get template
    const templatesResult = await sql`
      SELECT * FROM contract_templates
      WHERE id = ${template_id}
      LIMIT 1
    `;

    const templates = templatesResult.rows || templatesResult;

    if (!templates || templates.length === 0) {
      return { error: 'Template not found' };
    }

    const template = templates[0];

    // Build variables and render template
    const variables = buildContractVariables(project);
    const renderedContent = renderTemplate(template.template_content, variables);

    // Create contract
    const contractResult = await sql`
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

    const result = contractResult.rows || contractResult;

    // Update project
    await sql`
      UPDATE projects
      SET contract_id = ${result[0].id}
      WHERE id = ${project_id}
    `;

    revalidatePath(`/crm-admin/projects/${project_id}`);
    return { success: true, contract: result[0] };
  } catch (error: any) {
    console.error('Error generating contract:', error);
    return { error: error.message || 'Failed to generate contract' };
  }
}

export async function sendContract(contractId: number) {
  try {
    await requireAuth();

    // Get contract with client info
    const contractsResult = await sql`
      SELECT 
        c.*,
        cl.client_name,
        cl.client_email,
        p.project_name
      FROM contracts c
      JOIN clients cl ON c.client_id = cl.id
      JOIN projects p ON c.project_id = p.id
      WHERE c.id = ${contractId}
      LIMIT 1
    `;

    const contracts = contractsResult.rows || contractsResult;

    if (!contracts || contracts.length === 0) {
      return { error: 'Contract not found' };
    }

    const contract = contracts[0];

    // Update status
    await sql`
      UPDATE contracts
      SET status = 'sent', sent_at = CURRENT_TIMESTAMP
      WHERE id = ${contractId}
    `;

    // Send email (would call email function here)
    // await sendContractEmail(contract);

    // Log email
    await sql`
      INSERT INTO email_logs (
        project_id,
        client_id,
        email_type,
        recipient_email,
        recipient_name,
        subject,
        status,
        provider
      ) VALUES (
        ${contract.project_id},
        ${contract.client_id},
        'contract_sent',
        ${contract.client_email},
        ${contract.client_name},
        ${'Your Contract is Ready - ' + contract.contract_title},
        'sent',
        'gmail'
      )
    `;

    revalidatePath(`/crm-admin/projects/${contract.project_id}`);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending contract:', error);
    return { error: error.message || 'Failed to send contract' };
  }
}

export async function signContract(contractId: number, signatureData: string, signedName: string) {
  try {
    // Import cookies here since it's used in a server action
    const { cookies } = await import('next/headers');
    
    // This is called from client portal, so verify client auth
    const cookieStore = await cookies();
    const clientId = cookieStore.get('client_id');

    if (!clientId) {
      return { error: 'Unauthorized' };
    }

    if (!signatureData || !signedName) {
      return { error: 'Signature and name are required' };
    }

    // Verify contract belongs to this client
    const contractsResult = await sql`
      SELECT c.*, p.id as project_id
      FROM contracts c
      JOIN projects p ON c.project_id = p.id
      WHERE c.id = ${contractId}
        AND c.client_id = ${clientId.value}
      LIMIT 1
    `;

    const contracts = contractsResult.rows || contractsResult;

    if (!contracts || contracts.length === 0) {
      return { error: 'Contract not found or access denied' };
    }

    const contract = contracts[0];

    // Update contract
    await sql`
      UPDATE contracts
      SET 
        status = 'signed',
        signed_at = CURRENT_TIMESTAMP,
        client_signature_data = ${signatureData},
        client_signed_name = ${signedName},
        client_signed_date = CURRENT_TIMESTAMP
      WHERE id = ${contractId}
    `;

    // Update project
    await sql`
      UPDATE projects
      SET 
        contract_signed = true,
        contract_signed_at = CURRENT_TIMESTAMP,
        stage = 'contracted',
        stage_updated_at = CURRENT_TIMESTAMP
      WHERE id = ${contract.project_id}
    `;

    revalidatePath(`/client-portal/contracts/${contractId}`);
    revalidatePath('/client-portal/dashboard');
    return { success: true };
  } catch (error: any) {
    console.error('Error signing contract:', error);
    return { error: error.message || 'Failed to sign contract' };
  }
}

function buildContractVariables(project: any) {
  const depositAmount = parseFloat(project.deposit_amount) || 0;
  const totalAmount = parseFloat(project.total_amount) || 0;
  const finalPaymentAmount = totalAmount - depositAmount;

  const serviceList = Array.isArray(project.services) && project.services.length > 0
    ? project.services.map((s: string) => `- ${s}`).join('\n')
    : 'Services to be determined';

  let paymentDueDate = 'TBD';
  if (project.event_date) {
    const eventDate = new Date(project.event_date);
    const dueDate = new Date(eventDate);
    dueDate.setDate(dueDate.getDate() - 14);
    paymentDueDate = dueDate.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }

  return {
    client_name: project.client_name || '',
    client_email: project.client_email || '',
    client_phone: project.client_phone || '',
    client_company: project.client_company || '',
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
    service_list: serviceList,
    total_amount: totalAmount ? `$${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '',
    deposit_amount: depositAmount ? `$${depositAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '',
    final_payment_amount: finalPaymentAmount ? `$${finalPaymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '',
    payment_due_date: paymentDueDate,
    payment_schedule: `Deposit: $${depositAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} (Due upon signing)\nFinal Payment: $${finalPaymentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} (Due ${paymentDueDate})`,
    current_date: new Date().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    }),
    terms_and_conditions: '',
  };
}

function renderTemplate(template: string, variables: any): string {
  let rendered = template;
  
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    rendered = rendered.replace(regex, variables[key] || '');
  });
  
  return rendered;
}
