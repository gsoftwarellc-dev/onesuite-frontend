"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AccessDeniedPage() {
    const { logout } = useAuth();

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
            <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-lg shadow-xl">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <ShieldAlert className="w-8 h-8 text-red-600" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900">Access Denied</h1>

                <p className="text-gray-600">
                    You do not have permission to access this page. If you believe this is an error, please contact your administrator.
                </p>

                <div className="pt-4 space-y-3 flex flex-col">
                    <Button asChild className="w-full bg-[#1e293b] hover:bg-[#0f172a]">
                        <Link href="/">
                            Go to Dashboard
                        </Link>
                    </Button>

                    <Button variant="outline" onClick={logout} className="w-full">
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
