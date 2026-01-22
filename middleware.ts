import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('accessToken')?.value;
    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/forgot-password');

    const isPublicPath = request.nextUrl.pathname === '/access-denied';

    // If trying to access dashboard/protected routes without token
    if (!token && !isAuthPage && !isPublicPath && request.nextUrl.pathname !== '/') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // If trying to access login page while already authenticated
    if (token && isAuthPage) {
        // Determine where to redirect based on role is tricky in middleware without decoding token
        // So we just let them go to dashboard root which handles redirection
        // Or we can just redirect to default dashboard
        return NextResponse.redirect(new URL('/consultant', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|logo.png).*)',
    ],
};
