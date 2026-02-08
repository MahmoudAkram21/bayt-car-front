export interface FurnitureDeliveryRequest {
    id: number;
    service_id: number;
    customer_id: number;
    provider_id: number | null;
    customer_offer_price: number | null;
    final_agreed_price: number | null;
    latitude: string;
    longitude: string;
    description: string | null;
    address_city: string | null;
    address_area: string | null;
    status: 'OPEN' | 'ACCEPTED' | 'COMPLETED' | 'CANCELLED' | 'REJECTED';
    created_at: string;
    service?: {
        id: number;
        name: string;
        slug: string;
    };
    customer?: {
        id: number;
        name: string;
        phone: string;
    };
    provider?: {
        id: number;
        name: string;
        phone: string;
    } | null;
}
export interface FurnitureDeliveryListResponse {
    data: FurnitureDeliveryRequest[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
export declare const furnitureDeliveryService: {
    getAllRequests(params?: {
        status?: string;
        page?: number;
        limit?: number;
    }): Promise<FurnitureDeliveryListResponse>;
    getRequestById(id: number): Promise<FurnitureDeliveryRequest>;
};
