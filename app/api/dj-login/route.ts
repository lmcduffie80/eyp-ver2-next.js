import { NextResponse } from 'next/server';
import sql from '@/api/db/connection';
import { comparePassword } from '@/api/utils/password';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // Validate input
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: 'Username and password are required'
        },
        { status: 400 }
      );
    }

    // Normalize username (strip leading @ if present)
    const normalizedUsername = username.startsWith('@') 
      ? username.substring(1) 
      : username;

    // Query database for user by username or email
    const result = await sql`
      SELECT * FROM users 
      WHERE (username = ${normalizedUsername} OR email = ${normalizedUsername})
      AND user_type = 'dj'
      LIMIT 1
    `;

    // Check if user exists
    if (result.rows.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid username or password'
        },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Verify password using bcrypt
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid username or password'
        },
        { status: 401 }
      );
    }

    // Generate a simple token (in production, use JWT)
    const token = `dj_token_${user.id}_${Date.now()}`;

    // Return success with user info and token
    return NextResponse.json(
      {
        success: true,
        token: token,
        user: user.username,
        userId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('DJ Login error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'An error occurred during login'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
