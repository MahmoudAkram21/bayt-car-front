import api from './api';

export interface Report {
  id: string | number;
  report_type: string;
  title: string | null;
  period_from: string | null;
  period_to: string | null;
  summary: Record<string, unknown> | null;
  created_at: string;
  created_by: string | number | null;
}

export const reportService = {
  async getAll(params?: { report_type?: string; page?: number; limit?: number }): Promise<{ data: Report[]; total: number }> {
    const response = await api.get<{ data: Report[]; total: number }>('/reports', { params });
    return response.data;
  },

  async getById(id: string): Promise<Report> {
    const response = await api.get<Report>(`/reports/${id}`);
    return response.data;
  },

  async generateWalletSummary(period_from?: string, period_to?: string): Promise<Report> {
    const response = await api.post<Report>('/reports/generate/wallet-summary', { period_from, period_to });
    return response.data;
  },

  async generateFinancialSummary(period_from?: string, period_to?: string): Promise<Report> {
    const response = await api.post<Report>('/reports/generate/financial', { period_from, period_to });
    return response.data;
  },

  async generateServicesByRegion(period_from?: string, period_to?: string): Promise<Report> {
    const response = await api.post<Report>('/reports/generate/services-by-region', { period_from, period_to });
    return response.data;
  },

  async generateOpenAfterPayment(period_from?: string, period_to?: string): Promise<Report> {
    const response = await api.post<Report>('/reports/generate/open-after-payment', { period_from, period_to });
    return response.data;
  },

  async generateUsersDetailed(period_from?: string, period_to?: string): Promise<Report> {
    const response = await api.post<Report>('/reports/generate/users-detailed', { period_from, period_to });
    return response.data;
  },

  async generateCancelledRequests(period_from?: string, period_to?: string): Promise<Report> {
    const response = await api.post<Report>('/reports/generate/cancelled-requests', { period_from, period_to });
    return response.data;
  },

  async generateLoyaltyPoints(period_from?: string, period_to?: string): Promise<Report> {
    const response = await api.post<Report>('/reports/generate/loyalty-points', { period_from, period_to });
    return response.data;
  },

  async generateSupportTickets(period_from?: string, period_to?: string): Promise<Report> {
    const response = await api.post<Report>('/reports/generate/support-tickets', { period_from, period_to });
    return response.data;
  },

  async generateDiscounts(period_from?: string, period_to?: string): Promise<Report> {
    const response = await api.post<Report>('/reports/generate/discounts', { period_from, period_to });
    return response.data;
  },

  async generateInvoicesByService(period_from?: string, period_to?: string): Promise<Report> {
    const response = await api.post<Report>('/reports/generate/invoices-by-service', { period_from, period_to });
    return response.data;
  },

  async generateServicesIndicators(period_from?: string, period_to?: string): Promise<Report> {
    const response = await api.post<Report>('/reports/generate/services-indicators', { period_from, period_to });
    return response.data;
  },

  async generateProvidersByService(period_from?: string, period_to?: string): Promise<Report> {
    const response = await api.post<Report>('/reports/generate/providers-by-service', { period_from, period_to });
    return response.data;
  },

  async generateProvidersByRating(period_from?: string, period_to?: string): Promise<Report> {
    const response = await api.post<Report>('/reports/generate/providers-by-rating', { period_from, period_to });
    return response.data;
  },
};
