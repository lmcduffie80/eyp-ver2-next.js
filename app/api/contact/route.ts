import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, service, message } = body;

    // Validate required fields
    if (!name || !email || !message || !service) {
      return NextResponse.json(
        {
          success: false,
          error: 'Name, email, service, and message are required'
        },
        { status: 400 }
      );
    }

    // Check if SendGrid is configured
    if (!process.env.SENDGRID_API_KEY) {
      console.error('SendGrid API key not configured');
      return NextResponse.json(
        {
          success: false,
          error: 'Email service not configured'
        },
        { status: 500 }
      );
    }

    // Prepare email content
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Service Type:</strong> ${service}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p style="font-size: 0.9em; color: #666;">
        This message was sent from the Externally Yours Productions contact form.
      </p>
    `;

    const emailText = `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${phone || 'Not provided'}
Service Type: ${service}

Message:
${message}

---
This message was sent from the Externally Yours Productions contact form.
    `;

    // Send email using SendGrid
    const msg = {
      to: 'lee@externallyyoursproductions.com',
      from: 'noreply@externallyyoursproductions.com', // Must be a verified sender in SendGrid
      replyTo: email,
      subject: `Contact Form: ${service} - ${name}`,
      text: emailText,
      html: emailHtml,
    };

    await sgMail.send(msg);

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully'
      },
      { status: 200 }
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
