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
export declare const adminUsersService: {
    getAll(): Promise<AdminUser[]>;
    getById(id: string): Promise<AdminUser>;
    getRoles(): Promise<RoleOption[]>;
    create(data: {
        name: string;
        email: string;
        password: string;
        roleName: "ADMIN" | "SUPER_ADMIN";
    }): Promise<AdminUser>;
    delete(id: string): Promise<void>;
};
