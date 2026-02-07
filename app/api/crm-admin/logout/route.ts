import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Clear CRM session cookies
    cookieStore.delete('crm_session');
    cookieStore.delete('crm_user_id');

    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('CRM logout error:', error);
    return NextResponse.json({
      success: false,
      message: 'Logout failed'
    }, { status: 500 });
  }
}
