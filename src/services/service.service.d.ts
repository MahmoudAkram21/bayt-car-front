import type { Service, ServiceDetail, PaginatedResponse, ServiceIconShape } from '../types';
export interface UpdateServiceCatalogData {
    category_id?: string | null;
    gps_radius_km?: number | null;
    name?: string;
    description?: string | null;
    icon_url?: string | null;
    is_active?: boolean;
    is_emergency?: boolean;
    icon_shape?: ServiceIconShape | string | null;
    display_color?: string | null;
    sort_order?: number;
}
export declare const serviceService: {
    getAllServices(params?: {
        categoryId?: string | number | null;
        isActive?: boolean;
        is_emergency?: boolean;
        isNegotiable?: boolean;
        minPrice?: number;
        maxPrice?: number;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Service>>;
    /** Admin: update service catalog and display (category, gps_radius_km, name, description, icon_url, is_active, is_emergency, icon_shape, display_color, sort_order) */
    updateServiceCatalog(id: string, data: UpdateServiceCatalogData): Promise<{
        service: Service;
    }>;
    /** Admin: upload service icon (multipart form with field "icon") */
    uploadServiceIcon(id: string, file: File): Promise<{
        service: Service;
    }>;
    getServiceById(id: string): Promise<ServiceDetail>;
    updateService(id: string, data: Partial<Service>): Promise<Service>;
    deleteService(id: string): Promise<void>;
    /** Admin: set service active (uses catalog PATCH with is_active) */
    activateService(id: string): Promise<Service>;
    /** Admin: set service inactive (uses catalog PATCH with is_active) */
    deactivateService(id: string): Promise<Service>;
    createAttribute(serviceId: string, data: any): Promise<any>;
    updateAttribute(serviceId: string, attributeId: string, data: any): Promise<any>;
    deleteAttribute(serviceId: string, attributeId: string): Promise<void>;
};
