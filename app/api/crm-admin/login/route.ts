import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import sql from '@/api-old/db/connection';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({
        success: false,
        message: 'Username and password are required'
      }, { status: 400 });
    }

    // Get user from database
    const result = await sql`
      SELECT * FROM users 
      WHERE username = ${username}
      LIMIT 1
    `;

    const users = result.rows || result;

    if (!users || users.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }

    const user = users[0];

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json({
        success: false,
        message: 'Invalid credentials'
      }, { status: 401 });
    }

    // Create session token (simple implementation)
    const sessionToken = Buffer.from(`${user.id}:${Date.now()}:${Math.random()}`).toString('base64');

    // Set cookies
    const cookieStore = await cookies();
    
    cookieStore.set('crm_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    cookieStore.set('crm_user_id', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        user_type: user.user_type
      }
    });

  } catch (error: any) {
    console.error('CRM login error:', error);
    return NextResponse.json({
      success: false,
      message: 'Login failed'
    }, { status: 500 });
  }
}
