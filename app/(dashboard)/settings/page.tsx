"use client";

import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Calendar, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';

export default function SettingsPage() {
    const router = useRouter();
    const { user, logout } = useAuth();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
            </div>

            {/* Profile Information */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Profile Information</h2>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 bg-[#F4323D] rounded-full flex items-center justify-center text-white text-3xl font-bold">
                            {user?.username?.substring(0, 2).toUpperCase() || "U"}
                        </div>
                        <div>
                            <h3 className="text-2xl font-semibold mb-1">{user?.username}</h3>
                            <p className="text-gray-600">{user?.email || 'No email set'}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize">
                                {user?.role}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <User className="w-4 h-4 inline-block mr-2" />
                                Username
                            </label>
                            <Input value={user?.username || ''} disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Mail className="w-4 h-4 inline-block mr-2" />
                                Email Address
                            </label>
                            <Input value={user?.email || 'Not set'} disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Shield className="w-4 h-4 inline-block mr-2" />
                                Role
                            </label>
                            <Input value={user?.role || ''} disabled className="capitalize" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Security */}
            <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold">Security</h2>
                </div>
                <div className="p-6 space-y-4">
                    <Button variant="outline" className="w-full md:w-auto">
                        Change Password
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={logout}
                        className="w-full md:w-auto bg-red-600 hover:bg-red-700"
                    >
                        Sign Out
                    </Button>
                </div>
            </div>
        </div>
    );
}
