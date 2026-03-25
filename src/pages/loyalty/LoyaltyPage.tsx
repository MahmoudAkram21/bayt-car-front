import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { loyaltyService, type LoyaltyConfig, type LoyaltyAccountWithUser } from '../../services/loyalty.service';
import { userService } from '../../services/user.service';
import { Gift, Users, TrendingUp, Plus, Pencil, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { useRolePermissions } from '../../hooks/useRolePermissions';

export const LoyaltyPage = () => {
  const { t } = useTranslation();
  const { can } = useRolePermissions();
  const queryClient = useQueryClient();
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [showAdjustForm, setShowAdjustForm] = useState(false);
  const [editingConfigId, setEditingConfigId] = useState<number | null>(null);
  const [formConfig, setFormConfig] = useState({
    points_per_currency: '1',
    cashback_per_point: '0.01',
    min_points_redemption: '100',
    is_active: true,
  });
  const [formAdjust, setFormAdjust] = useState({ user_id: '', amount: '0', description: '' });
  const canCreateLoyalty = can('LOYALTY', 'CREATE');
  const canUpdateLoyalty = can('LOYALTY', 'UPDATE');

  const { data: configData, isLoading: configLoading, error: configError } = useQuery({
    queryKey: ['loyalty-configs'],
    queryFn: () => loyaltyService.getConfigs(),
  });
  const { data: accountsData, isLoading: accountsLoading, error: accountsError } = useQuery({
    queryKey: ['loyalty-accounts'],
    queryFn: () => loyaltyService.getAccounts(),
  });
  const { data: usersData } = useQuery({
    queryKey: ['users-for-loyalty'],
    queryFn: () => userService.getAllUsers({ limit: 500 }),
  });

  const configs = configData?.data ?? [];
  const accounts = accountsData?.data ?? [];
  const users = (usersData as any)?.data ?? [];
  const activeConfig = configs.find((c: LoyaltyConfig) => c.is_active);
  const totalPoints = accounts.reduce((sum: number, a: LoyaltyAccountWithUser) => sum + (a.balance ?? 0), 0);

  const createConfigMutation = useMutation({
    mutationFn: (data: { points_per_currency: number; cashback_per_point: number; min_points_redemption: number; is_active: boolean }) =>
      loyaltyService.createConfig(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-configs'] });
      setShowConfigForm(false);
      setFormConfig({ points_per_currency: '1', cashback_per_point: '0.01', min_points_redemption: '100', is_active: true });
    },
  });
  const updateConfigMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<LoyaltyConfig> }) => loyaltyService.updateConfig(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-configs'] });
      setEditingConfigId(null);
    },
  });
  const adjustPointsMutation = useMutation({
    mutationFn: ({ userId, amount, description }: { userId: number; amount: number; description: string }) =>
      loyaltyService.adjustPoints(userId, amount, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loyalty-accounts'] });
      setShowAdjustForm(false);
      setFormAdjust({ user_id: '', amount: '0', description: '' });
    },
  });

  const handleSubmitConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingConfigId && !canUpdateLoyalty) return;
    if (!editingConfigId && !canCreateLoyalty) return;
    if (editingConfigId) {
      updateConfigMutation.mutate({
        id: editingConfigId,
        data: {
          points_per_currency: parseFloat(formConfig.points_per_currency),
          cashback_per_point: parseFloat(formConfig.cashback_per_point),
          min_points_redemption: parseInt(formConfig.min_points_redemption, 10),
          is_active: formConfig.is_active,
        },
      });
    } else {
      createConfigMutation.mutate({
        points_per_currency: parseFloat(formConfig.points_per_currency),
        cashback_per_point: parseFloat(formConfig.cashback_per_point),
        min_points_redemption: parseInt(formConfig.min_points_redemption, 10),
        is_active: formConfig.is_active,
      });
    }
  };
  const handleSubmitAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canUpdateLoyalty) return;
    const userId = parseInt(formAdjust.user_id, 10);
    const amount = parseInt(formAdjust.amount, 10);
    if (Number.isNaN(userId) || Number.isNaN(amount)) return;
    adjustPointsMutation.mutate({ userId, amount, description: formAdjust.description || t('loyaltyPage.manualAdjustment') });
  };
  const startEditConfig = (c: LoyaltyConfig) => {
    setEditingConfigId(c.id);
    setFormConfig({
      points_per_currency: String(c.points_per_currency),
      cashback_per_point: String(c.cashback_per_point),
      min_points_redemption: String(c.min_points_redemption),
      is_active: c.is_active,
    });
    setShowConfigForm(true);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg text-white">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t('loyaltyPage.title')}
            </h1>
            <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
              {t('loyaltyPage.description')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl gap-2 hover:bg-white/50 hover:text-amber-600 dark:hover:bg-gray-800/50 dark:hover:text-amber-400" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['loyalty-configs', 'loyalty-accounts'] })}
          >
            <RefreshCw className="h-4 w-4" />
            {t('loyaltyPage.refresh')}
          </Button>
          {canCreateLoyalty && <Button 
            size="sm" 
            className="rounded-xl bg-amber-600 gap-2 hover:bg-amber-700 shadow-lg shadow-amber-600/20" 
            onClick={() => { setShowConfigForm(true); setEditingConfigId(null); setFormConfig({ points_per_currency: '1', cashback_per_point: '0.01', min_points_redemption: '100', is_active: true }); }}
          >
            <Plus className="h-4 w-4" />
            {t('loyaltyPage.addSetting')}
          </Button>}
          {canUpdateLoyalty && <Button 
            size="sm" 
            variant="secondary" 
            className="rounded-xl gap-2 bg-white/80 hover:bg-white text-gray-700 dark:bg-gray-800/80 dark:hover:bg-gray-800 dark:text-gray-200" 
            onClick={() => setShowAdjustForm(true)}
          >
            <Users className="h-4 w-4" />
            {t('loyaltyPage.editPoints')}
          </Button>}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('loyaltyPage.activeSetting')}</p>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeConfig ? t('loyaltyPage.yes') : t('loyaltyPage.no')}</p>
                {activeConfig ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              <Gift className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('loyaltyPage.loyaltyAccounts')}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{accounts.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('loyaltyPage.totalPointsDistributed')}</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{totalPoints.toLocaleString()}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Forms */}
      {(showConfigForm || editingConfigId) && (
        <Card className="border-amber-100 bg-amber-50/50 backdrop-blur-sm dark:border-amber-900/50 dark:bg-amber-900/10">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">{editingConfigId ? t('loyaltyPage.editLoyaltySetting') : t('loyaltyPage.addLoyaltySetting')}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitConfig} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
              <fieldset disabled={(editingConfigId ? !canUpdateLoyalty : !canCreateLoyalty) || createConfigMutation.isPending || updateConfigMutation.isPending} className="contents">
              <div className="space-y-2">
                <Label>{t('loyaltyPage.pointsPerUnit')}</Label>
                <Input type="number" step="0.0001" min="0" value={formConfig.points_per_currency} onChange={(e) => setFormConfig((p) => ({ ...p, points_per_currency: e.target.value }))} className="bg-white dark:bg-gray-800" required />
              </div>
              <div className="space-y-2">
                <Label>{t('loyaltyPage.cashbackPerPoint')}</Label>
                <Input type="number" step="0.000001" min="0" value={formConfig.cashback_per_point} onChange={(e) => setFormConfig((p) => ({ ...p, cashback_per_point: e.target.value }))} className="bg-white dark:bg-gray-800" required />
              </div>
              <div className="space-y-2">
                <Label>{t('loyaltyPage.minRedeemAmount')}</Label>
                <Input type="number" min="0" value={formConfig.min_points_redemption} onChange={(e) => setFormConfig((p) => ({ ...p, min_points_redemption: e.target.value }))} className="bg-white dark:bg-gray-800" required />
              </div>
              <div className="flex items-center pb-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={formConfig.is_active} onChange={(e) => setFormConfig((p) => ({ ...p, is_active: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                  {t('loyaltyPage.isActive')}
                </label>
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" size="sm" className="w-full rounded-xl bg-amber-600 hover:bg-amber-700" disabled={(editingConfigId ? !canUpdateLoyalty : !canCreateLoyalty) || createConfigMutation.isPending || updateConfigMutation.isPending}>
                  {editingConfigId ? t('loyaltyPage.save') : t('loyaltyPage.add')}
                </Button>
                <Button type="button" variant="outline" size="sm" className="w-full rounded-xl" onClick={() => { setShowConfigForm(false); setEditingConfigId(null); }}>
                  {t('loyaltyPage.cancel')}
                </Button>
              </div>
              </fieldset>
            </form>
          </CardContent>
        </Card>
      )}

      {showAdjustForm && (
        <Card className="border-emerald-100 bg-emerald-50/50 backdrop-blur-sm dark:border-emerald-900/50 dark:bg-emerald-900/10">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">{t('loyaltyPage.editCustomerPoints')}</CardTitle>
            <CardDescription>{t('loyaltyPage.editCustomerPointsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAdjust} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <fieldset disabled={!canUpdateLoyalty || adjustPointsMutation.isPending} className="contents">
              <div className="space-y-2">
                <Label>{t('loyaltyPage.user')}</Label>
                <select
                  value={formAdjust.user_id}
                  onChange={(e) => setFormAdjust((p) => ({ ...p, user_id: e.target.value }))}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  required
                >
                  <option value="">{t('loyaltyPage.selectUser')}</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>{typeof u.name === 'object' ? (u.name?.ar || u.name?.en) : u.name} (ID: {u.id})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label>{t('loyaltyPage.amountPoints')}</Label>
                <Input type="number" value={formAdjust.amount} onChange={(e) => setFormAdjust((p) => ({ ...p, amount: e.target.value }))} className="bg-white dark:bg-gray-800" placeholder={t('loyaltyPage.amountPlaceholder')} required />
              </div>
              <div className="space-y-2">
                <Label>{t('loyaltyPage.descriptionLabel')}</Label>
                <Input value={formAdjust.description} onChange={(e) => setFormAdjust((p) => ({ ...p, description: e.target.value }))} placeholder={t('loyaltyPage.descriptionPlaceholder')} className="bg-white dark:bg-gray-800" />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" size="sm" className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700" disabled={adjustPointsMutation.isPending}>
                  {t('loyaltyPage.apply')}
                </Button>
                <Button type="button" variant="outline" size="sm" className="w-full rounded-xl" onClick={() => setShowAdjustForm(false)}>
                  {t('loyaltyPage.cancel')}
                </Button>
              </div>
              </fieldset>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Configs Table */}
        <Card className="overflow-hidden rounded-2xl border-gray-200 bg-white/60 shadow-lg backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Gift className="h-5 w-5 text-amber-500" />
              {t('loyaltyPage.loyaltySettings')}
            </CardTitle>
            <CardDescription>{t('loyaltyPage.loyaltySettingsDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            {configLoading && (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              </div>
            )}
            {configError && (
              <div className="py-8 text-center text-red-600 dark:text-red-400">
                {t('loyaltyPage.loadSettingsError')}
              </div>
            )}
            {!configLoading && !configError && configs.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
                  <Gift className="h-8 w-8 text-amber-300 dark:text-amber-600" />
                </div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">{t('loyaltyPage.noSettings')}</p>
              </div>
            )}
            {!configLoading && configs.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100/50 dark:bg-gray-700/40">
                    <tr>
                      <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('loyaltyPage.pointsPerUnitShort')}</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('loyaltyPage.cashbackPerPointShort')}</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('loyaltyPage.minRedeemShort')}</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('loyaltyPage.statusLabel')}</th>
                      <th className="px-4 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {configs.map((c: LoyaltyConfig) => (
                      <tr key={c.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{Number(c.points_per_currency)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{Number(c.cashback_per_point)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{c.min_points_redemption}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${c.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
                             {c.is_active && <CheckCircle2 className="h-3 w-3" />}
                             {c.is_active ? t('loyaltyPage.active') : t('loyaltyPage.inactive')}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-end">
                          {canUpdateLoyalty && <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 dark:hover:text-amber-400" onClick={() => startEditConfig(c)}>
                            <Pencil className="h-4 w-4" />
                          </Button>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card className="overflow-hidden rounded-2xl border-gray-200 bg-white/60 shadow-lg backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Users className="h-5 w-5 text-emerald-500" />
              {t('loyaltyPage.loyaltyAccounts')}
            </CardTitle>
            <CardDescription>{t('loyaltyPage.currentBalances')}</CardDescription>
          </CardHeader>
          <CardContent>
            {accountsLoading && (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            )}
            {accountsError && (
              <div className="py-8 text-center text-red-600 dark:text-red-400">
                {t('loyaltyPage.loadAccountsError')}
              </div>
            )}
            {!accountsLoading && !accountsError && accounts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/20">
                  <Users className="h-8 w-8 text-emerald-300 dark:text-emerald-600" />
                </div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">{t('loyaltyPage.noActiveAccounts')}</p>
              </div>
            )}
            {!accountsLoading && accounts.length > 0 && (
              <div className="overflow-x-auto max-h-[400px] overflow-y-auto custom-scrollbar">
                <table className="w-full">
                  <thead className="bg-gray-100/50 dark:bg-gray-700/40 sticky top-0 backdrop-blur-md">
                    <tr>
                      <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('loyaltyPage.user')}</th>
                      <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{t('loyaltyPage.points')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {accounts.map((a: LoyaltyAccountWithUser) => (
                      <tr key={a.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                                <span className="text-xs font-bold">{a.user?.name ? a.user.name.toString().charAt(0).toUpperCase() : 'U'}</span>
                             </div>
                             <div>
                                <div className="font-medium text-gray-900 dark:text-white">{a.user?.name ?? `User #${a.user_id}`}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{a.user?.email ?? a.user?.phone ?? '—'}</div>
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex items-center gap-1.5">
                              <span className="font-bold text-gray-900 dark:text-white tabular-nums">{a.balance.toLocaleString()}</span>
                              <span className="text-xs text-gray-500">{t('loyaltyPage.points')}</span>
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
    </div>
  );
};
