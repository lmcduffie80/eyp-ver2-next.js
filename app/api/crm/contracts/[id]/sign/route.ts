import { NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';
import { normalizeRows } from '@/lib/db-utils';

async function verifyClientAuth() {
  const cookieStore = await cookies();
  const session = cookieStore.get('client_session');
  const clientId = cookieStore.get('client_id');
  
  if (!session || !clientId) {
    return null;
  }
  
  return clientId.value;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const clientId = await verifyClientAuth();
    if (!clientId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contractId = parseInt(params.id);
    const body = await request.json();

    const {
      signature_data,
      signed_name
    } = body;

    if (!signature_data || !signed_name) {
      return NextResponse.json({
        success: false,
        error: 'Signature and name are required'
      }, { status: 400 });
    }

    // Verify contract belongs to this client
    const result = await sql`
      SELECT c.*, p.id as project_id, p.stage
      FROM contracts c
      JOIN projects p ON c.project_id = p.id
      WHERE c.id = ${contractId}
        AND c.client_id = ${clientId}
      LIMIT 1
    `;
    const contracts = normalizeRows(result);

    if (contracts.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Contract not found or access denied'
      }, { status: 404 });
    }

    const contract = contracts[0];

    // Get client IP address
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.headers.get('x-real-ip') || 'unknown';

    // Update contract with signature
    await sql`
      UPDATE contracts
      SET 
        status = 'signed',
        signed_at = CURRENT_TIMESTAMP,
        client_signature_data = ${signature_data},
        client_signed_name = ${signed_name},
        client_signed_date = CURRENT_TIMESTAMP,
        client_ip_address = ${ip}
      WHERE id = ${contractId}
    `;

    // Update project status
    await sql`
      UPDATE projects
      SET 
        contract_signed = true,
        contract_signed_at = CURRENT_TIMESTAMP,
        stage = 'contracted',
        stage_updated_at = CURRENT_TIMESTAMP
      WHERE id = ${contract.project_id}
    `;

    // Send notification email to admin
    try {
      await sendAdminNotification(contract);
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    // Log email
    try {
      await sql`
        INSERT INTO email_logs (
          project_id,
          client_id,
          email_type,
          recipient_email,
          subject,
          status,
          provider
        ) VALUES (
          ${contract.project_id},
          ${clientId},
          'contract_signed',
          ${process.env.ADMIN_NOTIFICATION_EMAIL || 'lee@externallyyoursproductions.com'},
          ${'Contract Signed - ' + contract.contract_title},
          'sent',
          'gmail'
        )
      `;
    } catch (logError) {
      console.error('Failed to log email:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Contract signed successfully'
    });

  } catch (error: any) {
    console.error('Sign contract error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

async function sendAdminNotification(contract: any) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || 'lee@externallyyoursproductions.com';
  const crmUrl = process.env.CRM_ADMIN_URL || 'https://eyp-static.vercel.app/crm-admin';
  
  if (!gmailUser || !gmailPass) {
    console.log('Gmail not configured, skipping notification email');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  });

  // Get client info
  const clientsResult = await sql`
    SELECT * FROM clients WHERE id = ${contract.client_id} LIMIT 1
  `;
  const clients = normalizeRows(clientsResult);

  const client = clients.length > 0 ? clients[0] : null;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">✅ Contract Signed!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">A client just signed their contract</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #10b981; margin: 0 0 25px 0;">
          <p style="margin: 0 0 10px 0; font-weight: 600; color: #1a1a1a;">Contract: ${contract.contract_title}</p>
          <p style="margin: 0; color: #666; font-size: 0.9rem;">Contract #${contract.contract_number}</p>
        </div>

        ${client ? `
        <h2 style="color: #1a1a1a; margin-top: 0;">Client Information</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 10px 0; font-weight: 600; color: #666; width: 40%;">Name:</td>
            <td style="padding: 10px 0;">${client.client_name}</td>
          </tr>
          <tr>
            <td style="padding: 10px 0; font-weight: 600; color: #666;">Email:</td>
            <td style="padding: 10px 0;">${client.client_email}</td>
          </tr>
          ${client.client_phone ? `
          <tr>
            <td style="padding: 10px 0; font-weight: 600; color: #666;">Phone:</td>
            <td style="padding: 10px 0;">${client.client_phone}</td>
          </tr>
          ` : ''}
        </table>
        ` : ''}
        
        <h3 style="color: #1a1a1a;">Next Steps:</h3>
        <ul style="padding-left: 20px; color: #555;">
          <li style="margin-bottom: 10px;">Review the signed contract in your CRM</li>
          <li style="margin-bottom: 10px;">Follow up with client about deposit payment</li>
          <li style="margin-bottom: 10px;">Update project timeline and deliverables</li>
        </ul>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${crmUrl}/projects/${contract.project_id}" style="display: inline-block; background: #10b981; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">View Project in CRM</a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px;">
          <p>This is an automated notification from your CRM system</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Externally Yours Productions CRM" <${gmailUser}>`,
    to: adminEmail,
    subject: `Contract Signed - ${contract.contract_title}`,
    html: htmlContent
  });
}
