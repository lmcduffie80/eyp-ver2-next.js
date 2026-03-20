import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect admin routes (excluding the login page itself)
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin-login');

  if (isAdminRoute) {
    const adminSession = request.cookies.get('admin_session');
    if (!adminSession?.value) {
      const loginUrl = new URL('/admin-login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect DJ dashboard routes (excluding the DJ login page)
  const isDJDashboardRoute = pathname.startsWith('/dj-dashboard');

  if (isDJDashboardRoute) {
    const djSession = request.cookies.get('dj_session');
    if (!djSession?.value) {
      const loginUrl = new URL('/DJ', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/admin-login',
    '/dj-dashboard/:path*',
    '/DJ/:path*'
  ]
};
