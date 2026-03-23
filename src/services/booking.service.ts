import api from './api';
import type { Booking, PaginatedResponse, BookingStatus } from '../types';

export const bookingService = {
  async getAllBookings(params?: {
    status?: BookingStatus;
    search?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<Booking>> {
    const response = await api.get<PaginatedResponse<Booking>>('/service-requests', { params });
    return response.data;
  },

  async getBookingById(id: string): Promise<Booking> {
    const response = await api.get<Booking>(`/service-requests/${id}`);
    return response.data;
  },

  async updateBookingStatus(id: string, status: BookingStatus): Promise<Booking> {
    const response = await api.put<Booking>(`/service-requests/${id}/status`, { status });
    return response.data;
  },

  async deleteBooking(id: string): Promise<void> {
    await api.delete(`/service-requests/${id}`, { data: { cancelReason: "Admin cancelled" } });
  },
};
