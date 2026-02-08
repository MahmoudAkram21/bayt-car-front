import type { LoginRequest, LoginResponse, User } from '../types';
export declare const authService: {
    login(credentials: LoginRequest): Promise<LoginResponse>;
    logout(): Promise<void>;
    getCurrentUser(): Promise<User>;
    refreshToken(refreshToken: string): Promise<{
        accessToken: string;
    }>;
};
