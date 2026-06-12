import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function proxy(request: NextRequest) {
  const token = request.cookies.get('auth_token')?.value;
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');
  const isDashboardRoute =
    request.nextUrl.pathname.startsWith('/tickets') ||
    request.nextUrl.pathname.startsWith('/dashboard');

  let isValid = false;

  if (token) {
    try {
      await jwtVerify(token, secret);
      isValid = true;
    } catch {
      isValid = false;
    }
  }

  if (!isValid && isDashboardRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isValid && isAuthRoute) {
    return NextResponse.redirect(new URL('/tickets', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/tickets/:path*', '/dashboard/:path*', '/login'],
};
