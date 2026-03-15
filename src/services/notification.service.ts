import api from './api';

export const notificationService = {
  /**
   * Admin only: send a push notification to an app user. Title and body in English and Arabic; at least one of titleEn or titleAr required.
   */
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
};
