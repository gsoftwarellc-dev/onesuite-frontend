"use client";

import { RoleGuard } from "@/components/guards/RoleGuard";

export default function ConsultantLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RoleGuard allowedRoles={['consultant', 'manager', 'director', 'admin']}>
            {children}
        </RoleGuard>
    );
}
