import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import sql from '@/api-old/db/connection';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('crm_session');
    const userId = cookieStore.get('crm_user_id');

    if (!session || !userId) {
      return NextResponse.json({
        authenticated: false
      }, { status: 401 });
    }

    // Get user from database
    const result = await sql`
      SELECT id, username, email, user_type
      FROM users 
      WHERE id = ${parseInt(userId.value)}
      LIMIT 1
    `;

    const users = result.rows || result;

    if (!users || users.length === 0) {
      return NextResponse.json({
        authenticated: false
      }, { status: 401 });
    }

    const user = users[0];

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        user_type: user.user_type
      }
    });

  } catch (error) {
    console.error('CRM verify error:', error);
    return NextResponse.json({
      authenticated: false
    }, { status: 500 });
  }
}
