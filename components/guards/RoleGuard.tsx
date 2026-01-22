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
            // DEBUGGING: Commenting out redirect to show debug info on screen
            // router.push('/access-denied');
        }
    }, [user, hasAccess, router]);

    // If user doesn't have permission, don't render children (redirect will happen)
    if (user && !hasAccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 text-white p-10">
                <div className="bg-red-600 p-8 rounded shadow-lg">
                    <h1 className="text-2xl font-bold mb-4">ACCESS DENIED DEBUGGER</h1>
                    <p className="text-lg">Your Role: <strong>{user.role}</strong> (Normalized: {normalizedRole})</p>
                    <p className="text-lg">Allowed Roles: <strong>{allowedRoles.join(', ')}</strong></p>
                    <div className="mt-4 p-4 bg-black/20 rounded">
                        <pre>{JSON.stringify(user, null, 2)}</pre>
                    </div>
                </div>
            </div>
        );
    }

    // User has required role, render protected content
    return <>{children}</>;
}
