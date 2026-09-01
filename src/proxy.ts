import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Edge Proxy for Defense-in-Depth Route Protection
 * Provides proactive routing defense for /admin and /doctor paths.
 * Note: Server APIs and App Layout continue performing authoritative token validation.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow public assets, static files, and public routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/health') ||
    pathname.startsWith('/api/exercises') ||
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // 2. Proactive defense for admin and doctor routes:
  if (pathname.startsWith('/admin') || pathname.startsWith('/doctor')) {
    const response = NextResponse.next();
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
