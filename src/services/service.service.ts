import api from './api';
import type { Service, ServiceDetail, PaginatedResponse, ServiceIconShape } from '../types';

export interface UpdateServiceCatalogData {
  category_id?: string | null;
  gps_radius_km?: number | null;
  name?: string;
  description?: string | null;
  icon_url?: string | null;
  is_active?: boolean;
  is_emergency?: boolean;
  icon_shape?: ServiceIconShape | string | null;
  display_color?: string | null;
  sort_order?: number;
}

export const serviceService = {
  async getAllServices(params?: {
    categoryId?: string | number | null;
    isActive?: boolean;
    is_emergency?: boolean;
    isNegotiable?: boolean;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Service>> {
    const response = await api.get<PaginatedResponse<Service> | { data: Service[]; pagination: { total: number; page: number; limit: number } }>('/services', { params });
    const d = response.data;
    if (d && 'pagination' in d && d.pagination) {
      return { data: d.data, total: d.pagination.total, page: d.pagination.page, limit: d.pagination.limit };
    }
    return d as PaginatedResponse<Service>;
  },

  /** Admin: update service catalog and display (category, gps_radius_km, name, description, icon_url, is_active, is_emergency, icon_shape, display_color, sort_order) */
  async updateServiceCatalog(id: string, data: UpdateServiceCatalogData): Promise<{ service: Service }> {
    const response = await api.patch<{ message: string; service: Service }>(`/services/${id}/catalog`, data);
    return response.data;
  },

  /** Admin: upload service icon (multipart form with field "icon") */
  async uploadServiceIcon(id: string, file: File): Promise<{ service: Service }> {
    const formData = new FormData();
    formData.append('icon', file);
    const response = await api.patch<{ message: string; service: Service }>(`/services/${id}/icon`, formData);
    return response.data;
  },

  async getServiceById(id: string): Promise<ServiceDetail> {
    const response = await api.get<{ service?: ServiceDetail } | ServiceDetail>(`/services/${id}`);
    const data = response.data as { service?: ServiceDetail };
    return (data.service ?? data) as ServiceDetail;
  },

  async updateService(id: string, data: Partial<Service>): Promise<Service> {
    const response = await api.put<Service>(`/services/${id}`, data);
    return response.data;
  },

  async deleteService(id: string): Promise<void> {
    await api.delete(`/services/${id}`);
  },

  /** Admin: set service active (uses catalog PATCH with is_active) */
  async activateService(id: string): Promise<Service> {
    const res = await api.patch<{ service: Service }>(`/services/${id}/catalog`, { is_active: true });
    return res.data.service;
  },

  /** Admin: set service inactive (uses catalog PATCH with is_active) */
  async deactivateService(id: string): Promise<Service> {
    const res = await api.patch<{ service: Service }>(`/services/${id}/catalog`, { is_active: false });
    return res.data.service;
  },

  // Attributes
  async createAttribute(serviceId: string, data: any): Promise<any> {
    const response = await api.post(`/services/${serviceId}/attributes`, data);
    return response.data;
  },

  async updateAttribute(serviceId: string, attributeId: string, data: any): Promise<any> {
    const response = await api.patch(`/services/${serviceId}/attributes/${attributeId}`, data);
    return response.data;
  },

  async deleteAttribute(serviceId: string, attributeId: string): Promise<void> {
    await api.delete(`/services/${serviceId}/attributes/${attributeId}`);
  },
};
