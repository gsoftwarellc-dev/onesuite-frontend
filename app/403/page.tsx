import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ForbiddenPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full text-center px-6">
                <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <ShieldAlert className="w-10 h-10 text-red-600" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Access Denied</h2>

                <p className="text-gray-600 mb-8">
                    You don't have permission to access this page.
                    Please contact your administrator if you believe this is an error.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/login">
                        <Button variant="outline">
                            Back to Login
                        </Button>
                    </Link>
                    <Link href="/">
                        <Button>
                            Go to Dashboard
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
