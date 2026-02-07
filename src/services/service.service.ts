import api from './api';
import type { Service, ServiceCategory, ServiceDetail, PaginatedResponse } from '../types';

export type CategoryCreateInput = {
  name: string;
  slug: string;
  description?: string;
  icon_url?: string;
  sort_order?: number;
};

export const serviceService = {
  // Categories
  async getAllCategories(): Promise<ServiceCategory[]> {
    const response = await api.get<ServiceCategory[]>('/service-categories');
    return response.data;
  },

  async getCategoryById(id: string): Promise<ServiceCategory> {
    const response = await api.get<ServiceCategory>(`/service-categories/${id}`);
    return response.data;
  },

  async createCategory(data: CategoryCreateInput): Promise<ServiceCategory> {
    const response = await api.post<ServiceCategory>('/service-categories', data);
    return response.data;
  },

  async updateCategory(id: string, data: Partial<CategoryCreateInput>): Promise<ServiceCategory> {
    const response = await api.patch<ServiceCategory>(`/service-categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string): Promise<void> {
    await api.delete(`/service-categories/${id}`);
  },

  // Services
  async getAllServices(params?: {
    categoryId?: string;
    providerId?: string;
    isActive?: boolean;
    search?: string;
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
