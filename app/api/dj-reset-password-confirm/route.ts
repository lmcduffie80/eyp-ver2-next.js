import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

import bcrypt from 'bcryptjs';

async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
}

// POST /api/dj-reset-password-confirm - Confirm password reset with token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, newPassword } = body;

    // Validation
    if (!token || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Token and new password are required' },
        { status: 400 }
      );
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Validate token and get associated email
    const resetRequest = await getResetTokenData(token);

    if (!resetRequest) {
      return NextResponse.json(
        { success: false, message: 'Invalid or expired reset token' },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (resetRequest.expiresAt < Date.now()) {
      return NextResponse.json(
        { success: false, message: 'Reset token has expired' },
        { status: 400 }
      );
    }

    // Check if token has already been used
    if (resetRequest.used) {
      return NextResponse.json(
        { success: false, message: 'This reset link has already been used' },
        { status: 400 }
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user's password in database
    await updateUserPassword(resetRequest.email, hashedPassword);

    // Mark token as used
    await markTokenAsUsed(token);

    return NextResponse.json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
}

/**
 * Get reset token data from database
 */
async function getResetTokenData(token: string) {
  try {
    const result = await sql`
      SELECT * FROM password_resets WHERE token = ${token}
    `;

    if (result.rows.length === 0) return null;

    const row = result.rows[0];
    return {
      email: row.email,
      expiresAt: new Date(row.expires_at).getTime(),
      used: row.used
    };
  } catch (error) {
    console.error('Error getting reset token data:', error);
    return null;
  }
}

/**
 * Update user password in database
 */
async function updateUserPassword(email: string, hashedPassword: string) {
  await sql`
    UPDATE users 
    SET password = ${hashedPassword}, updated_at = CURRENT_TIMESTAMP 
    WHERE email = ${email.toLowerCase().trim()} AND user_type = 'dj'
  `;
  console.log(`Password updated for ${email}`);
}

/**
 * Mark reset token as used
 */
async function markTokenAsUsed(token: string) {
  await sql`
    UPDATE password_resets 
    SET used = true 
    WHERE token = ${token}
  `;
  console.log(`Token marked as used: ${token}`);
}
