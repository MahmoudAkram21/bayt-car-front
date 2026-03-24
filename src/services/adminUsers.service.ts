import api from './api';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  roleId: string;
}

export interface RoleOption {
  id: string;
  name: string;
}

export const adminUsersService = {
  async getAll(): Promise<AdminUser[]> {
    const response = await api.get<AdminUser[]>('/admin-users');
    return response.data;
  },

  async getById(id: string): Promise<AdminUser> {
    const response = await api.get<AdminUser>(`/admin-users/${id}`);
    return response.data;
  },

  async getRoles(): Promise<RoleOption[]> {
    const response = await api.get<RoleOption[]>('/admin-users/roles');
    return response.data;
  },

  async create(data: { name: string; email: string; password: string; roleName: 'ADMIN' | 'SUPER_ADMIN' }): Promise<AdminUser> {
    const response = await api.post<AdminUser>('/admin-users', data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/admin-users/${id}`);
  },
};
