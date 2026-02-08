import api from './api';

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

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
  },

  async getRecentBookings(limit: number = 10) {
    const response = await api.get('/bookings', { params: { limit, sort: '-createdAt' } });
    return response.data;
  },

  async getAllWallets(): Promise<{ data: WalletWithUser[] }> {
    const response = await api.get<{ data: WalletWithUser[] }>('/dashboard/wallets');
    return response.data;
  },
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
