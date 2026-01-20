/**
 * Token Storage Abstraction
 * 
 * Provides a flexible token storage mechanism that can be swapped
 * between memory, localStorage, or future implementations (httpOnly cookies, mobile secure storage)
 * 
 * Default: MemoryTokenStore (secure, but lost on refresh)
 * Fallback: LocalStorageTokenStore (TEMPORARY - for development/testing only)
 */

export interface TokenStore {
    getAccessToken(): string | null;
    getRefreshToken(): string | null;
    setTokens(accessToken: string, refreshToken?: string): void;
    clearTokens(): void;
}

/**
 * MemoryTokenStore - Tokens stored in memory (secure, session-based)
 * Recommended for production with proper refresh token flow
 */
export class MemoryTokenStore implements TokenStore {
    private accessToken: string | null = null;
    private refreshToken: string | null = null;

    getAccessToken(): string | null {
        return this.accessToken;
    }

    getRefreshToken(): string | null {
        return this.refreshToken;
    }

    setTokens(accessToken: string, refreshToken?: string): void {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken || null;
    }

    clearTokens(): void {
        this.accessToken = null;
        this.refreshToken = null;
    }
}

/**
 * LocalStorageTokenStore - TEMPORARY implementation for development
 * 
 * ⚠️ WARNING: Not recommended for production
 * - Vulnerable to XSS attacks
 * - Use only during development or until httpOnly cookies are implemented
 */
export class LocalStorageTokenStore implements TokenStore {
    private readonly ACCESS_TOKEN_KEY = 'access_token';
    private readonly REFRESH_TOKEN_KEY = 'refresh_token';

    getAccessToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(this.ACCESS_TOKEN_KEY);
    }

    getRefreshToken(): string | null {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    }

    setTokens(accessToken: string, refreshToken?: string): void {
        if (typeof window === 'undefined') return;
        localStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken);
        if (refreshToken) {
            localStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken);
        }
    }

    clearTokens(): void {
        if (typeof window === 'undefined') return;
        localStorage.removeItem(this.ACCESS_TOKEN_KEY);
        localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    }
}

// Export singleton instances
// Switch between Memory and LocalStorage based on environment
// For development: use LocalStorageTokenStore to persist across refreshes
// For production: switch to MemoryTokenStore or httpOnly cookie implementation
export const tokenStore: TokenStore =
    process.env.NODE_ENV === 'development'
        ? new LocalStorageTokenStore()
        : new MemoryTokenStore();
