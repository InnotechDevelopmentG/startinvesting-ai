import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // Subdomain rewrite: admin.startinvesting.ai/* -> /admin/*
  if (
    host.startsWith('admin.') &&
    !pathname.startsWith('/admin') &&
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/admin' + (pathname === '/' ? '' : pathname);
    return NextResponse.rewrite(url);
  }

  // Protect /admin routes (except the login page itself)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const session = request.cookies.get('admin_session')?.value;
    const token = process.env.ADMIN_SESSION_TOKEN || process.env.ADMIN_PASSWORD;

    if (!token || session !== token) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = '/admin/login';
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.svg).*)'],
};
