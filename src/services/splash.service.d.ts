export type SplashPlatform = 'ALL' | 'ANDROID' | 'IOS';
export interface SplashScreen {
    id: number;
    image_url: string;
    title: string | null;
    description: string | null;
    action_url: string | null;
    platform: SplashPlatform;
    valid_from: string | null;
    valid_to: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}
export declare const splashService: {
    list: (params?: {
        is_active?: boolean;
        platform?: SplashPlatform;
    }) => Promise<{
        data: SplashScreen[];
    }>;
    getById: (id: number) => Promise<SplashScreen>;
    create: (data: Partial<SplashScreen> & {
        image_url: string;
    }) => Promise<SplashScreen>;
    update: (id: number, data: Partial<SplashScreen>) => Promise<SplashScreen>;
    delete: (id: number) => Promise<import("axios").AxiosResponse<any, any, {}>>;
};
