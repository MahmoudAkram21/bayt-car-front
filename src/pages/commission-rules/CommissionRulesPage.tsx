import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { commissionRulesService, type CommissionRule, type CommissionRuleScope } from '../../services/commissionRules.service';
import { Percent, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';

const SCOPE_OPTIONS: { value: CommissionRuleScope; label: string }[] = [
  { value: 'GLOBAL', label: 'عالمي' },
  { value: 'SERVICE', label: 'حسب الخدمة' },
  { value: 'PROVIDER', label: 'حسب مقدم الخدمة' },
];

export const CommissionRulesPage = () => {
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
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            قواعد العمولة
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            عمولة العميل (رسوم الخدمة) وعمولة مقدم الخدمة. عالمي، حسب الخدمة، أو حسب المقدم.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => queryClient.invalidateQueries({ queryKey: ['commission-rules'] })}>
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button size="sm" className="rounded-xl bg-amber-600 gap-2 hover:bg-amber-700" onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}>
            <Plus className="h-4 w-4" />
            إضافة قاعدة
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6 rounded-2xl border-amber-200 dark:border-amber-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 dark:text-white">{editingId ? 'تعديل قاعدة العمولة' : 'إضافة قاعدة عمولة جديدة'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div>
                <Label>النطاق</Label>
                <select
                  value={form.scope}
                  onChange={(e) => setForm((p) => ({ ...p, scope: e.target.value as CommissionRuleScope }))}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  required
                >
                  {SCOPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>معرف الكيان (اختياري)</Label>
                <Input type="number" min="0" placeholder="—" value={form.entity_id} onChange={(e) => setForm((p) => ({ ...p, entity_id: e.target.value }))} className="mt-1 rounded-lg" />
              </div>
              <div>
                <Label>عمولة العميل %</Label>
                <Input type="number" step="0.01" min="0" max="100" value={form.customer_commission_pct} onChange={(e) => setForm((p) => ({ ...p, customer_commission_pct: e.target.value }))} className="mt-1 rounded-lg" required />
              </div>
              <div>
                <Label>عمولة المقدم %</Label>
                <Input type="number" step="0.01" min="0" max="100" value={form.provider_commission_pct} onChange={(e) => setForm((p) => ({ ...p, provider_commission_pct: e.target.value }))} className="mt-1 rounded-lg" required />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="rounded border-gray-300" />
                  مفعّل
                </label>
              </div>
              <div className="flex items-end gap-2">
                <Button type="submit" size="sm" className="rounded-lg" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'حفظ التعديل' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => { setShowForm(false); setEditingId(null); resetForm(); }}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 overflow-hidden rounded-2xl border border-amber-200 bg-amber-50 shadow-sm dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex items-center justify-between p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">إجمالي القواعد</p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{rules.length}</p>
          </div>
          <Percent className="h-10 w-10 text-amber-600 dark:text-amber-400" />
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Percent className="h-5 w-5 text-amber-500" />
            قواعد العمولة
          </CardTitle>
          <CardDescription>الأولوية: مقدم الخدمة → الخدمة → عالمي</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-amber-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              فشل تحميل القواعد.
            </div>
          )}
          {!isLoading && !error && rules.length === 0 && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">لا توجد قواعد بعد. استخدم &quot;إضافة قاعدة&quot; أعلاه.</div>
          )}
          {!isLoading && rules.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">النطاق</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">معرف الكيان</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">عمولة العميل %</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">عمولة المقدم %</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">الحالة</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {rules.map((r: CommissionRule) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{scopeLabel[r.scope] ?? r.scope}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{r.entity_id ?? '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">{Number(r.customer_commission_pct)}%</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">{Number(r.provider_commission_pct)}%</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${r.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {r.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={() => startEdit(r)} title="تعديل">
                          <Pencil className="h-4 w-4 text-amber-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(r.id)} title="حذف">
                          <Trash2 className="h-4 w-4" />
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
    </div>
  );
};
