import Cookies from 'js-cookie';

export const setAccessToken = (token: string) => {
    if (typeof window !== 'undefined') {
        // Set in localStorage (legacy/client-side access)
        localStorage.setItem('access_token', token);

        // Set in Cookies (for Middleware/Server-side access)
        Cookies.set('access_token', token, {
            expires: 1 / 24, // 1 hour (aligns roughly with typical JWT expiry)
            secure: window.location.protocol === 'https:', // Secure if on HTTPS
            sameSite: 'Lax'
        });
    }
};

export const getAccessToken = (): string | null => {
    if (typeof window !== 'undefined') {
        // Try cookie first (primary source of truth for auth state)
        const cookieToken = Cookies.get('access_token');
        if (cookieToken) return cookieToken;

        // Fallback to localStorage
        return localStorage.getItem('access_token');
    }
    return null;
};

export const setRefreshToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', token);
        Cookies.set('refresh_token', token, {
            expires: 7, // 7 days
            secure: window.location.protocol === 'https:',
            sameSite: 'Lax'
        });
    }
};

export const getRefreshToken = (): string | null => {
    if (typeof window !== 'undefined') {
        const cookieToken = Cookies.get('refresh_token');
        if (cookieToken) return cookieToken;

        return localStorage.getItem('refresh_token');
    }
    return null;
};

export const clearTokens = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        Cookies.remove('access_token');
        Cookies.remove('refresh_token');
    }
};
