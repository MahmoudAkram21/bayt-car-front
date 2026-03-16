import api from './api';

export type BannerType = 'AD' | 'SERVICE';

export type SliderPlatform = 'ALL' | 'ANDROID' | 'IOS';

export interface Banner {
  id: string;
  image_url: string;
  type: BannerType;
  title?: string | null;
  description?: string | null;
  link?: string | null;
  service_id?: string | null;
  platform: SliderPlatform;
  valid_from?: string | null;
  valid_to?: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  service?: {
    id: string;
    name: string;
  };
}

export interface CreateBannerData {
  banner_image: File;
  type: BannerType;
  title?: string;
  description?: string;
  link?: string;
  service_id?: string;
  platform?: SliderPlatform;
  valid_from?: string;
  valid_to?: string;
  sort_order?: number;
  is_active?: boolean;
}

export interface UpdateBannerData {
  banner_image?: File;
  type?: BannerType;
  title?: string | null;
  description?: string | null;
  link?: string | null;
  service_id?: string | null;
  platform?: SliderPlatform;
  valid_from?: string | null;
  valid_to?: string | null;
  sort_order?: number;
  is_active?: boolean;
}

export const bannerService = {
  getBanners: async (filters?: { is_active?: boolean }) => {
    const response = await api.get<{ data: Banner[] }>('/banners', { params: filters });
    return response.data;
  },

  getBannerById: async (id: string) => {
    const response = await api.get<Banner>(`/banners/${id}`);
    return response.data;
  },

  createBanner: async (data: CreateBannerData) => {
    const formData = new FormData();
    formData.append('banner_image', data.banner_image);
    formData.append('type', data.type);
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.link) formData.append('link', data.link);
    if (data.service_id) formData.append('service_id', data.service_id);
    if (data.platform) formData.append('platform', data.platform);
    if (data.valid_from) formData.append('valid_from', data.valid_from);
    if (data.valid_to) formData.append('valid_to', data.valid_to);
    if (data.sort_order !== undefined) formData.append('sort_order', data.sort_order.toString());
    formData.append('is_active', (data.is_active ?? true).toString());

    const response = await api.post<Banner>('/banners', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  updateBanner: async (id: string, data: UpdateBannerData) => {
    const formData = new FormData();
    if (data.banner_image) formData.append('banner_image', data.banner_image);
    if (data.type) formData.append('type', data.type);
    if (data.title !== undefined) formData.append('title', data.title || '');
    if (data.description !== undefined) formData.append('description', data.description || '');
    if (data.link !== undefined) formData.append('link', data.link || '');
    if (data.service_id !== undefined) formData.append('service_id', data.service_id || '');
    if (data.platform) formData.append('platform', data.platform);
    if (data.valid_from !== undefined) formData.append('valid_from', data.valid_from || '');
    if (data.valid_to !== undefined) formData.append('valid_to', data.valid_to || '');
    if (data.sort_order !== undefined) formData.append('sort_order', data.sort_order.toString());
    if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString());

    const response = await api.patch<Banner>(`/banners/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  deleteBanner: async (id: string) => {
    await api.delete(`/banners/${id}`);
  },

  getActiveBanners: async (platform: SliderPlatform = 'ALL') => {
    const response = await api.get<{ data: Banner[] }>('/banners/app', { params: { platform } });
    return response.data;
  },
};
