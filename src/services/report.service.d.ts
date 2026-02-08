export interface Report {
    id: number;
    report_type: string;
    title: string | null;
    period_from: string | null;
    period_to: string | null;
    summary: Record<string, unknown> | null;
    created_at: string;
    created_by: number | null;
}
export declare const reportService: {
    getAll(params?: {
        report_type?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: Report[];
        total: number;
    }>;
    getById(id: string): Promise<Report>;
    generateWalletSummary(period_from?: string, period_to?: string): Promise<Report>;
};
