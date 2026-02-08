export interface ServiceCategory {
    id: number;
    name_ar: string;
    name_en: string | null;
    slug: string;
    sort_order: number;
    is_active: boolean;
    services?: Array<{
        id: number;
        name: string;
        slug: string;
        description?: string | null;
        is_negotiable: boolean;
        gps_radius_km?: number | null;
        category_id?: number | null;
    }>;
}
export declare const serviceCategoryService: {
    list: (params?: {
        is_active?: boolean;
    }) => Promise<{
        data: ServiceCategory[];
    }>;
    getById: (id: number) => Promise<ServiceCategory>;
};
