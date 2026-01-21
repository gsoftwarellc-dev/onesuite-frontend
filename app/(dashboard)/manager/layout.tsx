"use client";

import { RoleGuard } from "@/components/guards/RoleGuard";

export default function ManagerLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RoleGuard allowedRoles={['manager', 'director', 'admin']}>
            {children}
        </RoleGuard>
    );
}
