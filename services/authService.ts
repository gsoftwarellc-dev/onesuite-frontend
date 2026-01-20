import api from '@/lib/api';

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    name?: string; // Computed full name
    role: 'consultant' | 'manager' | 'finance' | 'admin' | 'director';
    contactNumber?: string;
    joinedDate?: string;
}

export interface LoginResponse {
    access_token: string; // Backend uses access_token
    refresh_token?: string; // Backend uses refresh_token
    user: User;
}

export interface RefreshTokenResponse {
    access_token: string;
    refresh_token?: string;
}

export const authService = {
    /**
     * Authenticate user with email and password
     * POST /api/users/auth/login/
     * Note: Backend expects 'username' not 'email'
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/users/auth/login/', {
            username: email,  // Backend expects 'username' field
            password
        });
        return response.data;
    },

    /**
     * Refresh access token using refresh token
     * POST /api/users/auth/refresh/
     */
    async refreshToken(refresh: string): Promise<RefreshTokenResponse> {
        const response = await api.post<RefreshTokenResponse>('/users/auth/refresh/', { refresh });
        return response.data;
    },

    /**
     * Get current authenticated user
     * GET /api/users/auth/me/
     */
    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/users/auth/me/');
        return response.data;
    },

    /**
     * Logout (backend endpoint optional)
     * POST /api/users/auth/logout/
     */
    async logout(): Promise<void> {
        try {
            await api.post('/users/auth/logout/');
        } catch (error) {
            console.warn('Logout endpoint failed, proceeding with client-side logout', error);
        }
    },

    /**
     * Register a new user
     * POST /api/users/
     */
    async register(data: { email: string; password: string; first_name: string; last_name: string }): Promise<User> {
        // Map email to username as required by backend
        const payload = {
            ...data,
            username: data.email
        };
        const response = await api.post<User>('/users/', payload);
        return response.data;
    }
};

