import api from './api';

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
  user?: { id: number; name: string; email: string | null; phone: string };
}

export const loyaltyService = {
  getActiveConfig: () => api.get<{ config: LoyaltyConfig | null }>('/loyalty/config').then((r) => r.data),
  getConfigs: () => api.get<{ data: LoyaltyConfig[] }>('/loyalty/configs').then((r) => r.data),
  getConfigById: (id: number) => api.get<LoyaltyConfig>(`/loyalty/configs/${id}`).then((r) => r.data),
  createConfig: (data: { points_per_currency: number; cashback_per_point: number; min_points_redemption?: number; is_active?: boolean }) =>
    api.post<LoyaltyConfig>('/loyalty/configs', data).then((r) => r.data),
  updateConfig: (id: number, data: Partial<LoyaltyConfig>) => api.patch<LoyaltyConfig>(`/loyalty/configs/${id}`, data).then((r) => r.data),
  getAccounts: () => api.get<{ data: LoyaltyAccountWithUser[] }>('/loyalty/accounts').then((r) => r.data),
  adjustPoints: (userId: number, amount: number, description: string) =>
    api.post(`/loyalty/accounts/${userId}/adjust`, { amount, description }).then((r) => r.data),
};
