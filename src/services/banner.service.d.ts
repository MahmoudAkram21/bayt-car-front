export type BannerType = 'AD' | 'SERVICE';
export type SliderPlatform = 'ALL' | 'ANDROID' | 'IOS';
export interface Banner {
    id: string;
    image_url: string;
    type: BannerType;
    title?: string | null;
    description?: string | null;
    link?: string | null;
    service_id?: string | null;
    platform: SliderPlatform;
    valid_from?: string | null;
    valid_to?: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    service?: {
        id: string;
        name: string;
    };
}
export interface CreateBannerData {
    banner_image: File;
    type: BannerType;
    title?: string;
    description?: string;
    link?: string;
    service_id?: string;
    platform?: SliderPlatform;
    valid_from?: string;
    valid_to?: string;
    sort_order?: number;
    is_active?: boolean;
}
export interface UpdateBannerData {
    banner_image?: File;
    type?: BannerType;
    title?: string | null;
    description?: string | null;
    link?: string | null;
    service_id?: string | null;
    platform?: SliderPlatform;
    valid_from?: string | null;
    valid_to?: string | null;
    sort_order?: number;
    is_active?: boolean;
}
export declare const bannerService: {
    getBanners: (filters?: {
        is_active?: boolean;
    }) => Promise<{
        data: Banner[];
    }>;
    getBannerById: (id: string) => Promise<Banner>;
    createBanner: (data: CreateBannerData) => Promise<Banner>;
    updateBanner: (id: string, data: UpdateBannerData) => Promise<Banner>;
    deleteBanner: (id: string) => Promise<void>;
    getActiveBanners: (platform?: SliderPlatform) => Promise<{
        data: Banner[];
    }>;
};
