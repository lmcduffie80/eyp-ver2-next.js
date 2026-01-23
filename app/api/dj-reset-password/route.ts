import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';

// POST /api/dj-reset-password - Request password reset
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email address' },
        { status: 400 }
      );
    }

    // Generate secure reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour from now

    // Check if user exists
    const user = await checkUserExists(email);

    // Always process (don't reveal if email exists for security)
    if (user) {
      // Store reset token in database
      await storeResetToken(email, resetToken, resetTokenExpiry);

      // Send email with reset link
      const resetLink = `${process.env.BASE_URL || 'https://eyp-static.vercel.app'}/dj-reset-password.html?token=${resetToken}`;
      await sendResetEmail(email, resetLink);
    }

    // Always return success (security best practice)
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    // Still return success to avoid revealing if email exists
    return NextResponse.json({
      success: true,
      message: 'If an account exists with that email, a password reset link has been sent.'
    });
  }
}

/**
 * Check if user exists in database
 */
async function checkUserExists(email: string) {
  try {
    const result = await sql`
      SELECT id, email, username, first_name, last_name 
      FROM users 
      WHERE email = ${email.toLowerCase().trim()} AND user_type = 'dj'
    `;
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    return null;
  }
}

/**
 * Store reset token in database
 */
async function storeResetToken(email: string, token: string, expiry: number) {
  try {
    const expiryDate = new Date(expiry);

    // Delete any existing tokens for this email
    await sql`DELETE FROM password_resets WHERE email = ${email.toLowerCase().trim()}`;

    // Insert new reset token
    await sql`
      INSERT INTO password_resets (email, token, expires_at, created_at, used)
      VALUES (${email.toLowerCase().trim()}, ${token}, ${expiryDate.toISOString()}, NOW(), false)
    `;

    console.log(`Reset token stored for ${email}`);
  } catch (error: any) {
    // If table doesn't exist, create it first
    if (error.message && error.message.includes('does not exist')) {
      console.warn('password_resets table does not exist, attempting to create it...');
      try {
        await sql`
          CREATE TABLE IF NOT EXISTS password_resets (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            token VARCHAR(255) NOT NULL UNIQUE,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT NOW(),
            used BOOLEAN DEFAULT false
          )
        `;

        await sql`
          CREATE INDEX IF NOT EXISTS idx_password_resets_email ON password_resets(email)
        `;

        // Now try inserting again
        const expiryDate = new Date(expiry);
        await sql`DELETE FROM password_resets WHERE email = ${email.toLowerCase().trim()}`;
        await sql`
          INSERT INTO password_resets (email, token, expires_at, created_at, used)
          VALUES (${email.toLowerCase().trim()}, ${token}, ${expiryDate.toISOString()}, NOW(), false)
        `;

        console.log(`Reset token stored for ${email} (table created)`);
      } catch (createError) {
        console.error('Error creating password_resets table:', createError);
        throw createError;
      }
    } else {
      console.error('Error storing reset token:', error);
      throw error;
    }
  }
}

/**
 * Send password reset email
 */
async function sendResetEmail(email: string, resetLink: string) {
  const emailContent = {
    subject: 'DJ Portal - Password Reset Request',
    text: `
      DJ Portal Password Reset
      
      You requested to reset your password. Click the link below to reset your password:
      
      ${resetLink}
      
      This link will expire in 1 hour.
      
      If you did not request this password reset, please ignore this email.
      
      Externally Yours Productions, LLC
    `,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #ff6b35; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { padding: 30px; background-color: #f9f9f9; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #ff6b35; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { padding: 20px; text-align: center; font-size: 12px; color: #666; }
          .link { word-break: break-all; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>DJ Portal Password Reset</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>You requested to reset your password for the DJ Portal. Click the button below to reset your password:</p>
            <p style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            <p>Or copy and paste this link into your browser:</p>
            <p class="link">${resetLink}</p>
            <p><strong>This link will expire in 1 hour.</strong></p>
            <p>If you did not request this password reset, please ignore this email.</p>
          </div>
          <div class="footer">
            <p>Externally Yours Productions, LLC</p>
            <p>This is an automated message, please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };

  // Try Gmail SMTP first
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    const nodemailer = (await import('nodemailer')).default;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    await transporter.sendMail({
      to: email,
      from: process.env.EMAIL_FROM || process.env.GMAIL_USER,
      subject: emailContent.subject,
      text: emailContent.text,
      html: emailContent.html
    });

    console.log(`Password reset email sent to ${email} via Gmail SMTP`);
    return;
  }

  // Fallback: Log to console (for development)
  console.log('=== Password Reset Email ===');
  console.log(`To: ${email}`);
  console.log(`Reset Link: ${resetLink}`);
  console.log('===========================');

  console.warn('No email service configured. Email logged to console.');
}
