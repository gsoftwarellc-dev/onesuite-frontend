"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { User, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
    username: z.string().min(1, 'Username is required'),
    password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
    const { login } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: '',
            password: '',
        },
    });

    const onSubmit = async (data: LoginFormValues) => {
        setIsLoading(true);

        try {
            await login(data.username, data.password);
            toast.success('Logged in successfully');
        } catch (error: any) {
            console.error('Login error:', error);
            const message = error?.response?.data?.detail || error?.response?.data?.message || 'Failed to login. Please check your credentials.';
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
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

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Username Field */}
                    <div className="space-y-2">
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                                <User className="w-5 h-5" />
                            </div>
                            <Input
                                {...register('username')}
                                type="text"
                                id="username"
                                placeholder="Enter your username"
                                className={`pl-10 h-11 ${errors.username ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                            />
                        </div>
                        {errors.username && (
                            <p className="text-sm text-red-500 mt-1">{errors.username.message}</p>
                        )}
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
                                {...register('password')}
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="Enter your password"
                                className={`pl-10 pr-10 h-11 ${errors.password ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
                        {errors.password && (
                            <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>
                        )}
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
