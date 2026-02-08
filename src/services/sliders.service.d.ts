export type SliderPlatform = 'ALL' | 'ANDROID' | 'IOS';
export interface Slider {
    id: number;
    image_url: string;
    title: string | null;
    description: string | null;
    action_url: string | null;
    platform: SliderPlatform;
    valid_from: string | null;
    valid_to: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export declare const slidersService: {
    list: (params?: {
        is_active?: boolean;
        platform?: SliderPlatform;
    }) => Promise<{
        data: Slider[];
    }>;
    getById: (id: number) => Promise<Slider>;
    create: (data: Partial<Slider> & {
        image_url: string;
    }) => Promise<Slider>;
    update: (id: number, data: Partial<Slider>) => Promise<Slider>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
