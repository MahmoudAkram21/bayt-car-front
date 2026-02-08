import type { Commission, PaginatedResponse, PaymentMethod } from '../types';
export declare const commissionService: {
    getAllCommissions(params?: {
        isPaid?: boolean;
        search?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Commission>>;
    markAsPaid(id: string, paymentMethod: PaymentMethod): Promise<Commission>;
    getCommissionStats(): Promise<{
        totalUnpaid: number;
        totalPaid: number;
        suspendedProviders: number;
    }>;
};
