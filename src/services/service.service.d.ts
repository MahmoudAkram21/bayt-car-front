import type { Service, ServiceDetail, PaginatedResponse } from '../types';
export declare const serviceService: {
    getAllServices(params?: {
        categoryId?: number | null;
        isNegotiable?: boolean;
        minPrice?: number;
        maxPrice?: number;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Service>>;
    /** Admin: update service category and GPS radius */
    updateServiceCatalog: (id: string, data: {
        category_id?: number | null;
        gps_radius_km?: number | null;
    }) => Promise<{
        service: Service;
    }>;
    getServiceById(id: string): Promise<ServiceDetail>;
    updateService(id: string, data: Partial<Service>): Promise<Service>;
    deleteService(id: string): Promise<void>;
    activateService(id: string): Promise<Service>;
    deactivateService(id: string): Promise<Service>;
};
