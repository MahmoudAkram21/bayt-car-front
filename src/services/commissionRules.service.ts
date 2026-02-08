import api from './api';

export type CommissionRuleScope = 'GLOBAL' | 'SERVICE' | 'PROVIDER';

export interface CommissionRule {
  id: number;
  scope: CommissionRuleScope;
  entity_id: number | null;
  customer_commission_pct: number;
  provider_commission_pct: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const commissionRulesService = {
  list: (params?: { is_active?: boolean }) =>
    api.get<{ data: CommissionRule[] }>('/commission-rules', { params }).then((r) => r.data),
  getById: (id: number) => api.get<CommissionRule>(`/commission-rules/${id}`).then((r) => r.data),
  create: (data: { scope: CommissionRuleScope; entity_id?: number | null; customer_commission_pct: number; provider_commission_pct: number; is_active?: boolean }) =>
    api.post<CommissionRule>('/commission-rules', data).then((r) => r.data),
  update: (id: number, data: Partial<CommissionRule>) => api.patch<CommissionRule>(`/commission-rules/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/commission-rules/${id}`),
};
