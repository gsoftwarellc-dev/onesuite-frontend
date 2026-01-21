"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type UserRole = 'consultant' | 'manager' | 'finance' | 'director' | 'admin';

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: UserRole[];
}

/**
 * RoleGuard - Enforces role-based access control
 * 
 * Responsibilities:
 * - Check if user's role is in allowedRoles
 * - Redirect unauthorized users to their appropriate dashboard or /403
 * - Allow authorized users to proceed
 * 
 * Note: This component assumes user is already authenticated (use with AuthGuard)
 */
export function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
    const { user } = useAuth();
    const router = useRouter();
    const normalizedRole = user?.role ? user.role.trim().toLowerCase() : '';
    const hasAccess = !!user && (
        allowedRoles.includes(normalizedRole as UserRole) ||
        (user.is_manager && allowedRoles.includes('manager'))
    );

    useEffect(() => {
        if (user && !hasAccess) {
            // User is authenticated but doesn't have permission
            // Redirect to access denied page
            router.push('/access-denied');
        }
    }, [user, hasAccess, router]);

    // If user doesn't have permission, don't render children (redirect will happen)
    if (user && !hasAccess) {
        return null;
    }

    // User has required role, render protected content
    return <>{children}</>;
}
