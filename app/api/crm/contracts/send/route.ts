import { NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import { cookies } from 'next/headers';
import nodemailer from 'nodemailer';
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

export async function POST(request: Request) {
  try {
    const userId = await verifyCRMAuth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { contract_id } = body;

    if (!contract_id) {
      return NextResponse.json({
        success: false,
        error: 'Contract ID is required'
      }, { status: 400 });
    }

    // Get contract with client and project info
    const result = await sql`
      SELECT 
        c.*,
        cl.client_name,
        cl.client_email,
        cl.portal_activation_token,
        p.project_name,
        p.event_type
      FROM contracts c
      JOIN clients cl ON c.client_id = cl.id
      JOIN projects p ON c.project_id = p.id
      WHERE c.id = ${contract_id}
      LIMIT 1
    `;
    const contracts = normalizeRows(result);

    if (contracts.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Contract not found'
      }, { status: 404 });
    }

    const contract = contracts[0];

    // Update contract status to 'sent'
    await sql`
      UPDATE contracts
      SET status = 'sent', sent_at = CURRENT_TIMESTAMP
      WHERE id = ${contract_id}
    `;

    // Send email to client
    try {
      await sendContractEmail(contract);
    } catch (emailError) {
      console.error('Failed to send contract email:', emailError);
      // Don't fail the request if email fails
    }

    // Log email
    try {
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
    } catch (logError) {
      console.error('Failed to log email:', logError);
    }

    return NextResponse.json({
      success: true,
      message: 'Contract sent successfully'
    });

  } catch (error: any) {
    console.error('Send contract error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

async function sendContractEmail(contract: any) {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;
  const clientPortalUrl = process.env.CLIENT_PORTAL_URL || 'https://eyp-static.vercel.app/client-portal';
  
  if (!gmailUser || !gmailPass) {
    console.log('Gmail not configured, skipping contract email');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass
    }
  });

  const contractLink = `${clientPortalUrl}/contracts/${contract.id}`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 28px;">📄 Your Contract is Ready!</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">${contract.project_name}</p>
      </div>
      
      <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px; color: #333; margin-top: 0;">
          Dear ${contract.client_name},
        </p>
        
        <p style="font-size: 16px; color: #333;">
          Great news! Your contract for <strong>${contract.event_type || 'your event'}</strong> is now ready for your review and signature.
        </p>

        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #ff6b35; margin: 20px 0;">
          <p style="margin: 0 0 10px 0; font-weight: 600; color: #1a1a1a;">Contract: ${contract.contract_title}</p>
          <p style="margin: 0; color: #666; font-size: 0.9rem;">Contract #${contract.contract_number}</p>
        </div>

        <h3 style="color: #1a1a1a; margin-top: 25px;">Next Steps:</h3>
        <ol style="padding-left: 20px; color: #555;">
          <li style="margin-bottom: 10px;">Review the contract carefully</li>
          <li style="margin-bottom: 10px;">Sign electronically using our secure portal</li>
          <li style="margin-bottom: 10px;">Submit your deposit to secure your date</li>
        </ol>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${contractLink}" style="display: inline-block; background: #ff6b35; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Review & Sign Contract</a>
        </div>

        <div style="background: #fff8f5; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <p style="margin: 0; color: #666; font-size: 14px;">
            <strong>Questions?</strong> Reply to this email or contact us anytime. We're here to help!
          </p>
        </div>
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #999; font-size: 12px;">
          <p>Externally Yours Productions<br/>
          Making your events extraordinary</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"Externally Yours Productions" <${gmailUser}>`,
    to: contract.client_email,
    subject: `Your Contract is Ready - ${contract.contract_title}`,
    html: htmlContent
  });
}
