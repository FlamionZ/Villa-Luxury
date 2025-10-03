import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Handle static file caching
  if (request.nextUrl.pathname.startsWith('/uploads/')) {
    const response = NextResponse.next();
    
    // Add caching headers for uploaded files
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    
    return response;
  }

  // Handle admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const response = NextResponse.next();
    
    // Add security headers for admin routes
    response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    response.headers.set('X-Frame-Options', 'DENY');
    
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/uploads/:path*',
    '/admin/:path*',
    // Don't run middleware on these paths
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};