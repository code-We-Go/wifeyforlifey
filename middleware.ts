import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { withAuth } from 'next-auth/middleware';

export default withAuth(
  function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;
    
    // Define protected and public routes
    const protectedRoutes = ["/account"];
    const publicRoutes = ["/", "/login", "/signin", "/signup", "/create-admin", "/register"];
    
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
    const isPublicRoute = publicRoutes.includes(path);

    // If it's a protected route, NextAuth will handle authentication
    // If it's a public route, allow access
    if (!isProtectedRoute && !isPublicRoute) {
      return NextResponse.next();
    }

    // For public routes, allow access regardless of auth status
    if (isPublicRoute) {
      return NextResponse.next();
    }

    // For protected routes, NextAuth will handle the authentication
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;
        
        // Define protected routes
        const protectedRoutes = ["/account"];
        const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
        
        // If it's a protected route, require authentication
        if (isProtectedRoute) {
          return !!token;
        }
        
        // For all other routes, allow access
        return true;
      },
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    // Only run middleware on specific routes that need authentication
    '/account/:path*',

    '/create-admin',
  ],
}; 