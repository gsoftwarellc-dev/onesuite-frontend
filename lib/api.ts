import axios, { AxiosError } from 'axios';
import { getAccessToken, getRefreshToken, setAccessToken, setRefreshToken, clearTokens } from './authTokens';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
api.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response Interceptor
api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as any;

        // Handle 401 Unauthorized - Try token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = getRefreshToken();

            if (refreshToken) {
                try {
                    // Attempt to refresh token
                    // Use a new axios instance to avoid interceptor loops
                    const response = await axios.post(
                        `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api'}/users/auth/refresh/`,
                        { refresh: refreshToken }
                    );

                    const { access, refresh } = response.data;

                    setAccessToken(access);
                    // Backend might rotate refresh token, update if provided
                    if (refresh) {
                        setRefreshToken(refresh);
                    }

                    // Retry with new token
                    originalRequest.headers.Authorization = `Bearer ${access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    // Refresh failed - clear tokens and redirect to login
                    clearTokens();
                    if (typeof window !== 'undefined') {
                        window.location.href = '/login';
                    }
                    return Promise.reject(refreshError);
                }
            } else {
                // No refresh token - redirect to login
                clearTokens();
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            }
        }

        // Handle 403 Forbidden - User doesn't have permission
        if (error.response?.status === 403) {
            // Don't clear tokens, don't retry - just redirect to access-denied
            if (typeof window !== 'undefined' && !window.location.pathname.includes('/access-denied')) {
                window.location.href = '/access-denied';
            }
            return Promise.reject(error);
        }

        // Handle 422 Validation Error - Pass through for component to handle
        // No special action needed - error will be handled by calling component

        // Handle 500 Server Error - Log but don't crash
        // No special action needed - error will be handled by calling component

        return Promise.reject(error);
    }
);

export default api;

