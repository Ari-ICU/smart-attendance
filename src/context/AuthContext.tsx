'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
    LoginRequest,
    RegisterRequest,
    AuthResponse,
    UpdateProfileRequest,
    User,
} from '@/types/auth';
import { AuthService } from '@/service/auth.service';
import { getAccessToken, setAccessToken } from '@/lib/axiosInstance';

export interface AuthContextProps {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (data: LoginRequest) => Promise<AuthResponse>;
    register: (data: RegisterRequest) => Promise<AuthResponse>;
    refresh: () => Promise<AuthResponse>;
    logout: () => Promise<void>;
    updateProfile: (data: UpdateProfileRequest) => Promise<AuthResponse>;
    clearError: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setTokenState] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const isAuthenticated = !!user;

    // Auto-clear errors after 5 seconds
    useEffect(() => {
        if (!error) return;
        const timer = setTimeout(() => setError(null), 5000);
        return () => clearTimeout(timer);
    }, [error]);

    const setErrorWithTimeout = (msg: string) => setError(msg);

    const logIfDev = (label: string, data: any) => {
        if (process.env.NODE_ENV === 'development') {
            console.log(`[AuthContext] ${label}:`, data);
        }
    };

    // ---------------------------
    // Auth actions
    // ---------------------------

    const login = async (data: LoginRequest) => {
        setIsLoading(true);
        try {
            const res = await AuthService.login(data);
            setUser(res.user);
            setTokenState(res.token || null);
            setAccessToken(res.token || null);
            setError(null);
            return res;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Login failed';
            setErrorWithTimeout(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (data: RegisterRequest) => {
        setIsLoading(true);
        setError(null);
        try {
            logIfDev('Registering with data', { ...data, password: '***' });
            const res = await AuthService.register(data);
            setUser(res.user);
            setTokenState(res.token || null);
            setAccessToken(res.token || null);
            return res;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || 'Registration failed';
            logIfDev('Registration error', err);
            setErrorWithTimeout(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const refresh = async () => {
        setIsLoading(true);
        try {
            const newToken = await AuthService.refreshToken(); // string
            setTokenState(newToken);
            setAccessToken(newToken);

            // Fetch user after refreshing
            const refreshedUser = await AuthService.getProfile();
            setUser(refreshedUser);

            setError(null);
            return { token: newToken, user: refreshedUser } as AuthResponse;
        } catch (err: any) {
            setUser(null);
            setTokenState(null);
            setAccessToken(null);
            const errorMessage = err.message || 'Failed to refresh token';
            setErrorWithTimeout(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };


    const logout = async () => {
        setIsLoading(true);
        try {
            await AuthService.logout().catch((err) => logIfDev('Logout server error', err));
        } finally {
            setUser(null);
            setTokenState(null);
            setAccessToken(null);
            setError(null);
            setIsLoading(false);
        }
    };

    const updateProfile = async (data: UpdateProfileRequest) => {
        setIsLoading(true);
        const optimisticUser = user ? { ...user, ...data } : null;
        if (optimisticUser) setUser(optimisticUser); // Optimistic update

        try {
            const updatedUser = await AuthService.updateProfile(data);
            setUser(updatedUser);
            setError(null);
            return { user: updatedUser, token: token || '' } as AuthResponse;
        } catch (err: any) {
            if (user) setUser(user); // rollback
            const errorMessage = err.message || 'Failed to update profile';
            setErrorWithTimeout(errorMessage);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const clearError = () => setError(null);

    // ---------------------------
    // Initialize user on mount
    // ---------------------------
    useEffect(() => {
        (async () => {
            if (typeof window === 'undefined') return;

            const savedToken = getAccessToken();
            if (savedToken) {
                setTokenState(savedToken);
                setAccessToken(savedToken); // ✅ important before getProfile
                try {
                    const me = await AuthService.getProfile();
                    setUser(me);
                } catch (err) {
                    logIfDev('Session expired', err);
                    setUser(null);
                    setTokenState(null);
                    setAccessToken(null);
                }
            }
            setIsLoading(false);
        })();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                isAuthenticated,
                isLoading,
                error,
                login,
                register,
                refresh,
                logout,
                updateProfile,
                clearError,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = (): AuthContextProps => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
