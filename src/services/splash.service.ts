import api from './api';

export type SplashPlatform = 'ALL' | 'ANDROID' | 'IOS';

export interface SplashScreen {
  id: number;
  image_url: string;
  title: string | null;
  description: string | null;
  action_url: string | null;
  platform: SplashPlatform;
  valid_from: string | null;
  valid_to: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const splashService = {
  list: (params?: { is_active?: boolean; platform?: SplashPlatform }) =>
    api.get<{ data: SplashScreen[] }>('/splash', { params }).then((r) => r.data),
  getById: (id: number) => api.get<SplashScreen>(`/splash/${id}`).then((r) => r.data),
  create: (data: Partial<SplashScreen> & { image_url: string }) => api.post<SplashScreen>('/splash', data).then((r) => r.data),
  update: (id: number, data: Partial<SplashScreen>) => api.patch<SplashScreen>(`/splash/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/splash/${id}`),
};
