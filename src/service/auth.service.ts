import api, { setAccessToken } from '@/lib/axiosInstance';
import { BASE_URL } from '@/lib/api/apiUrl';
import { AuthResponse, LoginRequest, UpdateProfileRequest, RegisterRequest, User } from '@/types/auth';

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export class AuthService {
    static async register(payload: RegisterRequest): Promise<AuthResponse> {
        const { data } = await api.post<ApiResponse<AuthResponse>>(BASE_URL.AUTH_API.REGISTER, payload, { withCredentials: true });
        if (!data.success) throw new Error(data.message || 'Registration failed');
        setAccessToken(data.data.token || null);
        return data.data;
    }

    static async login(payload: LoginRequest): Promise<AuthResponse> {
        const { data } = await api.post<ApiResponse<AuthResponse>>(BASE_URL.AUTH_API.LOGIN, payload, { withCredentials: true });
        if (!data.success) throw new Error(data.message || 'Login failed');
        setAccessToken(data.data.token || null);
        return data.data;
    }

    static async refreshToken(): Promise<string> {
        const { data } = await api.post<ApiResponse<{ token: string }>>(BASE_URL.AUTH_API.REFRESH, undefined, { withCredentials: true });
        if (!data.success) throw new Error(data.message || 'Failed to refresh token');
        setAccessToken(data.data.token);
        return data.data.token;
    }

    static async logout(): Promise<void> {
        await api.post(BASE_URL.AUTH_API.LOGOUT, undefined, { withCredentials: true });
        setAccessToken(null);
    }

    static async getProfile(): Promise<User> {
        const { data } = await api.get<ApiResponse<User>>(BASE_URL.AUTH_API.GET_ME, { withCredentials: true });
        if (!data.success) throw new Error(data.message || 'Failed to fetch profile');
        return data.data;
    }

    static async updateProfile(payload: UpdateProfileRequest): Promise<User> {
        const { data } = await api.put<ApiResponse<User>>(BASE_URL.AUTH_API.GET_ME, payload, { withCredentials: true });
        if (!data.success) throw new Error(data.message || 'Failed to update profile');
        if ((data.data as any).token) setAccessToken((data.data as any).token);
        return data.data;
    }
}
