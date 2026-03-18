import api from './api';

export type OfferType = 'PERCENTAGE' | 'FIXED';
export type OfferScope = 'ALL' | 'SERVICE' | 'SERVICES';

export interface PromoOfferServiceRef {
  service_id: string;
  service: { id: string; name: string };
}

export interface PromoOfferProviderRef {
  id: string;
  user_id: string;
  user?: { id: string; name: string; email: string };
}

export interface PromoOffer {
  id: string;
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
  entity_id: string | null;
  provider_id?: string | null;
  offer_services?: PromoOfferServiceRef[];
  provider?: PromoOfferProviderRef | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type PromoCreatePayload = Partial<PromoOffer> & { code: string; type: OfferType; value: number; entity_id?: string | null; entity_ids?: string[] };
export type PromoUpdatePayload = Partial<PromoOffer> & { entity_id?: string | null; entity_ids?: string[] };

export const promoService = {
  list: (params?: { is_active?: boolean; code?: string; providerPromosOnly?: boolean }) =>
    api.get<{ data: PromoOffer[] }>('/promo', { params }).then((r) => r.data),
  listProviderPromos: () =>
    api.get<{ data: PromoOffer[] }>('/promo', { params: { providerPromosOnly: 'true' } }).then((r) => r.data),
  getById: (id: string) => api.get<PromoOffer>(`/promo/${id}`).then((r) => r.data),
  create: (data: PromoCreatePayload) => {
    const body: Record<string, unknown> = { ...data };
    if (data.scope === 'SERVICES' && data.entity_ids?.length) body.entity_ids = data.entity_ids;
    else if (data.scope === 'SERVICE' && data.entity_id) body.entity_id = data.entity_id;
    else if (data.scope !== 'SERVICES') delete body.entity_ids;
    return api.post<PromoOffer>('/promo', body).then((r) => r.data);
  },
  update: (id: string, data: PromoUpdatePayload) => {
    const body: Record<string, unknown> = { ...data };
    if (data.scope === 'SERVICES' && data.entity_ids !== undefined) body.entity_ids = data.entity_ids;
    else if (data.scope === 'SERVICE' && data.entity_id !== undefined) body.entity_id = data.entity_id;
    return api.patch<PromoOffer>(`/promo/${id}`, body).then((r) => r.data);
  },
  delete: (id: string) => api.delete(`/promo/${id}`),
};
