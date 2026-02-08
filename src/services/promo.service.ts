import api from './api';

export type OfferType = 'PERCENTAGE' | 'FIXED';
export type OfferScope = 'ALL' | 'SERVICE';

export interface PromoOffer {
  id: number;
  code: string;
  type: OfferType;
  value: number;
  min_order_amount: number | null;
  max_discount: number | null;
  valid_from: string | null;
  valid_to: string | null;
  usage_limit: number | null;
  usage_count: number;
  scope: OfferScope;
  entity_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const promoService = {
  list: (params?: { is_active?: boolean; code?: string }) =>
    api.get<{ data: PromoOffer[] }>('/promo', { params }).then((r) => r.data),
  getById: (id: number) => api.get<PromoOffer>(`/promo/${id}`).then((r) => r.data),
  create: (data: Partial<PromoOffer> & { code: string; type: OfferType; value: number }) =>
    api.post<PromoOffer>('/promo', data).then((r) => r.data),
  update: (id: number, data: Partial<PromoOffer>) => api.patch<PromoOffer>(`/promo/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/promo/${id}`),
};
