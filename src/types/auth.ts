
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    name: string;
    image: string;
    employeeId: string;
    department: string;
    email: string;
    phoneNumber: string;
    location: string;
    password: string;
    role?: string;
    
}

export interface RefreshRequest {
    refreshToken: string;
}

export interface UpdateProfileRequest {
    name?: string;
    image?: string;
    department?: string;
    phoneNumber?: string;
    location?: string;
    embedding?: number[];
}


export interface User {
    _id: string;
    name: string;
    image?: string;
    employeeId?: string;
    department?: string;
    email?: string;
    phoneNumber?: string;
    location?: string;
    status?: string;
    role?: string;
    token?: string; // ✅ include token
}

export interface AuthState {
    user: User | null;
    token: string | null; // ✅ track access token
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

export interface AuthResponse {
    success: boolean;
    user: User | null;
    accessToken?: string;
    refreshToken?: string
    message?: string; // add this
    error?: string;
    token: string; // ✅ add this
}