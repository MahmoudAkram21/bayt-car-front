import api from './api';

export type SliderPlatform = 'ALL' | 'ANDROID' | 'IOS';

export interface Slider {
  id: number;
  image_url: string;
  title: string | null;
  description: string | null;
  action_url: string | null;
  platform: SliderPlatform;
  valid_from: string | null;
  valid_to: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const slidersService = {
  list: (params?: { is_active?: boolean; platform?: SliderPlatform }) =>
    api.get<{ data: Slider[] }>('/sliders', { params }).then((r) => r.data),
  getById: (id: number) => api.get<Slider>(`/sliders/${id}`).then((r) => r.data),
  create: (data: Partial<Slider> & { image_url: string }) => api.post<Slider>('/sliders', data).then((r) => r.data),
  update: (id: number, data: Partial<Slider>) => api.patch<Slider>(`/sliders/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/sliders/${id}`),
};
