import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Clear authentication cookies
    const cookieStore = await cookies();
    
    // Clear session cookies (adjust names based on your auth system)
    cookieStore.delete('auth_token');
    cookieStore.delete('session_id');
    cookieStore.delete('admin_session');
    cookieStore.delete('admin_user_id');
    
    return NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Logout failed' },
      { status: 500 }
    );
  }
}
