import { useQuery } from '@tanstack/react-query';
import { adminUsersService } from '../services/adminUsers.service';
import { useAuthStore } from '../store/authStore';
import { hasPermission, type PermissionActionKey, type PermissionModuleKey } from '../lib/rbac';

export function useRolePermissions() {
  const user = useAuthStore((state) => state.user);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const { data: roles = [], isLoading } = useQuery({
    queryKey: ['admin-users-roles', 'rbac'],
    queryFn: () => adminUsersService.getRoles(),
    enabled: Boolean(isAuthenticated && user?.role),
  });

  const currentRole = roles.find((role) => role.name === user?.role);

  const can = (module: PermissionModuleKey, action: PermissionActionKey): boolean => {
    return hasPermission(currentRole, module, action);
  };

  return {
    can,
    isPermissionsLoading: isLoading,
    currentRoleName: currentRole?.name ?? user?.role ?? null,
  };
}

