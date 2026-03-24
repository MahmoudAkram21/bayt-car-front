import type { SupportTicketItem, SupportTicketsResponse } from '../types';
export declare const supportTicketsService: {
    getSupportTickets(params?: {
        page?: number;
        limit?: number;
    }): Promise<SupportTicketsResponse>;
    getServiceRequestById(id: string): Promise<{
        serviceRequest: SupportTicketItem & Record<string, unknown>;
    }>;
    updateFlag(id: string, payload: {
        is_flagged_for_support: boolean;
        admin_note?: string | null;
    }): Promise<{
        serviceRequest: SupportTicketItem & Record<string, unknown>;
    }>;
};
