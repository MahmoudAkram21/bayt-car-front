import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Shield, UserPlus, RefreshCw, Pencil, Trash2 } from 'lucide-react';
import {
  adminUsersService,
  type AdminUser,
  type PermissionOption,
  type RoleDetails,
} from '../../services/adminUsers.service';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { useRolePermissions } from '../../hooks/useRolePermissions';

const SLUG_PREFIX_TO_MODULE: Record<string, string> = {
  users: 'USERS',
  providers: 'PROVIDERS',
  services: 'SERVICES',
  requests: 'SERVICE_REQUESTS',
  finance: 'WALLETS',
  reports: 'REPORTS',
  settings: 'SETTINGS',
  roles: 'ROLES',
  banners: 'BANNERS',
};

const ENUM_LABELED_ACTIONS = new Set(['CREATE', 'READ', 'UPDATE', 'DELETE', 'REPLY']);
const UNSUPPORTED_SYSTEM_ACTIONS: Record<string, string[]> = {
  SERVICE_REQUESTS: ['CREATE'],
  SUPPORT_TICKETS: ['CREATE'],
};

const LEGACY_PREFIX_TO_MODULES: Record<string, string[]> = {
  users: ['USERS', 'SYSTEM_USERS'],
  providers: ['PROVIDERS'],
  services: ['SERVICES'],
  requests: ['SERVICE_REQUESTS'],
  support_tickets: ['SUPPORT_TICKETS'],
  finance: ['WALLETS', 'COMMISSIONS', 'INVOICES', 'DASHBOARD'],
  reports: ['REPORTS', 'DASHBOARD'],
  settings: ['SETTINGS'],
  roles: ['SYSTEM_USERS', 'ROLES'],
  banners: ['BANNERS'],
};

const LEGACY_VERB_TO_ACTIONS: Record<string, string[]> = {
  view: ['READ'],
  manage: ['CREATE', 'READ', 'UPDATE', 'DELETE'],
  verify: ['UPDATE'],
  suspend: ['UPDATE'],
  generate: ['CREATE', 'READ'],
  create: ['CREATE'],
  read: ['READ'],
  update: ['UPDATE'],
  delete: ['DELETE'],
  reply: ['REPLY'],
};

function inferPermissionModuleKey(permission: { module?: string | null; slug: string }): string {
  if (permission.module) {
    return String(permission.module).toUpperCase();
  }
  const prefix = permission.slug.split('.')[0]?.toLowerCase();
  if (!prefix) return 'UNKNOWN';
  return SLUG_PREFIX_TO_MODULE[prefix] ?? prefix.replace(/-/g, '_').toUpperCase();
}

function inferPermissionActionKey(permission: { action?: string | null; slug: string }): string {
  if (permission.action) return String(permission.action).toUpperCase();
  return String(permission.slug.split('.')[1] ?? 'READ').toUpperCase();
}

function getLegacyCompatibility(permission: PermissionOption): Array<{ moduleName: string; actionName: string }> {
  const [prefixRaw, verbRaw] = permission.slug.split('.');
  const prefix = (prefixRaw ?? '').toLowerCase();
  const verb = (verbRaw ?? '').toLowerCase();
  const modules = LEGACY_PREFIX_TO_MODULES[prefix] ?? [];
  const actions = LEGACY_VERB_TO_ACTIONS[verb] ?? [];
  const pairs: Array<{ moduleName: string; actionName: string }> = [];
  for (const moduleName of modules) {
    for (const actionName of actions) {
      pairs.push({ moduleName, actionName });
    }
  }
  return pairs;
}

function formatPermissionLabel(permission: PermissionOption, t: TFunction): string {
  const moduleKey = inferPermissionModuleKey(permission);
  const moduleLabel = t(`common.permissionModules.${moduleKey}`, {
    defaultValue: moduleKey.replace(/_/g, ' '),
  });

  const slugAction = permission.slug.split('.')[1]?.toLowerCase();
  const actionUpper = permission.action ? permission.action.toUpperCase() : '';

  let actionLabel: string;
  if (actionUpper && ENUM_LABELED_ACTIONS.has(actionUpper)) {
    actionLabel = t(`common.permissionActions.${actionUpper}`, { defaultValue: actionUpper });
  } else if (slugAction) {
    actionLabel = t(`common.permissionLegacyActions.${slugAction}`, {
      defaultValue: slugAction.charAt(0).toUpperCase() + slugAction.slice(1),
    });
  } else if (actionUpper) {
    actionLabel = t(`common.permissionActions.${actionUpper}`, {
      defaultValue: actionUpper,
    });
  } else {
    actionLabel = t('common.permissionActions.READ');
  }

  return `${moduleLabel} · ${actionLabel}`;
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const maybeAxios = error as {
      response?: { data?: { error?: string } };
      message?: string;
    };
    return maybeAxios.response?.data?.error || maybeAxios.message || 'Request failed';
  }
  return 'Request failed';
}

