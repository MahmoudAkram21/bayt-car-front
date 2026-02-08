import api from './api';

export interface ServiceCategory {
  id: number;
  name_ar: string;
  name_en: string | null;
  slug: string;
  sort_order: number;
  is_active: boolean;
  services?: Array<{ id: number; name: string; slug: string; description?: string | null; is_negotiable: boolean; gps_radius_km?: number | null; category_id?: number | null }>;
}

export const serviceCategoryService = {
  list: (params?: { is_active?: boolean }) =>
    api.get<{ data: ServiceCategory[] }>('/service-categories', { params }).then((r) => r.data),
  getById: (id: number) => api.get<ServiceCategory>(`/service-categories/${id}`).then((r) => r.data),
};
