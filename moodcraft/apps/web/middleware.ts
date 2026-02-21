import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    if (!token) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const role = token.role;

    // B2C individual routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/mood-mirror') ||
        pathname.startsWith('/journal') || pathname.startsWith('/breath-loops') ||
        pathname.startsWith('/companion') || pathname.startsWith('/escalation') ||
        pathname.startsWith('/community') || pathname.startsWith('/profile') ||
        pathname.startsWith('/settings')) {
      if (role !== 'INDIVIDUAL' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Corporate routes
    if (pathname.startsWith('/corporate')) {
      if (role !== 'HR' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Clinical routes
    if (pathname.startsWith('/clinical')) {
      if (role !== 'THERAPIST' && role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Admin routes
    if (pathname.startsWith('/admin')) {
      if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }

    // Onboarding redirect for individuals who haven't completed it
    if (role === 'INDIVIDUAL' && !pathname.startsWith('/onboarding') && !pathname.startsWith('/api')) {
      // This check will be handled client-side with profile data
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/mood-mirror/:path*',
    '/journal/:path*',
    '/breath-loops/:path*',
    '/companion/:path*',
    '/escalation/:path*',
    '/community/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
    '/corporate/:path*',
    '/clinical/:path*',
    '/admin/:path*',
  ],
};
