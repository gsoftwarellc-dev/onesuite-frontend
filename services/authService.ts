import api from '@/lib/api';

export interface User {
    id: string;
    email: string;
    username: string;
    role: string;
    [key: string]: any;
}

export interface LoginResponse {
    access: string;
    refresh: string;
    user: User; // Assuming backend returns user on login, otherwise fetch me after login
    [key: string]: any;
}

export const authService = {
    login: async (username: string, password: string) => {
        const response = await api.post('/users/auth/login/', { username, password });
        return response.data;
    },

    refreshToken: async (refresh: string) => {
        const response = await api.post('/users/auth/refresh/', { refresh });
        return response.data;
    },

    getMe: async () => {
        const response = await api.get('/users/auth/me/');
        return response.data;
    },
};
