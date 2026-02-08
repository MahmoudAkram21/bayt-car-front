export interface TaxSettings {
    id: number;
    is_enabled: boolean;
    tax_percent: number;
    updated_at: string;
}
export declare const taxService: {
    getActive: () => Promise<{
        settings: TaxSettings | null;
    }>;
    list: () => Promise<{
        data: TaxSettings[];
    }>;
    getById: (id: number) => Promise<TaxSettings>;
    create: (data: {
        is_enabled?: boolean;
        tax_percent: number;
    }) => Promise<TaxSettings>;
    update: (id: number, data: Partial<TaxSettings>) => Promise<TaxSettings>;
};
