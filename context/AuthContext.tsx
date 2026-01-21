"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService, User } from '@/services/authService';
import { getAccessToken, setAccessToken, setRefreshToken, clearTokens } from '@/lib/authTokens';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const KNOWN_ROLES = new Set(['consultant', 'manager', 'finance', 'director', 'admin']);

const normalizeUser = (rawUser: User | null): User | null => {
    if (!rawUser) return rawUser;
    const roleValue = rawUser.role ? rawUser.role.trim().toLowerCase() : '';
    const normalizedRole = KNOWN_ROLES.has(roleValue)
        ? roleValue
        : (rawUser.is_manager ? 'manager' : roleValue);
    return { ...rawUser, role: normalizedRole };
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Initialize auth state on mount
    useEffect(() => {
        const initializeAuth = async () => {
            const accessToken = getAccessToken();

            if (accessToken) {
                try {
                    // Validate token by fetching current user
                    const userData = await authService.getMe();
                    setUser(normalizeUser(userData));
                } catch (error) {
                    console.error('Failed to validate token:', error);
                    // Token is invalid, clear it
                    clearTokens();
                }
            }

            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    /**
     * Login user with email and password
     */
    const login = async (username: string, password: string): Promise<void> => {
        try {
            // Note: API wrapper calls it 'username' typically
            const response = await authService.login(username, password);
            let resolvedUser: User | null = null;

            // Store tokens
            // Ensure response keys match what backend sends. Assuming { access, refresh } based on simplejwt default
            // If backend sends { access_token, refresh_token }, we need to map it.
            // Using 'any' cast if needed to be safe or assuming updated authService types match.
            // My authService types say 'access' and 'refresh'.
            setAccessToken((response as any).access || (response as any).access_token);
            setRefreshToken((response as any).refresh || (response as any).refresh_token);

            // Set user state
            // If login response includes user
            if ((response as any).user) {
                resolvedUser = normalizeUser((response as any).user);
                setUser(resolvedUser);
            } else {
                // If not, fetch it
                const userData = await authService.getMe();
                resolvedUser = normalizeUser(userData);
                setUser(resolvedUser);
            }

            // Redirect based on role
            // Careful with User type, make sure it has 'role'
            const userRole = resolvedUser?.role || user?.role;
            if (userRole) {
                const roleRoutes: Record<string, string> = {
                    consultant: '/consultant',
                    manager: '/manager',
                    finance: '/finance',
                    director: '/director',
                    admin: '/finance',
                };
                const redirectPath = roleRoutes[userRole] || '/consultant';
                router.push(redirectPath);
            } else {
                router.push('/consultant');
            }

        } catch (error) {
            console.error('Login failed:', error);
            throw error;
        }
    };

    /**
     * Logout user
     */
    const logout = () => {
        // Clear tokens
        clearTokens();

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
            const userData = await authService.getMe();
            setUser(normalizeUser(userData));
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
