"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User, LoginResponse } from '@/services/authService';
import { tokenStore } from '@/lib/tokenStore';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const accessToken = tokenStore.getAccessToken();

            if (accessToken) {
                try {
                    // Validate token by fetching current user
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                } catch (error) {
                    console.error('Failed to validate token:', error);
                    // Token is invalid, clear it
                    tokenStore.clearTokens();
                }
            }

            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    /**
     * Login user with email and password
     * Stores tokens via TokenStore abstraction
     */
    const login = async (email: string, password: string): Promise<void> => {
        try {
            const response: LoginResponse = await authService.login(email, password);

            // Store tokens using TokenStore abstraction
            tokenStore.setTokens(response.access_token, response.refresh_token);

            // Set user state
            setUser(response.user);

            // Redirect based on role
            const roleRoutes: Record<string, string> = {
                consultant: '/consultant',
                manager: '/manager',
                finance: '/finance',
                director: '/director',
                admin: '/finance', // Admin goes to finance dashboard
            };

            const redirectPath = roleRoutes[response.user.role] || '/consultant';
            router.push(redirectPath);
        } catch (error) {
            console.error('Login failed:', error);
            throw error; // Let the UI handle the error
        }
    };

    /**
     * Logout user
     * Clears tokens and redirects to login
     */
    const logout = () => {
        // Call backend logout (optional)
        authService.logout().catch(err => {
            console.warn('Backend logout failed:', err);
        });

        // Clear tokens
        tokenStore.clearTokens();

        // Clear user state
        setUser(null);

        // Redirect to login
        router.push('/login');
    };

    /**
     * Refresh user data from backend
     */
    const refreshUserData = async (): Promise<void> => {
        try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
        } catch (error) {
            console.error('Failed to refresh user data:', error);
            // If refresh fails, logout
            logout();
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                refreshUserData
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
