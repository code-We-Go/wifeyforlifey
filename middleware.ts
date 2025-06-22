import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { isAuthFromRequest } from '@/utils/auth';

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Only check authentication for specific protected routes
  const protectedRoutes = ["/account"];
  const publicRoutes = ["/","/login", "/signin", "/signup", "/create-admin"];
  
  const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
  const isPublicRoute = publicRoutes.includes(path);

  // Skip authentication check for non-protected routes
  if (!isProtectedRoute && !isPublicRoute) {
    return NextResponse.next();
  }

  // Only run authentication check when needed
  const { isAuth } = isAuthFromRequest(request);

  // If trying to access protected route without token
  if (isProtectedRoute && !isAuth) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If trying to access public route with token, redirect to home
  if (isPublicRoute && isAuth) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Only run middleware on specific routes that need authentication
    '/account/:path*',
    '/login',
    '/signin',
    '/signup',
    '/create-admin'
  ],
}; 