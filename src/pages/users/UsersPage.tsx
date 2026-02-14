import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, Users, UserPlus, RefreshCw, LayoutGrid, List, Pencil, Trash2, Ban, UserCheck, Building2, Shield, CheckCircle } from 'lucide-react';
import { type User, UserRole, type PaginatedResponse } from '../../types';
import { userService } from '../../services/user.service';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';

import { useNavigate } from 'react-router-dom';

type ViewMode = 'cards' | 'table';

export const UsersPage = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');

  const { data, isLoading, error } = useQuery<PaginatedResponse<User>>({
    queryKey: ['users', { role: filterRole !== 'all' ? filterRole : undefined, search: searchTerm }],
    queryFn: () => userService.getAllUsers({
      role: filterRole !== 'all' ? filterRole : undefined,
      search: searchTerm || undefined,
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => userService.suspendUser(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      [UserRole.OWNER]: 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
      [UserRole.PROVIDER]: 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300',
      [UserRole.ADMIN]: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
      [UserRole.SUPER_ADMIN]: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    };
    return colors[role] || 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case UserRole.OWNER: return t('common.customers');
      case UserRole.PROVIDER: return t('common.providers'); // Note: 'providers' key in en.json is "Providers", consistent with common.providers
      case UserRole.ADMIN: return t('common.admins');
      case UserRole.SUPER_ADMIN: return t('common.superAdmin');
      default: return role;
    }
  };

  const getName = (name: User['name'] | string) => {
    if (typeof name === 'string') return name;
    return name?.en || name?.ar || 'N/A';
  };

  const users = data?.data ?? [];
  const total = data?.total ?? users.length;
  const statCustomers = users.filter((u: User) => u.role === UserRole.OWNER).length;
  const statProviders = users.filter((u: User) => u.role === UserRole.PROVIDER).length;
  const statAdmins = users.filter((u: User) => u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN).length;

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(t('common.confirmDelete', { name }))) deleteMutation.mutate(id);
  };

  const handleSuspend = (id: string, name: string) => {
    if (window.confirm(t('common.confirmSuspend', { name }))) suspendMutation.mutate(id);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('common.users')}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            {t('common.management')}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-2 focus:ring-2 focus:ring-teal-500">
            <RefreshCw className="h-4 w-4" />
            {t('common.update')}
          </Button>
          <Button size="sm" className="rounded-xl bg-teal-600 shadow-lg gap-2 hover:bg-teal-700 focus:ring-2 focus:ring-teal-500">
            <UserPlus className="h-4 w-4" />
            {t('common.addUser')}
          </Button>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('common.totalUsers'), value: users.length || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
          { label: t('common.customers'), value: statCustomers, icon: UserCheck, color: 'text-teal-600', bg: 'bg-teal-100' },
          { label: t('common.providers'), value: statProviders, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
          { label: t('common.admins'), value: statAdmins, icon: Shield, color: 'text-amber-600', bg: 'bg-amber-100' },
        ].map((stat, i) => (
          <div
            key={i}
            className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                <h3 className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                  {stat.value}
                </h3>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.bg} dark:bg-opacity-20`}>
                <stat.icon className={`h-6 w-6 ${stat.color} dark:text-opacity-90`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <Card className="mb-6 rounded-2xl border-gray-200 dark:border-gray-700 p-5 shadow-sm">
        <CardContent className="pt-0">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <Input
                placeholder={t('common.startTyping')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border-gray-300 pl-10 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{t('common.all')}</option>
              <option value={UserRole.OWNER}>{t('common.customers')}</option>
              <option value={UserRole.PROVIDER}>{t('common.providers')}</option>
              <option value={UserRole.ADMIN}>{t('common.admins')}</option>
              <option value={UserRole.SUPER_ADMIN}>{t('common.superAdmin')}</option>
            </select>
            <div className="flex rounded-lg border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-700 overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'cards'
                    ? 'bg-teal-500 text-white dark:bg-teal-600'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === 'table'
                    ? 'bg-teal-500 text-white dark:bg-teal-600'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-600'
                }`}
              >
                <List className="h-4 w-4" />
                
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Users className="h-5 w-5 text-teal-500" />
            {t('common.users')}
          </CardTitle>
          <CardDescription>
            {data ? t('common.providersFound', { count: total }) : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <p>Error loading users. Please try again.</p>
            </div>
          )}

          {users.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                <Users className="h-12 w-12 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="mt-4 text-xl font-bold text-gray-900 dark:text-white">No users found</p>
              <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
                Try adjusting your search or role filter
              </p>
            </div>
          )}

          {viewMode === 'cards' && users.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {users.map((user: User) => (
                <div
                  key={user.id}
                  onClick={() => navigate(`/users/${user.id}`)}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-teal-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-teal-600 cursor-pointer"
                >
                  <div className="flex h-28 items-center justify-center bg-gradient-to-br from-teal-500/10 to-teal-600/5 dark:from-teal-900/30 dark:to-teal-800/20">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-xl font-bold text-teal-600 dark:bg-teal-800/50 dark:text-teal-300">
                      {(getName(user.name) || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadge(user.role)}`}>
                      {getRoleLabel(user.role)}
                    </p>
                    <h3 className="mt-2 font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {getName(user.name)}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{user.phone || '—'}</p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : '—'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-1">
                      <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs focus:ring-2 focus:ring-teal-500" onClick={(e) => {
                        e.stopPropagation();
                        const newName = prompt(t('common.enterNewName'), getName(user.name));
                        if(newName) {
                           userService.updateUser(user.id, { name: { en: newName, ar: newName } }).then(() => queryClient.invalidateQueries({ queryKey:['users'] }));
                        }
                      }}>
                        <Pencil className="h-3.5 w-3.5" /> {t('common.edit')}
                      </Button>
                      
                      {user.isActive ? (
                        <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs text-amber-600 focus:ring-2 focus:ring-teal-500" onClick={(e) => { e.stopPropagation(); handleSuspend(user.id, getName(user.name)); }}>
                          <Ban className="h-3.5 w-3.5" /> {t('common.suspend')}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs text-emerald-600 focus:ring-2 focus:ring-teal-500" onClick={(e) => {
                           e.stopPropagation();
                           if(window.confirm(t('common.confirmActivate', { name: getName(user.name) }))) {
                             userService.activateUser(user.id).then(() => queryClient.invalidateQueries({ queryKey:['users'] }));
                           }
                        }}>
                          <CheckCircle className="h-3.5 w-3.5" /> {t('common.activate')}
                        </Button>
                      )}

                      <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs text-red-600 focus:ring-2 focus:ring-teal-500" onClick={(e) => { e.stopPropagation(); handleDelete(user.id, getName(user.name)); }}>
                        <Trash2 className="h-3.5 w-3.5" /> {t('common.delete')}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'table' && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.name')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.email')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.phone')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.role')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.status')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.joined')}</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {users.map((user: User) => (
                    <tr key={user.id} onClick={() => navigate(`/users/${user.id}`)} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{getName(user.name)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.email}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{user.phone || 'N/A'}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRoleBadge(user.role)}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          user.isActive ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
                        }`}>
                          {user.isActive ? t('common.active') : t('common.suspended')}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {user.createdAt ? format(new Date(user.createdAt), 'MMM dd, yyyy') : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="mt-3 flex flex-wrap gap-1">

                      <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs focus:ring-2 focus:ring-teal-500" onClick={(e) => {
                        e.stopPropagation();
                        const newName = prompt("Enter new name:", getName(user.name));
                        if(newName) {
                           userService.updateUser(user.id, { name: { en: newName, ar: newName } }).then(() => queryClient.invalidateQueries({ queryKey:['users'] }));
                        }
                      }}>
                        <Pencil className="h-3.5 w-3.5" /> {t('common.edit')}
                      </Button>
                      
                      {user.isActive ? (
                        <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs text-amber-600 focus:ring-2 focus:ring-teal-500" onClick={(e) => { e.stopPropagation(); handleSuspend(user.id, getName(user.name)); }}>
                          <Ban className="h-3.5 w-3.5" /> {t('common.suspend')}
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs text-emerald-600 focus:ring-2 focus:ring-teal-500" onClick={(e) => {
                           e.stopPropagation();
                           if(window.confirm(`${t('common.activate')} "${getName(user.name)}"?`)) {
                             userService.activateUser(user.id).then(() => queryClient.invalidateQueries({ queryKey:['users'] }));
                           }
                        }}>
                          <CheckCircle className="h-3.5 w-3.5" /> {t('common.activate')}
                        </Button>
                      )}

                      <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs text-red-600 focus:ring-2 focus:ring-teal-500" onClick={(e) => { e.stopPropagation(); handleDelete(user.id, getName(user.name)); }}>
                        <Trash2 className="h-3.5 w-3.5" /> {t('common.delete')}
                      </Button>
                    </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
