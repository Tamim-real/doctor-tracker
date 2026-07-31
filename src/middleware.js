import { NextResponse } from 'next/server';

export function middleware(request) {
  const token = request.cookies.get('token')?.value; 
  const { pathname } = request.nextUrl;


  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  
  const isPublicApiRoute = pathname.startsWith('/api/auth');


  if (isPublicApiRoute) {
    return NextResponse.next();
  }

  if (!token && !isAuthRoute) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

 
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public images/assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};