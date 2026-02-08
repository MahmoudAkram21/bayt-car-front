import type { User } from '../types';
interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isHydrated: boolean;
    login: (user: User, token: string) => void;
    logout: () => void;
    setUser: (user: User) => void;
    hydrate: () => void;
}
export declare const useAuthStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AuthState>>;
export {};
