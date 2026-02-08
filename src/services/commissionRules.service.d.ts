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
export declare const commissionRulesService: {
    list: (params?: {
        is_active?: boolean;
    }) => Promise<{
        data: CommissionRule[];
    }>;
    getById: (id: number) => Promise<CommissionRule>;
    create: (data: {
        scope: CommissionRuleScope;
        entity_id?: number | null;
        customer_commission_pct: number;
        provider_commission_pct: number;
        is_active?: boolean;
    }) => Promise<CommissionRule>;
    update: (id: number, data: Partial<CommissionRule>) => Promise<CommissionRule>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
