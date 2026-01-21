"use client";

import { RoleGuard } from "@/components/guards/RoleGuard";

export default function FinanceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <RoleGuard allowedRoles={['finance', 'admin', 'director']}>
            {children}
        </RoleGuard>
    );
}