export const AdminsPage = () => {
  const { t } = useTranslation();
  const { can } = useRolePermissions();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleDetails | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', roleId: '' });
  const [roleForm, setRoleForm] = useState<{ name: string; permissionIds: string[] }>({
    name: '',
    permissionIds: [],
  });
  const actionOrder = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'REPLY'];
  const getActionsForModule = (moduleName: string) => {
    const baseActions =
      moduleName === 'SUPPORT_TICKETS'
        ? actionOrder
        : actionOrder.filter((action) => action !== 'REPLY');
    const unsupported = UNSUPPORTED_SYSTEM_ACTIONS[moduleName] ?? [];
    return baseActions.filter((action) => !unsupported.includes(action));
  };

  const { data: admins = [], isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminUsersService.getAll(),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['admin-users-roles'],
    queryFn: () => adminUsersService.getRoles(),
  });

  const { data: permissions = [] } = useQuery({
    queryKey: ['admin-permissions'],
    queryFn: () => adminUsersService.getPermissions(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; roleId: string }) =>
      adminUsersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsAddOpen(false);
      setFormData({ name: '', email: '', password: '', roleId: '' });
      toast.success(t('common.adminCreated') || 'Admin created successfully');
    },
    onError: (error: unknown) => {
      const msg = getErrorMessage(error);
      toast.error(msg || 'Failed to create admin');
    },
  });

  const createRoleMutation = useMutation({
    mutationFn: (data: { name: string; permissionIds: string[] }) => adminUsersService.createRole(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-roles'] });
      setIsRoleModalOpen(false);
      setRoleForm({ name: '', permissionIds: [] });
      setEditingRole(null);
      toast.success(t('common.roleCreated'));
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || t('common.roleCreateFailed'));
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name: string; permissionIds: string[] } }) =>
      adminUsersService.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-roles'] });
      setIsRoleModalOpen(false);
      setRoleForm({ name: '', permissionIds: [] });
      setEditingRole(null);
      toast.success(t('common.roleUpdated'));
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || t('common.roleUpdateFailed'));
    },
  });

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId: string) => adminUsersService.deleteRole(roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-roles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(t('common.roleDeleted'));
    },
    onError: (error: unknown) => {
      toast.error(getErrorMessage(error) || t('common.roleDeleteFailed'));
    },
  });

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.roleId) {
      toast.error(t('common.fillRequired') || 'Please fill required fields');
      return;
    }
    createMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      roleId: formData.roleId,
    });
  };

  const openCreateRole = () => {
    if (!can('SYSTEM_USERS', 'CREATE')) return;
    setEditingRole(null);
    setRoleForm({ name: '', permissionIds: [] });
    setIsRoleModalOpen(true);
  };

  const openEditRole = (role: RoleDetails) => {
    if (!can('SYSTEM_USERS', 'UPDATE')) return;
    setEditingRole(role);
    setRoleForm({
      name: role.name,
      permissionIds: role.permissions.map((permission) => permission.id),
    });
    setIsRoleModalOpen(true);
  };

  const togglePermission = (permissionId: string) => {
    setRoleForm((prev) => {
      const exists = prev.permissionIds.includes(permissionId);
      return {
        ...prev,
        permissionIds: exists
          ? prev.permissionIds.filter((id) => id !== permissionId)
          : [...prev.permissionIds, permissionId],
      };
    });
  };

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleForm.name.trim()) {
      toast.error(t('common.roleNameRequired'));
      return;
    }
    if (roleForm.permissionIds.length === 0) {
      toast.error(t('common.selectAtLeastOnePermission'));
      return;
    }
    if (editingRole) {
      updateRoleMutation.mutate({
        id: editingRole.id,
        data: {
          name: roleForm.name.trim(),
          permissionIds: roleForm.permissionIds,
        },
      });
      return;
    }
    createRoleMutation.mutate({
      name: roleForm.name.trim(),
      permissionIds: roleForm.permissionIds,
    });
  };

  const handleDeleteRole = (role: RoleDetails) => {
    if (!can('SYSTEM_USERS', 'DELETE')) return;
    const confirmed = window.confirm(t('common.deleteRoleConfirm', { name: role.name }));
    if (!confirmed) return;
    deleteRoleMutation.mutate(role.id);
  };

  const groupedPermissions = (() => {
    const groups: Record<string, Record<string, PermissionOption | null>> = {};
    for (const permission of permissions) {
      const directModule = inferPermissionModuleKey(permission);
      const directAction = inferPermissionActionKey(permission);
      const targets: Array<{ moduleName: string; actionName: string }> = [
        { moduleName: directModule, actionName: directAction },
        ...getLegacyCompatibility(permission),
      ];

      for (const { moduleName, actionName } of targets) {
        if (!groups[moduleName]) {
          groups[moduleName] = Object.fromEntries(getActionsForModule(moduleName).map((a) => [a, null])) as Record<
            string,
            PermissionOption | null
          >;
        }
        if (actionOrder.includes(actionName) && Object.prototype.hasOwnProperty.call(groups[moduleName], actionName)) {
          groups[moduleName][actionName] = permission;
        }
      }
    }
    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([moduleName, actions]) => ({ moduleName, actions }));
  })();

  const getRoleBadge = (role: string) => {
    return role === 'SUPER_ADMIN'
      ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
      : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('common.admins')}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            {t('common.adminsDescription') || 'Dashboard admin accounts. Only admins can create new admins.'}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-xl gap-2"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-users'] })}
          >
            <RefreshCw className="h-4 w-4" />
            {t('common.refresh')}
          </Button>
          {can('SYSTEM_USERS', 'CREATE') && (
            <Button
              size="sm"
              className="rounded-xl bg-teal-600 shadow-lg gap-2 hover:bg-teal-700"
              onClick={() => {
                setFormData({
                  name: '',
                  email: '',
                  password: '',
                  roleId: roles[0]?.id ?? '',
                });
                setIsAddOpen(true);
              }}
            >
              <UserPlus className="h-4 w-4" />
              {t('common.addAdmin') || 'Add Admin'}
            </Button>
          )}
          {/* {can('SYSTEM_USERS', 'CREATE') && (
            <Button
              size="sm"
              className="rounded-xl gap-2"
              variant="outline"
              onClick={openCreateRole}
            >
              <KeyRound className="h-4 w-4" />
              {t('common.manageRoles')}
            </Button>
          )} */}
        </div>
      </div>

      <Card className="rounded-2xl border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="p-0">
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <p>{(error as Error).message}</p>
            </div>
          )}
          {!isLoading && !error && admins.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Shield className="h-12 w-12 text-amber-600 dark:text-amber-400" />
              </div>
              <p className="mt-4 text-xl font-bold text-gray-900 dark:text-white">{t('common.noAdmins') || 'No admins yet'}</p>
              <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
                {t('common.addFirstAdmin') || 'Add the first dashboard admin below.'}
              </p>
            </div>
          )}
          {!isLoading && !error && admins.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('common.name')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('common.email')}
                    </th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('common.role')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {admins.map((admin: AdminUser) => (
                    <tr key={admin.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {admin.name}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {admin.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRoleBadge(admin.role)}`}
                        >
                          {admin.role === 'SUPER_ADMIN'
                            ? t('common.superAdmin')
                            : admin.role === 'ADMIN'
                              ? t('common.admin')
                              : admin.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-6 rounded-2xl border-gray-200 dark:border-gray-700 shadow-sm">
        <CardContent className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t('common.rolesAndPermissions')}</h2>
            {can('SYSTEM_USERS', 'CREATE') && (
              <Button size="sm" className="rounded-xl bg-teal-600 hover:bg-teal-700" onClick={openCreateRole}>
                {t('common.createRole')}
              </Button>
            )}
          </div>
          <div className="space-y-3">
            {roles.map((role) => (
              <div
                key={role.id}
                className="rounded-xl border border-gray-200 p-4 dark:border-gray-700 flex items-start justify-between gap-4"
              >
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{role.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {role.permissionCount}{' '}
                    {role.permissionCount === 1 ? t('common.permission') : t('common.permissionsPlural')}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {role.usersCount} {role.usersCount === 1 ? t('common.user') : t('common.usersPlural')}
                  </p>
                  {role.permissions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {role.permissions.slice(0, 8).map((permission) => (
                        <span
                          key={permission.id}
                          title={permission.description || permission.slug}
                          className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                        >
                          {formatPermissionLabel(permission, t)}
                        </span>
                      ))}
                      {role.permissions.length > 8 && (
                        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700 dark:bg-gray-700 dark:text-gray-200">
                          +{role.permissions.length - 8} {t('common.more')}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {can('SYSTEM_USERS', 'UPDATE') && (
                    <Button variant="outline" size="sm" onClick={() => openEditRole(role)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {can('SYSTEM_USERS', 'DELETE') && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={deleteRoleMutation.isPending}
                      onClick={() => handleDeleteRole(role)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {roles.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400">{t('common.noRolesFound')}</div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[440px]">
          <DialogHeader>
            <DialogTitle>{t('common.addAdmin') || 'Add Admin'}</DialogTitle>
            <DialogDescription>
              {t('common.addAdminDescription') || 'Create a new dashboard admin. They can log in with email and password.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitCreate}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="adminName" className="text-sm font-medium">
                  {t('common.name')} *
                </label>
                <Input
                  id="adminName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="adminEmail" className="text-sm font-medium">
                  {t('common.email')} *
                </label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="adminPassword" className="text-sm font-medium">
                  {t('common.password')} *
                </label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder={t('common.min6Chars') || 'Min 6 characters'}
                  minLength={6}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="adminRole" className="text-sm font-medium">
                  {t('common.role')} *
                </label>
                <select
                  id="adminRole"
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                  {roles.length === 0 && (
                    <option value="">{t('common.noRolesAvailable')}</option>
                  )}
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={createMutation.isPending}>
                {createMutation.isPending ? t('common.creating') || 'Creating...' : t('common.create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="sm:max-w-[560px]">
          <DialogHeader>
            <DialogTitle>{editingRole ? t('common.editRole') : t('common.createRole')}</DialogTitle>
            <DialogDescription>
              {editingRole
                ? t('common.editRoleDescription')
                : t('common.createRoleDescription')}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRoleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="roleName" className="text-sm font-medium">
                  {t('common.roleNameLabel')} *
                </label>
                <Input
                  id="roleName"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">{t('common.permissions')}</label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{t('common.permissionsMatrixHint')}</p>
                <div className="max-h-64 overflow-y-auto rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                  <div className="space-y-3">
                    {groupedPermissions.map(({ moduleName, actions }) => (
                      <div key={moduleName} className="rounded-md border border-gray-100 p-2 dark:border-gray-800">
                        <p className="mb-2 text-xs font-semibold tracking-wide text-gray-600 dark:text-gray-300">
                          {t(`common.permissionModules.${moduleName}`, { defaultValue: moduleName })}
                        </p>
                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                          {getActionsForModule(moduleName)
                            // Keep REPLY only when permission row exists (no dead disabled checkbox).
                            .filter((actionName) => actionName !== 'REPLY' || Boolean(actions.REPLY))
                            .map((actionName) => {
                            const permission = actions[actionName];
                            return (
                              <label
                                key={`${moduleName}-${actionName}`}
                                className={`flex items-center gap-2 rounded px-2 py-1 text-xs ${
                                  permission ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  disabled={!permission}
                                  checked={permission ? roleForm.permissionIds.includes(permission.id) : false}
                                  onChange={() => {
                                    if (permission) togglePermission(permission.id);
                                  }}
                                />
                                <span>
                                  {t(`common.permissionActions.${actionName}`, {
                                    defaultValue: actionName,
                                  })}
                                </span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    {groupedPermissions.length === 0 && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">{t('common.noPermissionsFound')}</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsRoleModalOpen(false);
                  setEditingRole(null);
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button
                type="submit"
                className="bg-teal-600 hover:bg-teal-700"
                disabled={createRoleMutation.isPending || updateRoleMutation.isPending}
              >
                {createRoleMutation.isPending || updateRoleMutation.isPending
                  ? t('common.saving')
                  : editingRole
                    ? t('common.update')
                    : t('common.create')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
