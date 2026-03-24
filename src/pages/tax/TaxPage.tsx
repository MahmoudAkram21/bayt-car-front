import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { taxService, type TaxSettings } from '../../services/tax.service';
import { Receipt, Plus, Pencil, RefreshCw, CheckCircle2, XCircle, Percent } from 'lucide-react';
import { format } from 'date-fns';
import { useRolePermissions } from '../../hooks/useRolePermissions';

export const TaxPage = () => {
  const { can } = useRolePermissions();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ is_enabled: true, tax_percent: '15' });
  const canCreateTax = can('TAX', 'CREATE');
  const canUpdateTax = can('TAX', 'UPDATE');

  const { data, isLoading, error } = useQuery({
    queryKey: ['tax-settings'],
    queryFn: () => taxService.list(),
  });
  const list = data?.data ?? [];
  const active = list.find((t: TaxSettings) => t.is_enabled);

  const createMutation = useMutation({
    mutationFn: (payload: { is_enabled?: boolean; tax_percent: number }) => taxService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-settings'] });
      setShowForm(false);
      setForm({ is_enabled: true, tax_percent: '15' });
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TaxSettings> }) => taxService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-settings'] });
      setEditingId(null);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId && !canUpdateTax) return;
    if (!editingId && !canCreateTax) return;
    const payload = { is_enabled: form.is_enabled, tax_percent: parseFloat(form.tax_percent) };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };
  const startEdit = (t: TaxSettings) => {
    setEditingId(t.id);
    setForm({ is_enabled: t.is_enabled, tax_percent: String(t.tax_percent) });
    setShowForm(true);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
           <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-500 to-gray-600 shadow-lg text-white">
             <Receipt className="h-6 w-6" />
           </div>
           <div>
             <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
               إعدادات الضريبة
             </h1>
             <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
               إدارة نسبة الضريبة المضافة وتفعيلها
             </p>
           </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl gap-2 hover:bg-white/50 hover:text-slate-600 dark:hover:bg-gray-800/50 dark:hover:text-slate-400" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['tax-settings'] })}
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          {canCreateTax && <Button 
            size="sm" 
            className="rounded-xl bg-slate-600 gap-2 hover:bg-slate-700 shadow-lg shadow-slate-600/20" 
            onClick={() => { setShowForm(true); setEditingId(null); setForm({ is_enabled: true, tax_percent: '15' }); }}
          >
            <Plus className="h-4 w-4" />
            إضافة إعداد ضريبة
          </Button>}
        </div>
      </div>

      {showForm && (
        <Card className="border-slate-100 bg-slate-50/50 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/10">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">{editingId ? 'تعديل إعداد الضريبة' : 'إضافة إعداد ضريبة جديد'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 sm:flex-row sm:items-end">
              <fieldset disabled={(editingId ? !canUpdateTax : !canCreateTax) || createMutation.isPending || updateMutation.isPending} className="contents">
              <div className="relative">
                <Label>نسبة الضريبة %</Label>
                <div className="relative mt-1">
                   <Input type="number" step="0.01" min="0" max="100" value={form.tax_percent} onChange={(e) => setForm((p) => ({ ...p, tax_percent: e.target.value }))} className="w-40 bg-white pr-8 dark:bg-gray-800" required />
                   <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                     <Percent className="h-3 w-3" />
                   </div>
                </div>
              </div>
              <div className="pb-3">
                 <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                   <input type="checkbox" checked={form.is_enabled} onChange={(e) => setForm((p) => ({ ...p, is_enabled: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-slate-600 focus:ring-slate-500" />
                   تفعيل الضريبة في النظام
                 </label>
              </div>
              <div className="flex gap-2 mr-auto">
                <Button type="button" variant="outline" size="sm" className="rounded-xl" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  إلغاء
                </Button>
                <Button type="submit" size="sm" className="rounded-xl bg-slate-600 hover:bg-slate-700" disabled={(editingId ? !canUpdateTax : !canCreateTax) || createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'حفظ التغييرات' : 'إضافة'}
                </Button>
              </div>
              </fieldset>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">حالة الضريبة</p>
              <div className="mt-2 flex items-center gap-2">
                 <span className={`inline-flex h-2.5 w-2.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                 <p className="text-2xl font-bold text-gray-900 dark:text-white">{active ? 'مفعّلة' : 'غير مفعّلة'}</p>
              </div>
            </div>
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-opacity-20 ${active ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
              {active ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
            </div>
          </div>
        </div>
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">النسبة المطبقة حالياً</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">
                {active ? Number(active.tax_percent) : '0'}
                <span className="text-lg text-gray-400 font-normal">%</span>
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              <Percent className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-gray-200 bg-white/60 shadow-lg backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Receipt className="h-5 w-5 text-slate-500" />
            سجل إعدادات الضريبة
          </CardTitle>
          <CardDescription>جميع إعدادات الضريبة السابقة والحالية</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="py-8 text-center text-red-600 dark:text-red-400">
              فشل تحميل إعدادات الضريبة.
            </div>
          )}
          {!isLoading && !error && list.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
               <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-900/20">
                 <Receipt className="h-8 w-8 text-slate-300 dark:text-slate-600" />
               </div>
               <p className="mt-4 text-gray-500 dark:text-gray-400">لا توجد إعدادات ضريبة بعد.</p>
            </div>
          )}
          {!isLoading && list.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100/50 dark:bg-gray-700/40">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">المعرف</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">الحالة</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">النسبة</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">أخر تحديث</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {list.map((t: TaxSettings) => (
                    <tr key={t.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 font-mono">#{t.id}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${t.is_enabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                           <span className={`h-1.5 w-1.5 rounded-full ${t.is_enabled ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                           {t.is_enabled ? 'مفعّل' : 'معطل'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-1 text-sm font-bold text-gray-900 dark:text-white">
                           {Number(t.tax_percent)}
                           <span className="text-xs font-normal text-gray-500">%</span>
                         </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {t.updated_at ? format(new Date(t.updated_at), 'PP p') : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {canUpdateTax && <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800/50 dark:hover:text-slate-300" onClick={() => startEdit(t)} title="تعديل">
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
    </div>
  );
};
