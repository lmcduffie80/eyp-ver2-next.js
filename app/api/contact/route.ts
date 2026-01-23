import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, service, message } = body;

    // Validate required fields
    if (!name || !email || !message || !service) {
      return NextResponse.json(
        { success: false, error: 'Name, email, service, and message are required' },
        { status: 400 }
      );
    }

    // Prepare email content
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff6b35; color: white; padding: 20px; text-align: center; }
          .content { padding: 30px; background-color: #f9f9f9; }
          .field { margin: 15px 0; }
          .label { font-weight: bold; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Contact Form Submission</h1>
          </div>
          <div class="content">
            <div class="field"><span class="label">Name:</span> ${name}</div>
            <div class="field"><span class="label">Email:</span> ${email}</div>
            <div class="field"><span class="label">Phone:</span> ${phone || 'Not provided'}</div>
            <div class="field"><span class="label">Service Type:</span> ${service}</div>
            <div class="field">
              <span class="label">Message:</span>
              <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const emailText = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Service Type: ${service}

Message:
${message}
    `;

    // Try Gmail SMTP first (using existing configuration)
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const nodemailer = (await import('nodemailer')).default;
      
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        }
      });

      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
        to: 'lee@externallyyoursproductions.com',
        replyTo: email,
        subject: `Contact Form: ${service} - ${name}`,
        text: emailText,
        html: emailHtml
      };

      await transporter.sendMail(mailOptions);
      
      return NextResponse.json(
        { success: true, message: 'Message sent successfully' },
        { status: 200 }
      );
    }

    // Fallback to SendGrid if configured
    if (process.env.SENDGRID_API_KEY) {
      const sgMail = (await import('@sendgrid/mail')).default;
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);

      const msg = {
        to: 'lee@externallyyoursproductions.com',
        from: process.env.EMAIL_FROM || 'noreply@externallyyoursproductions.com',
        replyTo: email,
        subject: `Contact Form: ${service} - ${name}`,
        text: emailText,
        html: emailHtml,
      };

      await sgMail.send(msg);
      
      return NextResponse.json(
        { success: true, message: 'Message sent successfully' },
        { status: 200 }
      );
    }

    // No email service configured
    console.error('No email service configured');
    return NextResponse.json(
      { success: false, error: 'Email service not configured' },
      { status: 500 }
    );

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
