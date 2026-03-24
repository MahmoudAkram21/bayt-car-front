import { Navigate } from 'react-router-dom';
import { useRolePermissions } from '../hooks/useRolePermissions';
import type { PermissionActionKey, PermissionModuleKey } from '../lib/rbac';

interface PermissionRouteProps {
  module: PermissionModuleKey;
  action?: PermissionActionKey;
  children: React.ReactNode;
}

export const PermissionRoute = ({ module, action = 'READ', children }: PermissionRouteProps) => {
  const { can, isPermissionsLoading, currentRoleName } = useRolePermissions();

  if (currentRoleName === 'SUPER_ADMIN') {
    return <>{children}</>;
  }

  if (isPermissionsLoading) {
    return null;
  }

  if (!can(module, action)) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

