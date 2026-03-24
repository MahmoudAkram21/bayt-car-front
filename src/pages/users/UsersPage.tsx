import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Search, Users, UserPlus, RefreshCw, LayoutGrid, List, Pencil, Trash2, Ban, UserCheck, Building2, Shield, CheckCircle, Bell } from 'lucide-react';
import { type User, UserRole, type PaginatedResponse } from '../../types';
import { userService } from '../../services/user.service';
import { adminUsersService, type AdminUser } from '../../services/adminUsers.service';
import { notificationService } from '../../services/notification.service';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { useRolePermissions } from '../../hooks/useRolePermissions';

import { useNavigate } from 'react-router-dom';

type ViewMode = 'cards' | 'table';
type UserTypeFilter = 'all' | 'app' | 'system';
type AddUserType = 'app' | 'admin';
const isCustomerRole = (role?: string) => role === UserRole.CUSTOMER || role === 'OWNER';

/** Unified row for list: either app user or system admin */
type UserRow =
  | { type: 'app'; id: string; user: User }
  | { type: 'system'; id: string; admin: AdminUser };

export const UsersPage = () => {
  const { t } = useTranslation();
  const { can } = useRolePermissions();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterUserType, setFilterUserType] = useState<UserTypeFilter>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [addUserType, setAddUserType] = useState<AddUserType>('app');
  const [adminFormData, setAdminFormData] = useState({ name: '', email: '', password: '', roleName: 'ADMIN' as 'ADMIN' | 'SUPER_ADMIN' });
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({ nameEn: '', nameAr: '', email: '', phone: '', role: UserRole.OWNER });
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyTargetUser, setNotifyTargetUser] = useState<User | null>(null);
  const [notifyForm, setNotifyForm] = useState({ titleEn: '', titleAr: '', bodyEn: '', bodyAr: '' });
  const canCreateUsers = can('USERS', 'CREATE');
  const canUpdateUsers = can('USERS', 'UPDATE');
  const canDeleteUsers = can('USERS', 'DELETE');

  const { data, isLoading, error } = useQuery<PaginatedResponse<User>>({
    queryKey: ['users', { role: filterRole !== 'all' ? filterRole : undefined, search: searchTerm }],
    queryFn: () => userService.getAllUsers({
      role: filterUserType === 'app' && filterRole !== 'all'
        ? (isCustomerRole(filterRole) ? UserRole.CUSTOMER : filterRole === UserRole.PROVIDER ? UserRole.PROVIDER : undefined)
        : undefined,
      search: searchTerm || undefined,
    }),
    enabled: filterUserType === 'all' || filterUserType === 'app',
  });

  const { data: adminUsers = [], isLoading: isLoadingAdmins } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminUsersService.getAll(),
    enabled: true,
  });

  const { data: appUsersStats } = useQuery<PaginatedResponse<User>>({
    queryKey: ['users', { role: undefined, search: undefined }],
    queryFn: () => userService.getAllUsers(),
    enabled: true,
  });

  const { data: adminRoles = [] } = useQuery({
    queryKey: ['admin-users-roles'],
    queryFn: () => adminUsersService.getRoles(),
    enabled: isAddUserOpen && addUserType === 'admin',
  });

  const combinedList = useMemo((): UserRow[] => {
    const appList: UserRow[] = (data?.data ?? []).map((user) => ({ type: 'app', id: user.id, user }));
    const systemList: UserRow[] = adminUsers.map((admin) => ({ type: 'system', id: `sys-${admin.id}`, admin }));
    if (filterUserType === 'app') return appList;
    if (filterUserType === 'system') return systemList;
    return [...appList, ...systemList];
  }, [data?.data, adminUsers, filterUserType]);

  const filteredList = useMemo(() => {
    if (filterRole === 'all') return combinedList;
    return combinedList.filter((row) => {
      if (row.type === 'app') {
        const r = row.user.role;
        if (isCustomerRole(filterRole)) return isCustomerRole(r);
        return r === filterRole;
      }
      return row.admin.role === filterRole;
    });
  }, [combinedList, filterUserType, filterRole]);

  const applyStatFilter = (type: UserTypeFilter, role: string) => {
    setFilterUserType(type);
    setFilterRole(role);
  };

  const isStatActive = (type: UserTypeFilter, role: string) => filterUserType === type && filterRole === role;

  const createMutation = useMutation({
    mutationFn: (data: { name: { en: string; ar?: string }; email: string; phone?: string; role: string }) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsAddUserOpen(false);
      setFormData({ nameEn: '', nameAr: '', email: '', phone: '', role: UserRole.OWNER });
      toast.success(t('common.userCreated') || 'User created successfully');
    },
    onError: (error: any) => {
      const data = error.response?.data;
      const msg = data?.error ?? data?.errors?.[0]?.msg ?? error.message ?? 'Failed to create user';
      toast.error(msg);
    },
  });

  const createAdminMutation = useMutation({
    mutationFn: (data: { name: string; email: string; password: string; roleName: 'ADMIN' | 'SUPER_ADMIN' }) => adminUsersService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsAddUserOpen(false);
      setAdminFormData({ name: '', email: '', password: '', roleName: 'ADMIN' });
      toast.success(t('common.adminCreated') || 'Admin created successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error ?? error.message ?? 'Failed to create admin';
      toast.error(msg);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) => userService.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditUserOpen(false);
      setEditingUser(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success(t('common.userDeleted') || 'User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || error.message || 'Failed to delete user');
    },
  });

  const deleteAdminMutation = useMutation({
    mutationFn: (id: string) => adminUsersService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(t('common.adminDeleted') || 'Admin deleted successfully');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.error || error.message || 'Failed to delete admin';
      toast.error(msg);
    },
  });

  const suspendMutation = useMutation({
    mutationFn: (id: string) => userService.suspendUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(t('common.userSuspended') || 'User suspended');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to suspend user');
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => userService.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(t('common.userActivated') || 'User activated');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to activate user');
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: (params: { userId: string; titleEn?: string; titleAr?: string; bodyEn?: string; bodyAr?: string }) => notificationService.sendToUser(params),
    onSuccess: () => {
      console.log('[UsersPage] Send notification success');
      toast.success(t('common.notificationSent') || 'Notification sent');
      setIsNotifyModalOpen(false);
      setNotifyTargetUser(null);
      setNotifyForm({ titleEn: '', titleAr: '', bodyEn: '', bodyAr: '' });
    },
    onError: (error: any) => {
      console.error('[UsersPage] Send notification error:', error?.response?.data ?? error?.message ?? error);
      toast.error(error.response?.data?.error || error.message || 'Failed to send notification');
    },
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
      case UserRole.OWNER:
      case 'CUSTOMER':
        return t('common.customers');
      case UserRole.PROVIDER:
        return t('common.providers');
      case UserRole.ADMIN:
        return t('common.admins');
      case UserRole.SUPER_ADMIN:
        return t('common.superAdmin');
      default:
        return role;
    }
  };

  const getName = (name: User['name'] | string) => {
    if (typeof name === 'string') return name;
    return name?.en || name?.ar || 'N/A';
  };

  const getRowDisplayName = (row: UserRow) => row.type === 'app' ? getName(row.user.name) : row.admin.name;
  const getRowRole = (row: UserRow) => row.type === 'app' ? row.user.role : row.admin.role;
  const getRowEmail = (row: UserRow) => row.type === 'app' ? row.user.email : row.admin.email;

  const appUsers = appUsersStats?.data ?? [];
  const statCustomers = appUsers.filter((u: User) => isCustomerRole(u.role)).length;
  const statProviders = appUsers.filter((u: User) => u.role === UserRole.PROVIDER).length;
  const statAdmins = adminUsers.length;
  const statTotalUsers = statCustomers + statProviders + statAdmins;

  const handleDelete = (id: string, name: string) => {
    if (!canDeleteUsers) {
      toast.error(t('common.noPermission', 'You do not have permission for this action'));
      return;
    }
    if (window.confirm(t('common.confirmDelete', { name }))) deleteMutation.mutate(id);
  };

  const handleDeleteAdmin = (id: string, name: string) => {
    if (!canDeleteUsers) {
      toast.error(t('common.noPermission', 'You do not have permission for this action'));
      return;
    }
    if (window.confirm(t('common.confirmDeleteAdmin', { name }) || `Delete admin "${name}"? This cannot be undone.`)) {
      deleteAdminMutation.mutate(id);
    }
  };

  const handleSuspend = (id: string, name: string) => {
    if (!canUpdateUsers) {
      toast.error(t('common.noPermission', 'You do not have permission for this action'));
      return;
    }
    if (window.confirm(t('common.confirmSuspend', { name }))) {
      suspendMutation.mutate(id);
    }
  };

  const handleAddUser = () => {
    if (!canCreateUsers) {
      toast.error(t('common.noPermission', 'You do not have permission for this action'));
      return;
    }
    setFormData({ nameEn: '', nameAr: '', email: '', phone: '', role: UserRole.OWNER });
    setIsAddUserOpen(true);
  };

  const handleOpenNotifyModal = (user: User, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('[UsersPage] Open notify modal for user:', user.id, user.email);
    setNotifyTargetUser(user);
    setNotifyForm({ titleEn: '', titleAr: '', bodyEn: '', bodyAr: '' });
    setIsNotifyModalOpen(true);
  };

  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    const hasTitle = notifyForm.titleEn.trim() || notifyForm.titleAr.trim();
    if (!notifyTargetUser || !hasTitle) {
      console.log('[UsersPage] Send notification skipped: no target or no title', { notifyTargetUser: !!notifyTargetUser, titleEn: notifyForm.titleEn, titleAr: notifyForm.titleAr });
      return;
    }
    const payload = {
      userId: notifyTargetUser.id,
      titleEn: notifyForm.titleEn.trim() || undefined,
      titleAr: notifyForm.titleAr.trim() || undefined,
      bodyEn: notifyForm.bodyEn.trim() || undefined,
      bodyAr: notifyForm.bodyAr.trim() || undefined,
    };
    console.log('[UsersPage] Sending notification:', payload);
    sendNotificationMutation.mutate(payload);
  };

  const notifyFormHasTitle = (notifyForm.titleEn?.trim() || notifyForm.titleAr?.trim()) ?? false;

  const handleEditUser = (user: User) => {
    if (!canUpdateUsers) {
      toast.error(t('common.noPermission', 'You do not have permission for this action'));
      return;
    }
    setEditingUser(user);
    const userName = typeof user.name === 'string' ? user.name : user.name.en;
    const userNameAr = typeof user.name === 'string' ? user.name : user.name.ar;
    setFormData({
      nameEn: userName || '',
      nameAr: userNameAr || '',
      email: user.email,
      phone: user.phone || '',
      role: user.role,
    });
    setIsEditUserOpen(true);
  };

  const handleSubmitAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateUsers) {
      toast.error(t('common.noPermission', 'You do not have permission for this action'));
      return;
    }
    const nameEn = formData.nameEn.trim();
    const email = formData.email.trim();
    if (!nameEn) {
      toast.error(t('common.nameRequired') || 'Name (English) is required');
      return;
    }
    if (!email) {
      toast.error(t('common.emailRequired') || 'Valid email is required');
      return;
    }
    createMutation.mutate({
      name: { en: nameEn, ar: (formData.nameAr || nameEn).trim() || nameEn },
      email,
      phone: formData.phone?.trim() || undefined,
      role: formData.role,
    });
  };

  const handleSubmitAddAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreateUsers) {
      toast.error(t('common.noPermission', 'You do not have permission for this action'));
      return;
    }
    const name = adminFormData.name.trim();
    const email = adminFormData.email.trim();
    if (!name || !email || !adminFormData.password) {
      toast.error(t('common.fillRequired') || 'Please fill required fields');
      return;
    }
    if (adminFormData.password.length < 6) {
      toast.error(t('common.min6Chars') || 'Password must be at least 6 characters');
      return;
    }
    createAdminMutation.mutate({
      name,
      email,
      password: adminFormData.password,
      roleName: adminFormData.roleName,
    });
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdateUsers) {
      toast.error(t('common.noPermission', 'You do not have permission for this action'));
      return;
    }
    if (!editingUser) return;
    const payload = {
      name: { en: formData.nameEn, ar: formData.nameAr || formData.nameEn },
      phone: formData.phone || undefined,
      role: formData.role,
    };
    // #region agent log
    fetch('http://127.0.0.1:7851/ingest/636c300f-3a1d-4f92-81ef-e199f88d24ee',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'2c0de6'},body:JSON.stringify({sessionId:'2c0de6',location:'UsersPage.tsx:handleSubmitEdit',message:'edit payload sent',data:{nameEn:formData.nameEn,nameAr:formData.nameAr,payloadName:payload.name},timestamp:Date.now(),hypothesisId:'B'})}).catch(()=>{});
    // #endregion
    updateMutation.mutate({
      id: editingUser.id,
      data: payload,
    });
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
          <Button variant="outline" size="sm" className="rounded-xl gap-2 focus:ring-2 focus:ring-teal-500" onClick={() => { queryClient.invalidateQueries({ queryKey: ['users'] }); queryClient.invalidateQueries({ queryKey: ['admin-users'] }); }}>
            <RefreshCw className="h-4 w-4" />
            {t('common.refresh')}
          </Button>
          {canCreateUsers && (
          <Button size="sm" className="rounded-xl bg-teal-600 shadow-lg gap-2 hover:bg-teal-700 focus:ring-2 focus:ring-teal-500" onClick={() => { setAddUserType('app'); setAdminFormData({ name: '', email: '', password: '', roleName: 'ADMIN' }); handleAddUser(); }}>
            <UserPlus className="h-4 w-4" />
            {t('common.addUser')}
          </Button>
          )}
        </div>
      </div>

      {/* Modern Stats Grid - clickable to apply filter */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t('common.totalUsers'), value: statTotalUsers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', active: isStatActive('all', 'all'), onClick: () => applyStatFilter('all', 'all') },
          { label: t('common.customers'), value: statCustomers, icon: UserCheck, color: 'text-teal-600', bg: 'bg-teal-100', active: isStatActive('app', UserRole.OWNER), onClick: () => applyStatFilter('app', UserRole.OWNER) },
          { label: t('common.providers'), value: statProviders, icon: Building2, color: 'text-emerald-600', bg: 'bg-emerald-100', active: isStatActive('app', UserRole.PROVIDER), onClick: () => applyStatFilter('app', UserRole.PROVIDER) },
          { label: t('common.admins'), value: statAdmins, icon: Shield, color: 'text-amber-600', bg: 'bg-amber-100', active: isStatActive('system', 'all'), onClick: () => applyStatFilter('system', 'all') },
        ].map((stat, i) => (
          <div
            key={i}
            role="button"
            tabIndex={0}
            onClick={stat.onClick}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); stat.onClick(); } }}
            className={`group relative cursor-pointer overflow-hidden rounded-2xl border bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:bg-gray-800/60 ${
              stat.active
                ? 'border-teal-400 ring-2 ring-teal-400/30 shadow-lg dark:border-teal-500'
                : 'border-gray-100 dark:border-gray-700'
            }`}
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
              value={filterUserType}
              onChange={(e) => {
                const next = e.target.value as UserTypeFilter;
                setFilterUserType(next);
                // Reset role when it's not valid for the new type
                if (next === 'app' && (filterRole === 'ADMIN' || filterRole === 'SUPER_ADMIN')) setFilterRole('all');
                if (next === 'system' && (filterRole === UserRole.OWNER || filterRole === UserRole.PROVIDER)) setFilterRole('all');
              }}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{t('common.all')}</option>
              <option value="app">{t('common.appUsers') || 'App Users'}</option>
              <option value="system">{t('common.admins')}</option>
            </select>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-gray-900 focus:ring-2 focus:ring-teal-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">{t('common.all')}</option>
              {filterUserType !== 'system' && (
                <>
                  <option value={UserRole.OWNER}>{t('common.customers')}</option>
                  <option value={UserRole.PROVIDER}>{t('common.providers')}</option>
                </>
              )}
              {filterUserType !== 'app' && (
                <>
                  <option value="ADMIN">{t('common.admin')}</option>
                  <option value="SUPER_ADMIN">{t('common.superAdmin')}</option>
                </>
              )}
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
            {filteredList.length > 0 ? (filterUserType === 'system' ? t('common.admins') : t('common.users')) + `: ${filteredList.length}` : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {(isLoading || (filterUserType !== 'app' && isLoadingAdmins)) && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
            </div>
          )}

          {error && filterUserType !== 'system' && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              <p>Error loading users. Please try again.</p>
            </div>
          )}

          {filteredList.length === 0 && !isLoading && (filterUserType === 'app' || !isLoadingAdmins) && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/30">
                <Users className="h-12 w-12 text-teal-600 dark:text-teal-400" />
              </div>
              <p className="mt-4 text-xl font-bold text-gray-900 dark:text-white">No users found</p>
              <p className="mt-2 max-w-md text-center text-gray-500 dark:text-gray-400">
                Try adjusting your search or filter
              </p>
            </div>
          )}

          {viewMode === 'cards' && filteredList.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredList.map((row) => (
                <div
                  key={row.id}
                  onClick={() => { if (row.type === 'app') navigate(`/users/${row.user.id}?type=app`); else navigate(`/users/${row.admin.id}?type=admin`); }}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-teal-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-teal-600 cursor-pointer"
                >
                  <div className="flex h-28 items-center justify-center bg-gradient-to-br from-teal-500/10 to-teal-600/5 dark:from-teal-900/30 dark:to-teal-800/20">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-xl font-bold text-teal-600 dark:bg-teal-800/50 dark:text-teal-300">
                      {(getRowDisplayName(row) || 'U').charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="p-4">
                    <p className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadge(getRowRole(row))}`}>
                      {getRoleLabel(getRowRole(row))}
                    </p>
                    {row.type === 'system' && (
                      <span className="ml-1 inline-flex rounded-full px-2 py-0.5 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">{t('common.dashboardAdmin') || 'Dashboard Admin'}</span>
                    )}
                    <h3 className="mt-2 font-semibold text-gray-900 dark:text-white line-clamp-1">
                      {getRowDisplayName(row)}
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 truncate">{getRowEmail(row)}</p>
                    {row.type === 'app' && <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{row.user.phone || '—'}</p>}
                    {row.type === 'app' && <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{row.user.createdAt ? format(new Date(row.user.createdAt), 'MMM dd, yyyy') : '—'}</p>}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {row.type === 'app' && (
                        <>
                          <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs focus:ring-2 focus:ring-teal-500" onClick={(e) => { e.stopPropagation(); handleOpenNotifyModal(row.user, e); }} title={t('common.sendNotification')}>
                            <Bell className="h-3.5 w-3.5" />
                          </Button>
                          {canUpdateUsers && (
                          <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs focus:ring-2 focus:ring-teal-500" onClick={(e) => { e.stopPropagation(); handleEditUser(row.user); }}>
                            <Pencil className="h-3.5 w-3.5" /> {t('common.edit')}
                          </Button>
                          )}
                          {canUpdateUsers && row.user.isActive && (
                            <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs text-amber-600 focus:ring-2 focus:ring-teal-500" onClick={(e) => { e.stopPropagation(); handleSuspend(row.user.id, getName(row.user.name)); }}>
                              <Ban className="h-3.5 w-3.5" /> {t('common.suspend')}
                            </Button>
                          )}
                          {canUpdateUsers && !row.user.isActive && (
                            <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs text-emerald-600 focus:ring-2 focus:ring-teal-500" onClick={(e) => { e.stopPropagation(); if (window.confirm(t('common.confirmActivate', { name: getName(row.user.name) }))) activateMutation.mutate(row.user.id); }}>
                              <CheckCircle className="h-3.5 w-3.5" /> {t('common.activate')}
                            </Button>
                          )}
                          {canDeleteUsers && (
                          <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs text-red-600 focus:ring-2 focus:ring-teal-500" onClick={(e) => { e.stopPropagation(); handleDelete(row.user.id, getName(row.user.name)); }}>
                            <Trash2 className="h-3.5 w-3.5" /> {t('common.delete')}
                          </Button>
                          )}
                        </>
                      )}
                      {row.type === 'system' && (
                        <>
                          <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs" onClick={(e) => { e.stopPropagation(); navigate('/admins'); }}>
                            <Shield className="h-3.5 w-3.5" /> {t('common.view')}
                          </Button>
                          {canDeleteUsers && (
                          <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs text-red-600 focus:ring-2 focus:ring-teal-500" onClick={(e) => { e.stopPropagation(); handleDeleteAdmin(row.admin.id, row.admin.name); }}>
                            <Trash2 className="h-3.5 w-3.5" /> {t('common.delete')}
                          </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {viewMode === 'table' && filteredList.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('common.type') || 'Type'}</th>
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
                  {filteredList.map((row) => (
                    <tr key={row.id} onClick={() => { if (row.type === 'app') navigate(`/users/${row.user.id}?type=app`); else navigate(`/users/${row.admin.id}?type=admin`); }} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {row.type === 'app' ? (t('common.appUser') || 'App User') : (t('common.dashboardAdmin') || 'Dashboard Admin')}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{getRowDisplayName(row)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{getRowEmail(row)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{row.type === 'app' ? (row.user.phone || 'N/A') : '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getRoleBadge(getRowRole(row))}`}>
                          {getRoleLabel(getRowRole(row))}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {row.type === 'app' ? (
                          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${row.user.isActive ? 'bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-400' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'}`}>
                            {row.user.isActive ? t('common.active') : (t('common.disabled') || t('common.suspended'))}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {row.type === 'app' && row.user.createdAt ? format(new Date(row.user.createdAt), 'MMM dd, yyyy') : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {row.type === 'app' && (
                            <>
                              <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs" onClick={(e) => { e.stopPropagation(); handleOpenNotifyModal(row.user, e); }}><Bell className="h-3.5 w-3.5" /></Button>
                              {canUpdateUsers && <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs" onClick={(e) => { e.stopPropagation(); handleEditUser(row.user); }}><Pencil className="h-3.5 w-3.5" /> {t('common.edit')}</Button>}
                              {canUpdateUsers && row.user.isActive && (
                                <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs text-amber-600" onClick={(e) => { e.stopPropagation(); handleSuspend(row.user.id, getName(row.user.name)); }}><Ban className="h-3.5 w-3.5" /> {t('common.suspend')}</Button>
                              )}
                              {canUpdateUsers && !row.user.isActive && (
                                <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs text-emerald-600" onClick={(e) => { e.stopPropagation(); if (window.confirm(t('common.confirmActivate', { name: getName(row.user.name) }))) activateMutation.mutate(row.user.id); }}><CheckCircle className="h-3.5 w-3.5" /> {t('common.activate')}</Button>
                              )}
                              {canDeleteUsers && <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs text-red-600" onClick={(e) => { e.stopPropagation(); handleDelete(row.user.id, getName(row.user.name)); }}><Trash2 className="h-3.5 w-3.5" /> {t('common.delete')}</Button>}
                            </>
                          )}
                          {row.type === 'system' && (
                            <>
                              <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs" onClick={(e) => { e.stopPropagation(); navigate('/admins'); }}><Shield className="h-3.5 w-3.5" /> {t('common.view')}</Button>
                              {canDeleteUsers && <Button variant="outline" size="sm" className="h-8 rounded-lg gap-1 text-xs text-red-600" onClick={(e) => { e.stopPropagation(); handleDeleteAdmin(row.admin.id, row.admin.name); }}><Trash2 className="h-3.5 w-3.5" /> {t('common.delete')}</Button>}
                            </>
                          )}
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

      {/* Add User Dialog */}
      <Dialog open={isAddUserOpen} onOpenChange={(open) => { if (!open) setAddUserType('app'); setIsAddUserOpen(open); }}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('common.addUser')}</DialogTitle>
            <DialogDescription>{t('common.addUserDescription') || 'Create an app user (customer/provider) or a dashboard admin.'}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium">{t('common.userType') || 'User type'}</label>
              <select
                value={addUserType}
                onChange={(e) => setAddUserType(e.target.value as AddUserType)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="app">{t('common.appUser') || 'App User'} (Customer / Provider)</option>
                <option value="admin">{t('common.dashboardAdmin') || 'Dashboard Admin'}</option>
              </select>
            </div>
          </div>
          {addUserType === 'app' ? (
            <form onSubmit={handleSubmitAdd}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="nameEn" className="text-sm font-medium">{t('common.name')} (English) *</label>
                  <Input id="nameEn" value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="nameAr" className="text-sm font-medium">{t('common.name')} (Arabic)</label>
                  <Input id="nameAr" value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="email" className="text-sm font-medium">{t('common.email')} *</label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="phone" className="text-sm font-medium">{t('common.phone')}</label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="role" className="text-sm font-medium">{t('common.role')} *</label>
                  <select id="role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700" required>
                    <option value={UserRole.OWNER}>{t('common.customers')}</option>
                    <option value={UserRole.PROVIDER}>{t('common.providers')}</option>
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>{t('common.cancel')}</Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={createMutation.isPending}>
                  {createMutation.isPending ? t('common.creating') : t('common.create')}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <form onSubmit={handleSubmitAddAdmin}>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="adminName" className="text-sm font-medium">{t('common.name')} *</label>
                  <Input id="adminName" value={adminFormData.name} onChange={(e) => setAdminFormData({ ...adminFormData, name: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="adminEmail" className="text-sm font-medium">{t('common.email')} *</label>
                  <Input id="adminEmail" type="email" value={adminFormData.email} onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })} required />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="adminPassword" className="text-sm font-medium">{t('common.password')} *</label>
                  <Input id="adminPassword" type="password" value={adminFormData.password} onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })} placeholder={t('common.min6Chars')} minLength={6} required />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="adminRole" className="text-sm font-medium">{t('common.role')} *</label>
                  <select id="adminRole" value={adminFormData.roleName} onChange={(e) => setAdminFormData({ ...adminFormData, roleName: e.target.value as 'ADMIN' | 'SUPER_ADMIN' })} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                    {adminRoles.map((r) => (<option key={r.id} value={r.name}>{r.name === 'SUPER_ADMIN' ? t('common.superAdmin') : t('common.admin')}</option>))}
                    {adminRoles.length === 0 && (<><option value="ADMIN">{t('common.admin')}</option><option value="SUPER_ADMIN">{t('common.superAdmin')}</option></>)}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)}>{t('common.cancel')}</Button>
                <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={createAdminMutation.isPending}>
                  {createAdminMutation.isPending ? t('common.creating') : t('common.create')}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('common.editUser')}</DialogTitle>
            <DialogDescription>Update user information below.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="editNameEn" className="text-sm font-medium">{t('common.name')} (English) *</label>
                <Input id="editNameEn" value={formData.nameEn} onChange={(e) => setFormData({ ...formData, nameEn: e.target.value })} required />
              </div>
              <div className="grid gap-2">
                <label htmlFor="editNameAr" className="text-sm font-medium">{t('common.name')} (Arabic)</label>
                <Input id="editNameAr" value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="editEmail" className="text-sm font-medium">{t('common.email')}</label>
                <Input id="editEmail" type="email" value={formData.email} disabled className="bg-gray-100 dark:bg-gray-800" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="editPhone" className="text-sm font-medium">{t('common.phone')}</label>
                <Input id="editPhone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <label htmlFor="editRole" className="text-sm font-medium">{t('common.role')} *</label>
                <select id="editRole" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700" required>
                  <option value={UserRole.OWNER}>{t('common.customers')}</option>
                  <option value={UserRole.PROVIDER}>{t('common.providers')}</option>
                  <option value={UserRole.ADMIN}>{t('common.admins')}</option>
                  <option value={UserRole.SUPER_ADMIN}>{t('common.superAdmin')}</option>
                </select>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditUserOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? 'Updating...' : t('common.save')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Send Notification Dialog */}
      <Dialog open={isNotifyModalOpen} onOpenChange={(open) => { if (!open) { setNotifyTargetUser(null); setNotifyForm({ titleEn: '', titleAr: '', bodyEn: '', bodyAr: '' }); } setIsNotifyModalOpen(open); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>{t('common.sendNotification')}</DialogTitle>
            <DialogDescription>
              {notifyTargetUser ? t('common.sendNotificationTo', { name: getName(notifyTargetUser.name) }) : ''}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSendNotification}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="notifyTitleEn" className="text-sm font-medium">{t('common.titleEnglish')} *</label>
                <Input id="notifyTitleEn" value={notifyForm.titleEn} onChange={(e) => setNotifyForm({ ...notifyForm, titleEn: e.target.value })} placeholder={t('common.notificationTitleEn')} dir="ltr" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="notifyTitleAr" className="text-sm font-medium">{t('common.titleArabic')} *</label>
                <Input id="notifyTitleAr" value={notifyForm.titleAr} onChange={(e) => setNotifyForm({ ...notifyForm, titleAr: e.target.value })} placeholder={t('common.notificationTitleAr')} dir="rtl" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="notifyBodyEn" className="text-sm font-medium">{t('common.bodyEnglish')}</label>
                <textarea id="notifyBodyEn" value={notifyForm.bodyEn} onChange={(e) => setNotifyForm({ ...notifyForm, bodyEn: e.target.value })} placeholder={t('common.notificationBodyEn')} rows={2} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white w-full resize-y" dir="ltr" />
              </div>
              <div className="grid gap-2">
                <label htmlFor="notifyBodyAr" className="text-sm font-medium">{t('common.bodyArabic')}</label>
                <textarea id="notifyBodyAr" value={notifyForm.bodyAr} onChange={(e) => setNotifyForm({ ...notifyForm, bodyAr: e.target.value })} placeholder={t('common.notificationBodyAr')} rows={2} className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white w-full resize-y" dir="rtl" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsNotifyModalOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700" disabled={sendNotificationMutation.isPending || !notifyFormHasTitle}>
                {sendNotificationMutation.isPending ? t('common.sending') : t('common.send')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
