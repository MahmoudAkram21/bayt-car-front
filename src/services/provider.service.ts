import api from './api';
import type { ServiceProvider, PaginatedResponse } from '../types';

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
    const response = await api.get<ServiceProvider>(`/providers/${id}`);
    return response.data;
  },

  async verifyProvider(id: string): Promise<ServiceProvider> {
    const response = await api.patch<ServiceProvider>(`/providers/${id}/verify`);
    return response.data;
  },

  async updateProvider(id: string, data: Partial<ServiceProvider>): Promise<ServiceProvider> {
    const response = await api.patch<ServiceProvider>(`/providers/${id}`, data);
    return response.data;
  },

  async deleteProvider(id: string): Promise<void> {
    await api.delete(`/providers/${id}`);
  },
};
