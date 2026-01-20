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

    useEffect(() => {
        if (user && !allowedRoles.includes(user.role as UserRole)) {
            // User is authenticated but doesn't have permission
            // Redirect to their default dashboard based on role
            const roleRoutes: Record<UserRole, string> = {
                consultant: '/consultant',
                manager: '/manager',
                finance: '/finance',
                director: '/director',
                admin: '/finance',
            };

            const redirectPath = roleRoutes[user.role as UserRole] || '/403';
            router.push(redirectPath);
        }
    }, [user, allowedRoles, router]);

    // If user doesn't have permission, don't render children (redirect will happen)
    if (user && !allowedRoles.includes(user.role as UserRole)) {
        return null;
    }

    // User has required role, render protected content
    return <>{children}</>;
}
