import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from '@/api-old/db/connection';
import { comparePassword } from '@/api-old/utils/password';

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

    // Query database for admin user by username or email (case-insensitive)
    const result = await sql`
      SELECT * FROM users 
      WHERE (LOWER(username) = LOWER(${normalizedUsername}) OR LOWER(email) = LOWER(${normalizedUsername}))
      AND user_type = 'admin'
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

    // Generate session token
    const token = `admin_token_${user.id}_${Date.now()}`;

    // Set secure HTTP-only cookie for session
    const cookieStore = await cookies();
    const isProduction = process.env.NODE_ENV === 'production';
    
    cookieStore.set('admin_session', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    // Store user ID in session for verification
    cookieStore.set('admin_user_id', user.id.toString(), {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    // Compute normalized display name
    const displayName = (user.first_name && user.last_name) 
      ? `${user.first_name} ${user.last_name}` 
      : user.username;

    // Return success with user info (but NOT the token - it's in HTTP-only cookie)
    return NextResponse.json(
      {
        success: true,
        user: user.username,
        displayName: displayName,
        userId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        isSuperUser: user.is_super_user || false
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Admin Login error:', error);
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
