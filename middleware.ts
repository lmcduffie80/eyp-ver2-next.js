import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
    '/dj-dashboard/:path*',
    '/DJ/:path*'
  ]
};
