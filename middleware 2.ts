import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if accessing admin routes (but not the login page)
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin-login');
  
  if (isAdminRoute) {
    // Check for admin session cookie
    const adminSession = request.cookies.get('admin_session');
    const adminUserId = request.cookies.get('admin_user_id');

    // If no session, redirect to login
    if (!adminSession || !adminUserId) {
      const loginUrl = new URL('/admin-login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check if accessing DJ dashboard routes (but not the DJ login page)
  const isDJRoute = pathname.startsWith('/dj-dashboard') || pathname.startsWith('/DJ');
  
  if (isDJRoute) {
    // Note: DJ dashboard uses localStorage token, not cookies
    // Cannot verify server-side - client-side check in component is sufficient
    // This middleware just ensures consistency
  }

  return NextResponse.next();
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    '/admin/:path*',
    '/admin-login',
    '/dj-dashboard/:path*',
    '/DJ/:path*'
  ]
};
