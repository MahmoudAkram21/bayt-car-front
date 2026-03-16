import api from './api';
import type { User, PaginatedResponse } from '../types';

export const userService = {
  async getAllUsers(params?: {
    role?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>('/users', { params });
    return response.data;
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  async createUser(data: { name: { en: string; ar?: string }; email: string; phone?: string; role: string }): Promise<User> {
    const response = await api.post<User>('/users', data);
    return response.data;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, data);
    return response.data;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  async activateUser(id: string): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, { isActive: true });
    return response.data;
  },

  async deactivateUser(id: string): Promise<User> {
    const response = await api.patch<User>(`/users/${id}`, { isActive: false });
    return response.data;
  },

  /** Suspend user (same as deactivate) */
  async suspendUser(id: string): Promise<User> {
    return this.deactivateUser(id);
  },
};
