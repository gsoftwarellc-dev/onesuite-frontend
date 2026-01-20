"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSkeleton } from '@/components/loading-skeleton';

interface AuthGuardProps {
    children: React.ReactNode;
}

/**
 * AuthGuard - Protects routes from unauthenticated access
 * 
 * Responsibilities:
 * - Redirect unauthenticated users to /login
 * - Show loading state while auth is resolving
 * - Allow authenticated users to proceed
 * 
 * This is the ONLY component that performs auth-related redirects
 */
export function AuthGuard({ children }: AuthGuardProps) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            // Store the attempted URL to redirect back after login
            const returnUrl = pathname !== '/login' ? pathname : null;
            const loginUrl = returnUrl
                ? `/login?returnUrl=${encodeURIComponent(returnUrl)}`
                : '/login';

            router.push(loginUrl);
        }
    }, [isLoading, isAuthenticated, router, pathname]);

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSkeleton />
            </div>
        );
    }

    // If not authenticated, don't render children (redirect will happen)
    if (!isAuthenticated) {
        return null;
    }

    // User is authenticated, render protected content
    return <>{children}</>;
}
