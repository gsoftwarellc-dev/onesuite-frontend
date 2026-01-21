"use client";

import { RoleGuard } from "@/components/guards/RoleGuard";

export default function DirectorLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RoleGuard allowedRoles={['director', 'admin']}>
            {children}
        </RoleGuard>
    );
}
