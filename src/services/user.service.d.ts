import type { User, PaginatedResponse } from '../types';
export declare const userService: {
    getAllUsers(params?: {
        role?: string;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<User>>;
    getUserById(id: string): Promise<User>;
    createUser(data: {
        name: {
            en: string;
            ar?: string;
        };
        email: string;
        phone?: string;
        role: string;
    }): Promise<User>;
    updateUser(id: string, data: Partial<User>): Promise<User>;
    deleteUser(id: string): Promise<void>;
    activateUser(id: string): Promise<User>;
    deactivateUser(id: string): Promise<User>;
    /** Suspend user (same as deactivate) */
    suspendUser(id: string): Promise<User>;
};
