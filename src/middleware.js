import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Protected routes list
  const isProtectedRoute =
    pathname === '/' ||
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/doctors') ||
    pathname.startsWith('/patients');

  const isAuthRoute = pathname === '/login';


  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }


  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/doctors/:path*', '/patients/:path*', '/login'],
};