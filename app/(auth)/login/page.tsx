"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function LoginPage() {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await login(formData.email, formData.password);
            toast.success('Logged in successfully');
        } catch (error: any) {
            console.error('Login error:', error);
            const message = error?.message || error?.response?.data?.detail || 'Failed to login';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value,
        });
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-80px)] w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8">
            {/* Login Card */}
            <div className="bg-white rounded-lg shadow-xl p-8 md:p-10 w-full">
                {/* Logo */}
                <div className="flex justify-center mb-6">
                    <div className="w-32 h-32 bg-white rounded-full shadow-lg flex items-center justify-center p-4 relative">
                        <Image
                            src="/logo.png"
                            alt="One Suite Advisory"
                            fill
                            className="object-contain p-4"
                            priority
                        />
                    </div>
                </div>

                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl mb-2 font-bold text-gray-900">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to access your dashboard</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div className="space-y-2">
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email Address
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <Mail className="w-5 h-5" />
                            </div>
                            <Input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                placeholder="you@company.com"
                                className="pl-10 h-11"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <Lock className="w-5 h-5" />
                            </div>
                            <Input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Enter your password"
                                className="pl-10 pr-10 h-11"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Forgot Password */}
                    <div className="text-right">
                        <Link href="/forgot-password" className="text-sm text-[#F4323D] hover:text-[#d62d37] font-medium">
                            Forgot password?
                        </Link>
                    </div>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#F4323D] hover:bg-[#d62d37] text-white h-11 text-base"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                <span>Logging in...</span>
                            </>
                        ) : (
                            <>
                                <span>Login</span>
                                <ArrowRight className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </Button>
                </form>

                {/* Sign Up Link */}
                <div className="mt-6 text-center">
                    <p className="text-gray-600 text-sm">
                        Don't have an account?{' '}
                        <Link href="/signup" className="text-[#F4323D] hover:text-[#d62d37] font-medium">
                            Sign Up
                        </Link>
                    </p>
                </div>
            </div>

            {/* Help Text */}
            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                    Need help?{' '}
                    <a
                        href="mailto:support@onesuite.com.sg"
                        className="text-[#F4323D] hover:text-[#d62d37] underline"
                    >
                        Contact Support
                    </a>
                </p>
            </div>
        </div>
    );
}
