export interface DashboardStats {
    totalUsers: number;
    activeProviders: number;
    totalBookings: number;
    platformRevenue: number;
    totalWallets?: number;
    totalWalletBalance?: number;
    totalFrozenBalance?: number;
    totalReports?: number;
}
export declare const dashboardService: {
    getStats(): Promise<DashboardStats>;
    getRecentBookings(limit?: number): Promise<any>;
    getAllWallets(): Promise<{
        data: WalletWithUser[];
    }>;
};
export interface WalletWithUser {
    id: number;
    user_id: number;
    balance: number;
    frozen_balance: number;
    user?: {
        id: number;
        name: string;
        email: string | null;
        phone: string;
        is_provider: boolean;
    };
}
