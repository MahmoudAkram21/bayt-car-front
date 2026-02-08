import api from './api';
import type { ServiceProvider, PaginatedResponse } from '../types';

export interface ProviderDetail {
  id: string;
  userId: string;
  businessName: { en: string; ar?: string };
  description: { en: string; ar?: string };
  phone: string;
  email: string;
  isVerified: boolean;
  isSuspended: boolean;
  rating: number;
  commercialReg?: string | null;
  user: { id: number; name: string; email: string | null; phone: string };
  requests_handled: Array<{
    id: number;
    status: string;
    final_agreed_price: number | null;
    created_at: string;
    service: { id: number; name: string; slug?: string };
    customer?: { id: number; name: string; email: string | null; phone: string };
  }>;
  services_performed: Array<{ id: number; name: string; slug?: string }>;
  wallet: { id: number; balance: number; frozen_balance: number } | null;
  stats: { totalJobs: number; completedJobs: number; totalEarnings: number };
}

export const providerService = {
  async getAllProviders(params?: {
    verified?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<ServiceProvider>> {
    const response = await api.get<PaginatedResponse<ServiceProvider>>('/providers', { params });
    return response.data;
  },

  async getProviderById(id: string): Promise<ServiceProvider> {
    const res = await api.get<{ provider: ServiceProvider }>(`/providers/${id}`);
    return res.data.provider;
  },

  async getProviderDetail(id: string): Promise<ProviderDetail> {
    const response = await api.get<ProviderDetail>(`/providers/${id}/detail`);
    return response.data;
  },

  async verifyProvider(id: string): Promise<ServiceProvider> {
    const res = await api.put<{ provider: ServiceProvider }>(`/providers/${id}/verify`);
    return res.data.provider;
  },

  async suspendProvider(id: string): Promise<ServiceProvider> {
    const res = await api.put<{ provider: ServiceProvider }>(`/providers/${id}/suspend`);
    return res.data.provider;
  },

  async unsuspendProvider(id: string): Promise<ServiceProvider> {
    const res = await api.put<{ provider: ServiceProvider }>(`/providers/${id}/unsuspend`);
    return res.data.provider;
  },

  async updateProvider(id: string, data: Partial<ServiceProvider>): Promise<ServiceProvider> {
    const response = await api.patch<ServiceProvider>(`/providers/${id}`, data);
    return response.data;
  },

  async adminUpdateProvider(id: string, data: { bio?: string; is_verified?: boolean; is_suspended?: boolean }): Promise<ServiceProvider> {
    const res = await api.patch<{ provider: ServiceProvider }>(`/providers/${id}/admin`, data);
    return res.data.provider;
  },

  async deleteProvider(id: string): Promise<void> {
    await api.delete(`/providers/${id}`);
  },
};
