import axios, { AxiosError } from 'axios';
import { tokenStore } from './tokenStore';

/**
 * Standardized API Error shape for UI consumption
 */
export interface ApiError {
    message: string;
    status: number;
    code?: string;
    details?: any;
}

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Request Interceptor - Attach Authorization token
 * Uses TokenStore abstraction instead of direct localStorage access
 */
api.interceptors.request.use((config) => {
    const token = tokenStore.getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

/**
 * Response Interceptor - Normalize errors
 * 
 * IMPORTANT: This interceptor MUST NOT perform navigation or redirects.
 * - Redirects are handled by AuthGuard and RoleGuard components
 * - This interceptor only normalizes error responses for UI consumption
 */
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
        const apiError: ApiError = {
            message: 'An unexpected error occurred',
            status: error.response?.status || 500,
        };

        if (error.response) {
            const data = error.response.data as any;

            // Normalize error message from various backend formats
            apiError.message =
                data?.detail ||
                data?.message ||
                data?.error ||
                `Request failed with status ${error.response.status}`;

            apiError.code = data?.code;
            apiError.details = data?.errors || data?.validation_errors;

            // Log specific error types for debugging
            switch (error.response.status) {
                case 401:
                    console.warn('Unauthorized request - token may be expired');
                    // AuthGuard will handle redirect to /login
                    break;
                case 403:
                    console.warn('Forbidden - insufficient permissions');
                    // RoleGuard will handle redirect to appropriate page
                    break;
                case 422:
                    console.warn('Validation error:', apiError.details);
                    break;
                case 500:
                    console.error('Server error:', apiError.message);
                    break;
            }
        } else if (error.request) {
            apiError.message = 'Network error - please check your connection';
            apiError.status = 0;
        }

        // Reject with normalized error
        return Promise.reject(apiError);
    }
);

export default api;

