import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const secret = process.env.NEXTAUTH_SECRET || 'development-secret-key-32-chars-minimum-length';
  const token = await getToken({ req, secret });
  const { pathname } = req.nextUrl;

  // Let /admin and /admin/login load directly so http://localhost:3000/admin is always accessible
  if (pathname.startsWith('/admin/users') || pathname.startsWith('/admin/settings')) {
    if (!token || token.role !== 'ADMIN') {
      const adminLoginUrl = new URL('/admin', req.url);
      return NextResponse.redirect(adminLoginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/users/:path*', '/admin/settings/:path*'],
};
