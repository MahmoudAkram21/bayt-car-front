import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Shield, UserPlus, RefreshCw } from 'lucide-react';
import { adminUsersService, type AdminUser } from '../../services/adminUsers.service';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export const AdminsPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', roleName: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN' });

  const { data: admins = [], isLoading, error } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminUsersService.getAll(),
  });

  const { data: roles = [] } = useQuery({
    queryKey: ['admin-users-roles'],
    queryFn: () => adminUsersService.getRoles(),
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; roleName: 'ADMIN' | 'SUPER_ADMIN' }) =>
      adminUsersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsAddOpen(false);
      setFormData({ name: '', email: '', password: '', roleName: 'ADMIN' });
      toast.success(t('common.adminCreated') || 'Admin created successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || error.message;
      toast.error(msg || 'Failed to create admin');
    },
  });

  const handleSubmitCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      toast.error(t('common.fillRequired') || 'Please fill required fields');
      return;
    }
    createMutation.mutate({
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      roleName: formData.roleName,
    });
  };

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
                          {admin.role === 'SUPER_ADMIN' ? t('common.superAdmin') : t('common.admin')}
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
                  value={formData.roleName}
                  onChange={(e) => setFormData({ ...formData, roleName: e.target.value as 'ADMIN' | 'SUPER_ADMIN' })}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name === 'SUPER_ADMIN' ? t('common.superAdmin') : t('common.admin')}
                    </option>
                  ))}
                  {roles.length === 0 && (
                    <>
                      <option value="ADMIN">{t('common.admin')}</option>
                      <option value="SUPER_ADMIN">{t('common.superAdmin')}</option>
                    </>
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
    </div>
  );
};
