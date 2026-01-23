import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from '@/api-old/db/connection';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('admin_session');
    const userId = cookieStore.get('admin_user_id');

    // Check if session exists
    if (!sessionToken || !userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'Not authenticated',
          authenticated: false
        },
        { status: 401 }
      );
    }

    // Verify user still exists in database and is admin
    const result = await sql`
      SELECT id, username, email, first_name, last_name, is_super_user, user_type
      FROM users 
      WHERE id = ${userId.value}
      AND user_type = 'admin'
      LIMIT 1
    `;

    if (result.rows.length === 0) {
      // User no longer exists or is not admin - clear cookies
      cookieStore.delete('admin_session');
      cookieStore.delete('admin_user_id');
      
      return NextResponse.json(
        {
          success: false,
          message: 'Session invalid',
          authenticated: false
        },
        { status: 401 }
      );
    }

    const user = result.rows[0];

    // Compute display name
    const displayName = (user.first_name && user.last_name) 
      ? `${user.first_name} ${user.last_name}` 
      : user.username;

    // Return user info
    return NextResponse.json(
      {
        success: true,
        authenticated: true,
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
    console.error('Admin verification error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Verification failed',
        authenticated: false
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
