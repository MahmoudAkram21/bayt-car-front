export type BroadcastTarget = 'ALL' | 'CUSTOMERS' | 'PROVIDERS';
export interface BroadcastLog {
    id: string;
    target: BroadcastTarget;
    title_en: string | null;
    title_ar: string | null;
    body_en: string | null;
    body_ar: string | null;
    total_users: number;
    success_count: number;
    error_count: number;
    created_by: string;
    created_at: string;
}
export interface BroadcastResponse {
    success: boolean;
    message: string;
    successCount: number;
    errorCount: number;
}
export interface BroadcastLogsResponse {
    data: BroadcastLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export declare const notificationService: {
    sendToUser(params: {
        userId: string;
        titleEn?: string;
        titleAr?: string;
        bodyEn?: string;
        bodyAr?: string;
    }): Promise<{
        success: boolean;
        message: string;
    }>;
    broadcast(data: {
        target: BroadcastTarget;
        titleEn?: string;
        titleAr?: string;
        bodyEn?: string;
        bodyAr?: string;
    }): Promise<BroadcastResponse>;
    getBroadcastLogs(page?: number, limit?: number): Promise<BroadcastLogsResponse>;
};
