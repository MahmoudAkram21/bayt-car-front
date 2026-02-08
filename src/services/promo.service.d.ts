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
export declare const promoService: {
    list: (params?: {
        is_active?: boolean;
        code?: string;
    }) => Promise<{
        data: PromoOffer[];
    }>;
    getById: (id: number) => Promise<PromoOffer>;
    create: (data: Partial<PromoOffer> & {
        code: string;
        type: OfferType;
        value: number;
    }) => Promise<PromoOffer>;
    update: (id: number, data: Partial<PromoOffer>) => Promise<PromoOffer>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
