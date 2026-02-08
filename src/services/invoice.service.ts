import api from './api';

export type InvoiceStatus = 'PAID' | 'REFUNDED';

export interface Invoice {
  id: number;
  service_request_id: number;
  invoice_number: string;
  status: InvoiceStatus;
  payment_method: string | null;
  customer_snapshot: Record<string, unknown>;
  provider_snapshot: Record<string, unknown>;
  service_name: string;
  base_price: number;
  commission_amount: number;
  tax_amount: number;
  discount_amount: number;
  cashback_used: number;
  final_paid_amount: number;
  created_at: string;
}

export const invoiceService = {
  list: (params?: { status?: InvoiceStatus; limit?: number }) =>
    api.get<{ data: Invoice[] }>('/invoices', { params }).then((r) => r.data),
  getById: (id: number) => api.get<Invoice>(`/invoices/${id}`).then((r) => r.data),
  getByServiceRequest: (serviceRequestId: number) => api.get<Invoice>(`/invoices/by-request/${serviceRequestId}`).then((r) => r.data),
  createForServiceRequest: (serviceRequestId: number) =>
    api.post<Invoice>(`/invoices/service-request/${serviceRequestId}`).then((r) => r.data),
  getPdfUrl: (id: number) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('token');
    return `${base}/invoices/${id}/pdf${token ? `?token=${token}` : ''}`;
  },
  getQrUrl: (id: number) => {
    const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const token = localStorage.getItem('token');
    return `${base}/invoices/${id}/qr${token ? `?token=${token}` : ''}`;
  },
};
