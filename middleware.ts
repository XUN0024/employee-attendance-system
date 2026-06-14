import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySession } from './lib/session';

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip API routes - they handle their own authentication
    if (pathname.startsWith('/api/')) {
        return NextResponse.next();
    }

    // Public routes that don't require authentication
    const publicRoutes = ['/', '/login', '/home'];
    const isPublicRoute = publicRoutes.some(route => pathname === route);

    if (isPublicRoute) {
        return NextResponse.next();
    }

    // Get session token from cookie
    const token = request.cookies.get('session')?.value;

    if (!token) {
        // Redirect to login if no token
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Verify token
    const session = await verifySession(token);

    if (!session) {
        // Invalid or expired token - clear cookie and redirect
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('session');
        return response;
    }

    // Role-based access control
    if (pathname.startsWith('/admin')) {
        if (session.role !== 'admin') {
            // Employee trying to access admin routes - forbidden
            return NextResponse.redirect(new URL('/employee/dashboard', request.url));
        }
    }

    if (pathname.startsWith('/employee')) {
        if (session.role !== 'employee') {
            // Admin trying to access employee routes - redirect to admin
            return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         * - api routes that handle their own auth
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
