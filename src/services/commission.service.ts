import api from './api';
import type { Commission, PaginatedResponse, PaymentMethod } from '../types';

export const commissionService = {
  async getAllCommissions(params?: {
    isPaid?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Commission>> {
    const response = await api.get<PaginatedResponse<Commission>>('/commissions', { params });
    return response.data;
  },

  async markAsPaid(id: string, paymentMethod: PaymentMethod): Promise<Commission> {
    const response = await api.patch<Commission>(`/commissions/${id}/pay`, { paymentMethod });
    return response.data;
  },

  async getCommissionStats(): Promise<{
    totalUnpaid: number;
    totalPaid: number;
    suspendedProviders: number;
  }> {
    const response = await api.get('/commissions/stats');
    return response.data;
  },
};
