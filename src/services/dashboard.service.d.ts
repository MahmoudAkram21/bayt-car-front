export interface DashboardStats {
    totalUsers: number;
    activeProviders: number;
    totalBookings: number;
    platformRevenue: number;
    totalWallets?: number;
    totalWalletBalance?: number;
    totalFrozenBalance?: number;
    totalReports?: number;
    totalServiceRequests?: number;
    totalInvoiceRevenue?: number;
    totalPlatformCommission?: number;
    totalTaxCollected?: number;
    totalTransactions?: number;
    totalDiscounts?: number;
    totalCashback?: number;
    totalRegions?: number;
    topRegions?: {
        region: string;
        count: number;
    }[];
    commissionByService?: {
        serviceName: string;
        commission: number;
    }[];
    providersByService?: {
        serviceName: string;
        providerCount: number;
    }[];
    providersByRating?: {
        avgRating: number;
        totalReviews: number;
        ratingDistribution?: {
            range: string;
            count: number;
        }[];
    };
    servicesIndicators?: {
        completedRequests: number;
        cancelledRequests: number;
        openRequests: number;
        byServiceAndRegion?: {
            serviceName: string;
            regions: {
                region: string;
                count: number;
            }[];
        }[];
    };
    totalCustomers?: number;
    totalProviders?: number;
    activeUsers?: number;
    totalPaidRequests?: number;
    openAfterPayment?: number;
    completedAfterPayment?: number;
    totalCancelled?: number;
    loyaltyPointsBalance?: number;
    loyaltyAccountsCount?: number;
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
