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

export interface PermissionOption {
  id: string;
  module: string | null;
  action: string | null;
  slug: string;
  description: string | null;
}

export interface RoleDetails extends RoleOption {
  permissions: PermissionOption[];
  permissionCount: number;
  usersCount: number;
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

  async getRoles(): Promise<RoleDetails[]> {
    const response = await api.get<RoleDetails[]>('/admin-users/roles');
    return response.data;
  },

  async getRoleById(id: string): Promise<RoleDetails> {
    const response = await api.get<RoleDetails>(`/admin-users/roles/${id}`);
    return response.data;
  },

  async getPermissions(): Promise<PermissionOption[]> {
    const response = await api.get<PermissionOption[]>('/admin-users/permissions');
    return response.data;
  },

  async createRole(data: {
    name: string;
    permissionIds?: string[];
    permissionSlugs?: string[];
  }): Promise<RoleDetails> {
    const response = await api.post<RoleDetails>('/admin-users/roles', data);
    return response.data;
  },

  async updateRole(
    id: string,
    data: { name?: string; permissionIds?: string[]; permissionSlugs?: string[] }
  ): Promise<RoleDetails> {
    const response = await api.patch<RoleDetails>(`/admin-users/roles/${id}`, data);
    return response.data;
  },

  async deleteRole(id: string): Promise<void> {
    await api.delete(`/admin-users/roles/${id}`);
  },

  async create(data: { name: string; email: string; password: string; roleId?: string; roleName?: string }): Promise<AdminUser> {
    const response = await api.post<AdminUser>('/admin-users', data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/admin-users/${id}`);
  },
};
