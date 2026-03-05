import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { randomBytes, createHash } from 'crypto';
import sql from '@/api-old/db/connection';
import { comparePassword } from '@/api-old/utils/password';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const SESSION_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = getClientIp(request);
    const { allowed, retryAfter } = checkRateLimit(ip);
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: `Too many login attempts. Try again in ${retryAfter} seconds.` },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, message: 'Username and password are required' },
        { status: 400 }
      );
    }

    const normalizedUsername = username.startsWith('@') ? username.substring(1) : username;

    const result = await sql`
      SELECT * FROM users 
      WHERE (LOWER(username) = LOWER(${normalizedUsername}) OR LOWER(email) = LOWER(${normalizedUsername}))
      AND user_type = 'admin'
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    const user = result.rows[0];
    const passwordMatch = await comparePassword(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { success: false, message: 'Invalid username or password' },
        { status: 401 }
      );
    }

    // Generate cryptographically random session token
    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

    // Store hashed token in DB
    await sql`
      INSERT INTO user_sessions (user_id, token_hash, user_type, expires_at)
      VALUES (${user.id}, ${tokenHash}, 'admin', ${expiresAt.toISOString()})
    `;

    // Set raw token in HttpOnly cookie (never stored server-side)
    const cookieStore = await cookies();
    cookieStore.set('admin_session', rawToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: SESSION_DURATION_MS / 1000,
      path: '/'
    });

    const displayName = (user.first_name && user.last_name)
      ? `${user.first_name} ${user.last_name}`
      : user.username;

    return NextResponse.json(
      {
        success: true,
        user: user.username,
        displayName,
        userId: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during login' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
