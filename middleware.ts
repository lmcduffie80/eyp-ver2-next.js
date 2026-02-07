import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CRM Admin protection
  if (pathname.startsWith('/crm-admin')) {
    const crmSession = request.cookies.get('crm_session');
    
    // Allow access to login page
    if (pathname === '/crm-admin/login') {
      return NextResponse.next();
    }
    
    // Redirect to login if no session
    if (!crmSession) {
      return NextResponse.redirect(new URL('/crm-admin/login', request.url));
    }
  }

  // Client Portal protection
  if (pathname.startsWith('/client-portal')) {
    const clientSession = request.cookies.get('client_session');
    
    // Allow access to login and activate pages
    if (pathname === '/client-portal/login' || pathname.startsWith('/client-portal/activate')) {
      return NextResponse.next();
    }
    
    // Redirect to login if no session
    if (!clientSession) {
      return NextResponse.redirect(new URL('/client-portal/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/crm-admin/:path*',
    '/client-portal/:path*',
  ],
};
