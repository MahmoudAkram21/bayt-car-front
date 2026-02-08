export type InvoiceStatus = 'PAID' | 'REFUNDED';
export interface Invoice {
    id: number;
    service_request_id: number;
    invoice_number: string;
    status: InvoiceStatus;
    payment_method: string | null;
    customer_snapshot: Record<string, unknown>;
    provider_snapshot: Record<string, unknown>;
    service_name: string;
    base_price: number;
    commission_amount: number;
    tax_amount: number;
    discount_amount: number;
    cashback_used: number;
    final_paid_amount: number;
    created_at: string;
}
export declare const invoiceService: {
    list: (params?: {
        status?: InvoiceStatus;
        limit?: number;
    }) => Promise<{
        data: Invoice[];
    }>;
    getById: (id: number) => Promise<Invoice>;
    getByServiceRequest: (serviceRequestId: number) => Promise<Invoice>;
    createForServiceRequest: (serviceRequestId: number) => Promise<Invoice>;
    getPdfUrl: (id: number) => string;
    getQrUrl: (id: number) => string;
};
