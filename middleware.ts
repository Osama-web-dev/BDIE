import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Middleware for route protection.
 * Redirects unauthenticated users to /login and authenticated users away from auth pages.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const accessToken = req.cookies.get('access_token')?.value;

  // 1. Define protected and public routes
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/';
  const isDashboardPage = pathname.startsWith('/dashboard') ||
    pathname.startsWith('/users') ||
    pathname.startsWith('/simulations') ||
    pathname.startsWith('/analysis') ||
    pathname.startsWith('/notifications') ||
    pathname.startsWith('/audit') ||
    pathname.startsWith('/settings');

  // 2. Redirect logic
  if (!accessToken && isDashboardPage) {
    const url = new URL('/login', req.url);
    // Remember where they were trying to go
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  if (accessToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

/**
 * Configure middleware to run on specific paths.
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - screenshots (README screenshots)
     * - public (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|screenshots|public).*)',
  ],
};
