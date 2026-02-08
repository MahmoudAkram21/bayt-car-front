export interface LoyaltyConfig {
    id: number;
    points_per_currency: number;
    cashback_per_point: number;
    min_points_redemption: number;
    is_active: boolean;
    updated_at: string;
}
export interface LoyaltyAccountWithUser {
    id: number;
    user_id: number;
    balance: number;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string | null;
        phone: string;
    };
}
export declare const loyaltyService: {
    getActiveConfig: () => Promise<{
        config: LoyaltyConfig | null;
    }>;
    getConfigs: () => Promise<{
        data: LoyaltyConfig[];
    }>;
    getConfigById: (id: number) => Promise<LoyaltyConfig>;
    createConfig: (data: {
        points_per_currency: number;
        cashback_per_point: number;
        min_points_redemption?: number;
        is_active?: boolean;
    }) => Promise<LoyaltyConfig>;
    updateConfig: (id: number, data: Partial<LoyaltyConfig>) => Promise<LoyaltyConfig>;
    getAccounts: () => Promise<{
        data: LoyaltyAccountWithUser[];
    }>;
    adjustPoints: (userId: number, amount: number, description: string) => Promise<any>;
};
