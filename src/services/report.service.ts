import api from './api';

export interface Report {
  id: number;
  report_type: string;
  title: string | null;
  period_from: string | null;
  period_to: string | null;
  summary: Record<string, unknown> | null;
  created_at: string;
  created_by: number | null;
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
};
