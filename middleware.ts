import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check for the access_token cookie (matching what we will set in authTokens.ts)
    const token = request.cookies.get('access_token')?.value;

    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/forgot-password');

    const isPublicPath = request.nextUrl.pathname === '/access-denied';

    // If trying to access dashboard/protected routes without token
    if (!token && !isAuthPage && !isPublicPath && request.nextUrl.pathname !== '/') {
        // Redirect to login preserving the return URL
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If trying to access login page while already authenticated
    if (token && isAuthPage) {
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
