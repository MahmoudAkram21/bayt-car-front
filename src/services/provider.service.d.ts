import type { ServiceProvider, PaginatedResponse } from '../types';
export interface ProviderDetail {
    id: string;
    userId: string;
    businessName: {
        en: string;
        ar?: string;
    };
    description: {
        en: string;
        ar?: string;
    };
    phone: string;
    email: string;
    isVerified: boolean;
    isSuspended: boolean;
    rating: number;
    commercialReg?: string | null;
    user: {
        id: number;
        name: string;
        email: string | null;
        phone: string;
    };
    requests_handled: Array<{
        id: number;
        status: string;
        final_agreed_price: number | null;
        created_at: string;
        service: {
            id: number;
            name: string;
            slug?: string;
        };
        customer?: {
            id: number;
            name: string;
            email: string | null;
            phone: string;
        };
    }>;
    services_performed: Array<{
        id: number;
        name: string;
        slug?: string;
    }>;
    wallet: {
        id: number;
        balance: number;
        frozen_balance: number;
    } | null;
    stats: {
        totalJobs: number;
        completedJobs: number;
        totalEarnings: number;
    };
}
export declare const providerService: {
    getAllProviders(params?: {
        verified?: boolean;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<ServiceProvider>>;
    getProviderById(id: string): Promise<ServiceProvider>;
    getProviderDetail(id: string): Promise<ProviderDetail>;
    verifyProvider(id: string): Promise<ServiceProvider>;
    suspendProvider(id: string): Promise<ServiceProvider>;
    unsuspendProvider(id: string): Promise<ServiceProvider>;
    updateProvider(id: string, data: Partial<ServiceProvider>): Promise<ServiceProvider>;
    adminUpdateProvider(id: string, data: {
        bio?: string;
        is_verified?: boolean;
        is_suspended?: boolean;
    }): Promise<ServiceProvider>;
    deleteProvider(id: string): Promise<void>;
};
