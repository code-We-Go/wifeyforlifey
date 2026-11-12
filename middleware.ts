import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { withAuth } from 'next-auth/middleware';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware(routing);

// Routes that require authentication (checked both with and without /ar prefix)
const protectedRoutes = ['/account', '/create-admin'];

const authMiddleware = withAuth(
  function onSuccess(req) {
    return intlMiddleware(req);
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Strip locale prefix if present (e.g. /ar/account -> /account)
  const pathnameWithoutLocale = pathname.replace(/^\/ar(\/|$)/, '/');

  const isProtected = protectedRoutes.some(
    (route) => pathnameWithoutLocale === route || pathnameWithoutLocale.startsWith(`${route}/`)
  );

  if (isProtected) {
    return (authMiddleware as any)(request);
  }

  return intlMiddleware(request);
}

export const config = {
  // Match all paths except:
  // - api routes (/api/...)
  // - _next (Next.js internals)
  // - _vercel (Vercel internals)
  // - static files (anything containing an extension like .jpg, .png, .ico, etc.)
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};