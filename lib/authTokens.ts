export const setAccessToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('access_token', token);
    }
};

export const getAccessToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('access_token');
    }
    return null;
};

export const setRefreshToken = (token: string) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', token);
    }
};

export const getRefreshToken = (): string | null => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('refresh_token');
    }
    return null;
};

export const clearTokens = () => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
    }
};
