import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear client session cookies
    cookieStore.delete('client_session');
    cookieStore.delete('client_id');

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Client logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Logout failed'
    }, { status: 500 });
  }
}
