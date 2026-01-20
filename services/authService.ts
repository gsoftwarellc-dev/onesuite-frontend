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
     * POST /api/auth/login/
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/login/', { email, password });
        return response.data;
    },

    /**
     * Register new user (if applicable)
     * POST /api/auth/register/
     */
    async register(data: any): Promise<LoginResponse> {
        const response = await api.post<LoginResponse>('/auth/register/', data);
        return response.data;
    },

    /**
     * Refresh access token using refresh token
     * POST /api/auth/refresh/
     */
    async refreshToken(refresh: string): Promise<RefreshTokenResponse> {
        const response = await api.post<RefreshTokenResponse>('/auth/refresh/', { refresh });
        return response.data;
    },

    /**
     * Get current authenticated user
     * GET /api/users/me/
     */
    async getCurrentUser(): Promise<User> {
        const response = await api.get<User>('/users/me/');
        return response.data;
    },

    /**
     * Logout (backend endpoint optional)
     * POST /api/auth/logout/
     */
    async logout(): Promise<void> {
        try {
            await api.post('/auth/logout/');
        } catch (error) {
            console.warn('Logout endpoint failed, proceeding with client-side logout', error);
        }
    }
};

