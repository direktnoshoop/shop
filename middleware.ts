import { getToken } from 'next-auth/jwt';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip the login page itself
  if (pathname === '/admin/login') return NextResponse.next();

  // Protect all /admin/* routes
  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    if (!token) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
