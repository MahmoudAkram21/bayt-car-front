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
export declare const adminUsersService: {
    getAll(): Promise<AdminUser[]>;
    getById(id: string): Promise<AdminUser>;
    getRoles(): Promise<RoleDetails[]>;
    getRoleById(id: string): Promise<RoleDetails>;
    getPermissions(): Promise<PermissionOption[]>;
    createRole(data: {
        name: string;
        permissionIds?: string[];
        permissionSlugs?: string[];
    }): Promise<RoleDetails>;
    updateRole(id: string, data: {
        name?: string;
        permissionIds?: string[];
        permissionSlugs?: string[];
    }): Promise<RoleDetails>;
    deleteRole(id: string): Promise<void>;
    create(data: {
        name: string;
        email: string;
        password: string;
        roleId?: string;
        roleName?: string;
    }): Promise<AdminUser>;
    delete(id: string): Promise<void>;
};
