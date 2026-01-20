"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // TODO: Integrate with backend password reset endpoint when available
            // await authService.forgotPassword(email);

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            setIsSubmitted(true);
            toast.success('Password reset link sent to your email');
        } catch (error: any) {
            console.error('Password reset error:', error);
            toast.error('Failed to send reset link');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-80px)] w-full max-w-md mx-auto p-4 sm:p-6 lg:p-8">
            {/* Card */}
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

                {!isSubmitted ? (
                    <>
                        <div className="mb-8 text-center">
                            <h1 className="text-3xl md:text-4xl mb-2 font-bold text-gray-900">Forgot Password?</h1>
                            <p className="text-gray-600">Enter your email to reset your password</p>
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
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        placeholder="you@company.com"
                                        className="pl-10 h-11"
                                    />
                                </div>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#F4323D] hover:bg-[#d62d37] text-white h-11 text-base mt-2"
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                        <span className="text-white">Sending Link...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-white">Reset Password</span>
                                        <ArrowRight className="w-5 h-5 ml-2 text-white" />
                                    </>
                                )}
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="text-center space-y-6">
                        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-sm">
                            If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.
                        </div>
                        <Button
                            onClick={() => setIsSubmitted(false)}
                            variant="outline"
                            className="w-full"
                        >
                            Try another email
                        </Button>
                    </div>
                )}

                {/* Back to Login Link */}
                <div className="mt-6 text-center">
                    <Link href="/login" className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium text-sm">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Login
                    </Link>
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
