export type OfferType = 'PERCENTAGE' | 'FIXED';
export type OfferScope = 'ALL' | 'SERVICE' | 'SERVICES';
export interface PromoOfferServiceRef {
    service_id: string;
    service: {
        id: string;
        name: string;
    };
}
export interface PromoOfferProviderRef {
    id: string;
    user_id: string;
    user?: {
        id: string;
        name: string;
        email: string;
    };
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
export type PromoCreatePayload = Partial<PromoOffer> & {
    code: string;
    type: OfferType;
    value: number;
    entity_id?: string | null;
    entity_ids?: string[];
};
export type PromoUpdatePayload = Partial<PromoOffer> & {
    entity_id?: string | null;
    entity_ids?: string[];
};
export declare const promoService: {
    list: (params?: {
        is_active?: boolean;
        code?: string;
        providerPromosOnly?: boolean;
    }) => Promise<{
        data: PromoOffer[];
    }>;
    listProviderPromos: () => Promise<{
        data: PromoOffer[];
    }>;
    getById: (id: string) => Promise<PromoOffer>;
    create: (data: PromoCreatePayload) => Promise<PromoOffer>;
    update: (id: string, data: PromoUpdatePayload) => Promise<PromoOffer>;
    delete: (id: string) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
