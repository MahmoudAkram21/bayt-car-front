import api from './api';

export interface DashboardStats {
  totalUsers: number;
  activeProviders: number;
  totalBookings: number;
  platformRevenue: number;
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
};
