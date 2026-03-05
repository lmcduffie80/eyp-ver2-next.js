import { NextResponse } from 'next/server';
import sql from '@/api-old/db/connection';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { success: false, message: 'Username must be at least 3 characters long' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Check for existing username or email
    const existing = await sql`
      SELECT id FROM users
      WHERE LOWER(username) = LOWER(${username}) OR LOWER(email) = LOWER(${email})
      LIMIT 1
    `;

    if (existing.rows.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Username or email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await sql`
      INSERT INTO users (username, email, password, user_type)
      VALUES (${username}, ${email}, ${passwordHash}, 'dj')
    `;

    return NextResponse.json(
      { success: true, message: 'Account created successfully' },
      { status: 201 }
    );

  } catch (error) {
    console.error('DJ signup error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
