import api from './api';

export interface TaxSettings {
  id: number;
  is_enabled: boolean;
  tax_percent: number;
  updated_at: string;
}

export const taxService = {
  getActive: () => api.get<{ settings: TaxSettings | null }>('/tax/active').then((r) => r.data),
  list: () => api.get<{ data: TaxSettings[] }>('/tax').then((r) => r.data),
  getById: (id: number) => api.get<TaxSettings>(`/tax/${id}`).then((r) => r.data),
  create: (data: { is_enabled?: boolean; tax_percent: number }) => api.post<TaxSettings>('/tax', data).then((r) => r.data),
  update: (id: number, data: Partial<TaxSettings>) => api.patch<TaxSettings>(`/tax/${id}`, data).then((r) => r.data),
};
