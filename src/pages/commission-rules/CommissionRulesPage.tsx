import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { commissionRulesService, type CommissionRule, type CommissionRuleScope } from '../../services/commissionRules.service';
import { Percent, Plus, Pencil, Trash2, RefreshCw, Layers, ShieldCheck, Globe, Briefcase, User } from 'lucide-react';
import { useRolePermissions } from '../../hooks/useRolePermissions';

const SCOPE_OPTIONS: { value: CommissionRuleScope; label: string; icon: any }[] = [
  { value: 'GLOBAL', label: 'عالمي', icon: Globe },
  { value: 'SERVICE', label: 'حسب الخدمة', icon: Layers },
  { value: 'PROVIDER', label: 'حسب مقدم الخدمة', icon: Briefcase },
];

export const CommissionRulesPage = () => {
  const { can } = useRolePermissions();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    scope: 'GLOBAL' as CommissionRuleScope,
    entity_id: '',
    customer_commission_pct: '0',
    provider_commission_pct: '0',
    is_active: true,
  });
  const canCreateRules = can('COMMISSION_RULES', 'CREATE');
  const canUpdateRules = can('COMMISSION_RULES', 'UPDATE');
  const canDeleteRules = can('COMMISSION_RULES', 'DELETE');

  const { data, isLoading, error } = useQuery({
    queryKey: ['commission-rules'],
    queryFn: () => commissionRulesService.list(),
  });
  const rules = data?.data ?? [];
  const scopeLabel: Record<CommissionRuleScope, string> = {
    GLOBAL: 'عالمي',
    SERVICE: 'حسب الخدمة',
    PROVIDER: 'حسب مقدم الخدمة',
  };

  const createMutation = useMutation({
    mutationFn: (payload: { scope: CommissionRuleScope; entity_id?: number | null; customer_commission_pct: number; provider_commission_pct: number; is_active: boolean }) =>
      commissionRulesService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-rules'] });
      setShowForm(false);
      resetForm();
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CommissionRule> }) => commissionRulesService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['commission-rules'] });
      setEditingId(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => commissionRulesService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['commission-rules'] }),
  });

  const resetForm = () => setForm({ scope: 'GLOBAL', entity_id: '', customer_commission_pct: '0', provider_commission_pct: '0', is_active: true });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && !canUpdateRules) return;
    if (!editingId && !canCreateRules) return;
    const payload = {
      scope: form.scope,
      entity_id: form.entity_id.trim() ? parseInt(form.entity_id, 10) : null,
      customer_commission_pct: parseFloat(form.customer_commission_pct),
      provider_commission_pct: parseFloat(form.provider_commission_pct),
      is_active: form.is_active,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };
  const startEdit = (r: CommissionRule) => {
    setEditingId(r.id);
    setForm({
      scope: r.scope,
      entity_id: r.entity_id != null ? String(r.entity_id) : '',
      customer_commission_pct: String(r.customer_commission_pct),
      provider_commission_pct: String(r.provider_commission_pct),
      is_active: r.is_active,
    });
    setShowForm(true);
  };
  const handleDelete = (id: number) => {
    if (window.confirm('هل تريد حذف قاعدة العمولة؟')) deleteMutation.mutate(id);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
           <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg text-white">
             <Percent className="h-6 w-6" />
           </div>
           <div>
             <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
               قواعد العمولة
             </h1>
             <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
               إدارة نسب العمولة والرسوم للنظام
             </p>
           </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl gap-2 hover:bg-white/50 hover:text-amber-600 dark:hover:bg-gray-800/50 dark:hover:text-amber-400" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['commission-rules'] })}
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          {canCreateRules && <Button 
            size="sm" 
            className="rounded-xl bg-amber-600 gap-2 hover:bg-amber-700 shadow-lg shadow-amber-600/20" 
            onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
          >
            <Plus className="h-4 w-4" />
            إضافة قاعدة
          </Button>}
        </div>
      </div>

      {showForm && (
        <Card className="border-amber-100 bg-amber-50/50 backdrop-blur-sm dark:border-amber-900/50 dark:bg-amber-900/10">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">{editingId ? 'تعديل قاعدة العمولة' : 'إضافة قاعدة عمولة جديدة'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-6">
              <fieldset disabled={(editingId ? !canUpdateRules : !canCreateRules) || createMutation.isPending || updateMutation.isPending} className="contents">
              <div className="lg:col-span-2">
                <Label>النطاق</Label>
                <div className="relative mt-1">
                  <select
                    value={form.scope}
                    onChange={(e) => setForm((p) => ({ ...p, scope: e.target.value as CommissionRuleScope }))}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                    required
                  >
                    {SCOPE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="lg:col-span-1">
                <Label>معرف الكيان</Label>
                <Input type="number" min="0" placeholder="—" value={form.entity_id} onChange={(e) => setForm((p) => ({ ...p, entity_id: e.target.value }))} className="mt-1 bg-white dark:bg-gray-800" />
              </div>
              <div className="lg:col-span-1">
                <Label>عمولة العميل %</Label>
                <div className="relative mt-1">
                   <Input type="number" step="0.01" min="0" max="100" value={form.customer_commission_pct} onChange={(e) => setForm((p) => ({ ...p, customer_commission_pct: e.target.value }))} className="bg-white pr-8 dark:bg-gray-800" required />
                   <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                     <Percent className="h-3 w-3" />
                   </div>
                </div>
              </div>
              <div className="lg:col-span-1">
                <Label>عمولة المقدم %</Label>
                <div className="relative mt-1">
                   <Input type="number" step="0.01" min="0" max="100" value={form.provider_commission_pct} onChange={(e) => setForm((p) => ({ ...p, provider_commission_pct: e.target.value }))} className="bg-white pr-8 dark:bg-gray-800" required />
                   <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                     <Percent className="h-3 w-3" />
                   </div>
                </div>
              </div>
              <div className="flex items-center pt-6 lg:col-span-1">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500" />
                  مفعّل ونشط
                </label>
              </div>
              <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-6 justify-end">
                <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}>
                  إلغاء
                </Button>
                <Button type="submit" size="sm" className="rounded-xl bg-amber-600 hover:bg-amber-700" disabled={(editingId ? !canUpdateRules : !canCreateRules) || createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'حفظ التغييرات' : 'إضافة القاعدة'}
                </Button>
              </div>
              </fieldset>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">إجمالي القواعد</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{rules.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-gray-500 dark:text-gray-400">القواعد النشطة</p>
               <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{rules.filter(r => r.is_active).length}</p>
             </div>
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
               <Layers className="h-6 w-6" />
             </div>
           </div>
        </div>
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-gray-500 dark:text-gray-400">متوسط العمولة (مقدم)</p>
               <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                 {rules.length > 0
                   ? (rules.reduce((acc, curr) => acc + Number(curr.provider_commission_pct), 0) / rules.length).toFixed(1)
                   : 0}
                 <span className="text-lg text-gray-400 font-normal">%</span>
               </p>
             </div>
             <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
               <Percent className="h-6 w-6" />
             </div>
           </div>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-gray-200 bg-white/60 shadow-lg backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Percent className="h-5 w-5 text-amber-500" />
            قائمة القواعد
          </CardTitle>
          <CardDescription>يتم تطبيق القواعد بالأولوية: مقدم الخدمة ← الخدمة ← عالمي</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="py-8 text-center text-red-600 dark:text-red-400">
              فشل تحميل القواعد.
            </div>
          )}
          {!isLoading && !error && rules.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-900/20">
                <Percent className="h-8 w-8 text-amber-300 dark:text-amber-600" />
              </div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">لا توجد قواعد بعد.</p>
            </div>
          )}
          {!isLoading && rules.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100/50 dark:bg-gray-700/40">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">النطاق</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">الكيان</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">عمولة العميل</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">عمولة المقدم</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">الحالة</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {rules.map((r: CommissionRule) => (
                    <tr key={r.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${r.scope === 'GLOBAL' ? 'bg-indigo-100 text-indigo-600' : r.scope === 'SERVICE' ? 'bg-purple-100 text-purple-600' : 'bg-pink-100 text-pink-600'} dark:bg-opacity-20`}>
                              {r.scope === 'GLOBAL' && <Globe className="h-4 w-4" />}
                              {r.scope === 'SERVICE' && <Layers className="h-4 w-4" />}
                              {r.scope === 'PROVIDER' && <User className="h-4 w-4" />}
                           </div>
                           <span className="text-sm font-medium text-gray-900 dark:text-white">{scopeLabel[r.scope] ?? r.scope}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                        {r.entity_id ? (
                          <span className="inline-flex items-center rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                             ID: {r.entity_id}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-white">
                           {Number(r.customer_commission_pct)}
                           <span className="text-xs font-normal text-gray-500">%</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-white">
                           {Number(r.provider_commission_pct)}
                           <span className="text-xs font-normal text-gray-500">%</span>
                         </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${r.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${r.is_active ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                          {r.is_active ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {canUpdateRules && <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-900/20 dark:hover:text-amber-400" onClick={() => startEdit(r)} title="تعديل">
                            <Pencil className="h-4 w-4" />
                          </Button>}
                          {canDeleteRules && <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20" onClick={() => handleDelete(r.id)} title="حذف">
                            <Trash2 className="h-4 w-4" />
                          </Button>}
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
