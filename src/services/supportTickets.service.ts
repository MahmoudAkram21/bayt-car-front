import api from './api';
import type { SupportTicketItem, SupportTicketsResponse } from '../types';

export const supportTicketsService = {
  async getSupportTickets(params?: {
    page?: number;
    limit?: number;
  }): Promise<SupportTicketsResponse> {
    const response = await api.get<SupportTicketsResponse>('/service-requests', {
      params: { view: 'support', ...params },
    });
    return response.data;
  },

  async getServiceRequestById(id: string): Promise<{ serviceRequest: SupportTicketItem & Record<string, unknown> }> {
    const response = await api.get<{ serviceRequest: SupportTicketItem & Record<string, unknown> }>(
      `/service-requests/${id}`
    );
    return response.data;
  },

  async updateFlag(
    id: string,
    payload: { is_flagged_for_support: boolean; admin_note?: string | null }
  ): Promise<{ serviceRequest: SupportTicketItem & Record<string, unknown> }> {
    const response = await api.patch<{ serviceRequest: SupportTicketItem & Record<string, unknown> }>(
      `/service-requests/${id}/flag`,
      payload
    );
    return response.data;
  },
};
