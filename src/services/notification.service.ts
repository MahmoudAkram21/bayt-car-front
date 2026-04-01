import api from './api';

export type BroadcastTarget = 'ALL' | 'CUSTOMERS' | 'PROVIDERS';

export interface BroadcastLog {
  id: string;
  target: BroadcastTarget;
  title_en: string | null;
  title_ar: string | null;
  body_en: string | null;
  body_ar: string | null;
  total_users: number;
  success_count: number;
  error_count: number;
  created_by: string;
  created_at: string;
}

export interface BroadcastResponse {
  success: boolean;
  message: string;
  successCount: number;
  errorCount: number;
}

export interface BroadcastLogsResponse {
  data: BroadcastLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const notificationService = {
  async sendToUser(params: {
    userId: string;
    titleEn?: string;
    titleAr?: string;
    bodyEn?: string;
    bodyAr?: string;
  }): Promise<{ success: boolean; message: string }> {
    const response = await api.post<{ success: boolean; message: string }>('/notifications/send', params);
    return response.data;
  },

  async broadcast(data: {
    target: BroadcastTarget;
    titleEn?: string;
    titleAr?: string;
    bodyEn?: string;
    bodyAr?: string;
  }): Promise<BroadcastResponse> {
    const response = await api.post<BroadcastResponse>('/notifications/broadcast', data);
    return response.data;
  },

  async getBroadcastLogs(page = 1, limit = 20): Promise<BroadcastLogsResponse> {
    const response = await api.get<BroadcastLogsResponse>('/notifications/broadcast/logs', {
      params: { page, limit },
    });
    return response.data;
  },
};
