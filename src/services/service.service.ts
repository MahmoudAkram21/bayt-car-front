import api from './api';
import type { Service, ServiceDetail, PaginatedResponse } from '../types';

export const serviceService = {
  async getAllServices(params?: {
    isNegotiable?: boolean;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Service>> {
    const response = await api.get<PaginatedResponse<Service>>('/services', { params });
    return response.data;
  },

  async getServiceById(id: string): Promise<ServiceDetail> {
    const response = await api.get<{ service?: ServiceDetail } | ServiceDetail>(`/services/${id}`);
    const data = response.data as { service?: ServiceDetail };
    return (data.service ?? data) as ServiceDetail;
  },

  async updateService(id: string, data: Partial<Service>): Promise<Service> {
    const response = await api.patch<Service>(`/services/${id}`, data);
    return response.data;
  },

  async deleteService(id: string): Promise<void> {
    await api.delete(`/services/${id}`);
  },

  async activateService(id: string): Promise<Service> {
    const response = await api.patch<Service>(`/services/${id}`, { isActive: true });
    return response.data;
  },

  async deactivateService(id: string): Promise<Service> {
    const response = await api.patch<Service>(`/services/${id}`, { isActive: false });
    return response.data;
  },
};
