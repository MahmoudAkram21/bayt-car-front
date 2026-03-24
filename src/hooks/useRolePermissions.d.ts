import { type PermissionActionKey, type PermissionModuleKey } from '../lib/rbac';
export declare function useRolePermissions(): {
    can: (module: PermissionModuleKey, action: PermissionActionKey) => boolean;
    isPermissionsLoading: boolean;
    currentRoleName: string | null;
};
