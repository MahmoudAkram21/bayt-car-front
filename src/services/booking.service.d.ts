import type { Booking, PaginatedResponse, BookingStatus } from '../types';
export declare const bookingService: {
    getAllBookings(params?: {
        status?: BookingStatus;
        search?: string;
        startDate?: string;
        endDate?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedResponse<Booking>>;
    getBookingById(id: string): Promise<Booking>;
    updateBookingStatus(id: string, status: BookingStatus): Promise<Booking>;
    deleteBooking(id: string): Promise<void>;
};
