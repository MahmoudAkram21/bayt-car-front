import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { loyaltyService, type LoyaltyConfig, type LoyaltyAccountWithUser } from '../../services/loyalty.service';
import { userService } from '../../services/user.service';
import { Gift, Users, TrendingUp, Plus, Pencil, RefreshCw } from 'lucide-react';

export const LoyaltyPage = () => {
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
    const userId = parseInt(formAdjust.user_id, 10);
    const amount = parseInt(formAdjust.amount, 10);
    if (Number.isNaN(userId) || Number.isNaN(amount)) return;
    adjustPointsMutation.mutate({ userId, amount, description: formAdjust.description || 'تعديل من الإدارة' });
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
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            الولاء والكاش باك
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            معدل النقاط، تحويل الكاش باك، الحد الأدنى للاسترداد. عرض حسابات الولاء.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => queryClient.invalidateQueries({ queryKey: ['loyalty-configs', 'loyalty-accounts'] })}>
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button size="sm" className="rounded-xl bg-amber-600 gap-2 hover:bg-amber-700" onClick={() => { setShowConfigForm(true); setEditingConfigId(null); setFormConfig({ points_per_currency: '1', cashback_per_point: '0.01', min_points_redemption: '100', is_active: true }); }}>
            <Plus className="h-4 w-4" />
            إضافة إعداد ولاء
          </Button>
          <Button size="sm" variant="secondary" className="rounded-xl gap-2" onClick={() => setShowAdjustForm(true)}>
            <Users className="h-4 w-4" />
            تعديل نقاط عميل
          </Button>
        </div>
      </div>

      {/* Form: إضافة/تعديل إعداد ولاء */}
      {(showConfigForm || editingConfigId) && (
        <Card className="mb-6 rounded-2xl border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 dark:text-white">{editingConfigId ? 'تعديل إعداد الولاء' : 'إضافة إعداد ولاء جديد'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitConfig} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              <div>
                <Label>نقاط لكل وحدة عملة</Label>
                <Input type="number" step="0.0001" min="0" value={formConfig.points_per_currency} onChange={(e) => setFormConfig((p) => ({ ...p, points_per_currency: e.target.value }))} className="mt-1 rounded-lg" required />
              </div>
              <div>
                <Label>كاش باك لكل نقطة (ر.س)</Label>
                <Input type="number" step="0.000001" min="0" value={formConfig.cashback_per_point} onChange={(e) => setFormConfig((p) => ({ ...p, cashback_per_point: e.target.value }))} className="mt-1 rounded-lg" required />
              </div>
              <div>
                <Label>الحد الأدنى للاسترداد (نقاط)</Label>
                <Input type="number" min="0" value={formConfig.min_points_redemption} onChange={(e) => setFormConfig((p) => ({ ...p, min_points_redemption: e.target.value }))} className="mt-1 rounded-lg" required />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={formConfig.is_active} onChange={(e) => setFormConfig((p) => ({ ...p, is_active: e.target.checked }))} className="rounded border-gray-300" />
                  مفعّل
                </label>
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" size="sm" className="rounded-lg" disabled={createConfigMutation.isPending || updateConfigMutation.isPending}>
                  {editingConfigId ? 'حفظ التعديل' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => { setShowConfigForm(false); setEditingConfigId(null); }}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Form: تعديل نقاط عميل (يُنشئ حساب ولاء إذا لم يكن موجوداً) */}
      {showAdjustForm && (
        <Card className="mb-6 rounded-2xl border-emerald-200 dark:border-emerald-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 dark:text-white">تعديل نقاط عميل / إضافة عميل للولاء</CardTitle>
            <CardDescription>اختر المستخدم والمبلغ (موجب إضافة، سالب خصم). يُنشئ حساب ولاء تلقائياً إن لم يكن موجوداً.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitAdjust} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>المستخدم</Label>
                <select
                  value={formAdjust.user_id}
                  onChange={(e) => setFormAdjust((p) => ({ ...p, user_id: e.target.value }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                >
                  <option value="">-- اختر مستخدم --</option>
                  {users.map((u: any) => (
                    <option key={u.id} value={u.id}>{typeof u.name === 'object' ? (u.name?.ar || u.name?.en) : u.name} (ID: {u.id})</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>المبلغ (نقاط، موجب أو سالب)</Label>
                <Input type="number" value={formAdjust.amount} onChange={(e) => setFormAdjust((p) => ({ ...p, amount: e.target.value }))} className="mt-1 rounded-lg" required />
              </div>
              <div>
                <Label>الوصف (اختياري)</Label>
                <Input value={formAdjust.description} onChange={(e) => setFormAdjust((p) => ({ ...p, description: e.target.value }))} placeholder="تعديل من الإدارة" className="mt-1 rounded-lg" />
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" size="sm" className="rounded-lg" disabled={adjustPointsMutation.isPending}>
                  تطبيق
                </Button>
                <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => setShowAdjustForm(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 shadow-sm dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">إعداد نشط</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{activeConfig ? 'نعم' : 'لا'}</p>
            </div>
            <Gift className="h-10 w-10 text-amber-600 dark:text-amber-400" />
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">حسابات الولاء</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{accounts.length}</p>
            </div>
            <Users className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-violet-200 bg-violet-50 shadow-sm dark:border-violet-800 dark:bg-violet-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">إجمالي النقاط</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{totalPoints.toLocaleString()}</p>
            </div>
            <TrendingUp className="h-10 w-10 text-violet-600 dark:text-violet-400" />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Gift className="h-5 w-5 text-amber-500" />
              إعدادات الولاء
            </CardTitle>
            <CardDescription>نقاط لكل وحدة، كاش باك لكل نقطة، حد أدنى للاسترداد</CardDescription>
          </CardHeader>
          <CardContent>
            {configLoading && (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
              </div>
            )}
            {configError && (
              <div className="rounded-xl border border-red-200 bg-red-50 py-6 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                فشل تحميل الإعدادات.
              </div>
            )}
            {!configLoading && !configError && configs.length === 0 && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">لا توجد إعدادات بعد. استخدم &quot;إضافة إعداد ولاء&quot; أعلاه.</div>
            )}
            {!configLoading && configs.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700/70">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">نقاط/وحدة</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">كاش باك/نقطة</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">حد استرداد</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">الحالة</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {configs.map((c: LoyaltyConfig) => (
                      <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{Number(c.points_per_currency)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{Number(c.cashback_per_point)}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{c.min_points_redemption}</td>
                        <td className="px-4 py-3">
                          <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                            {c.is_active ? 'نشط' : 'غير نشط'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={() => startEditConfig(c)}>
                            <Pencil className="h-4 w-4 text-amber-600" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Users className="h-5 w-5 text-emerald-500" />
              حسابات الولاء
            </CardTitle>
            <CardDescription>رصيد النقاط لكل مستخدم. استخدم &quot;تعديل نقاط عميل&quot; لإضافة عميل جديد للولاء.</CardDescription>
          </CardHeader>
          <CardContent>
            {accountsLoading && (
              <div className="flex justify-center py-8">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
              </div>
            )}
            {accountsError && (
              <div className="rounded-xl border border-red-200 bg-red-50 py-6 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                فشل تحميل الحسابات.
              </div>
            )}
            {!accountsLoading && !accountsError && accounts.length === 0 && (
              <div className="py-8 text-center text-gray-500 dark:text-gray-400">لا توجد حسابات ولاء بعد. استخدم &quot;تعديل نقاط عميل&quot; واختر مستخدماً وأضف نقاطاً لإنشاء الحساب.</div>
            )}
            {!accountsLoading && accounts.length > 0 && (
              <div className="overflow-x-auto max-h-80 overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 dark:bg-gray-700/70 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">المستخدم</th>
                      <th className="px-4 py-2 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">النقاط</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {accounts.map((a: LoyaltyAccountWithUser) => (
                      <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-900 dark:text-white">{a.user?.name ?? `مستخدم #${a.user_id}`}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{a.user?.email ?? a.user?.phone ?? '—'}</div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{a.balance.toLocaleString()}</td>
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
