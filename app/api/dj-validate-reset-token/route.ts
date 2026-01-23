import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// POST /api/dj-validate-reset-token - Validate if a reset token is valid
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { valid: false, message: 'Token is required' },
        { status: 400 }
      );
    }

    // Validate token in database
    const isValid = await validateResetToken(token);

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Token validation error:', error);
    return NextResponse.json({ valid: false });
  }
}

/**
 * Validate reset token in database
 */
async function validateResetToken(token: string): Promise<boolean> {
  try {
    const result = await sql`
      SELECT * FROM password_resets 
      WHERE token = ${token} 
      AND expires_at > NOW() 
      AND used = false
    `;
    return result.rows.length > 0;
  } catch (error) {
    console.error('Error validating reset token:', error);
    return false;
  }
}
