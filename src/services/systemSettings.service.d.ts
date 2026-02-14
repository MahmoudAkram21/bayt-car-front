export interface SystemSettings {
    [key: string]: string;
}
export declare const systemSettingsService: {
    getSettings: () => Promise<SystemSettings>;
    updateSettings: (settings: Partial<SystemSettings>) => Promise<SystemSettings>;
};
