import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { taxService, type TaxSettings } from '../../services/tax.service';
import { Receipt, Plus, Pencil, RefreshCw } from 'lucide-react';

export const TaxPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ is_enabled: true, tax_percent: '15' });

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
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            إعدادات الضريبة
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            تفعيل/إيقاف الضريبة ونسبة الضريبة. تُطبق بعد العمولة في تفصيل الطلب.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => queryClient.invalidateQueries({ queryKey: ['tax-settings'] })}>
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button size="sm" className="rounded-xl bg-slate-600 gap-2 hover:bg-slate-700" onClick={() => { setShowForm(true); setEditingId(null); setForm({ is_enabled: true, tax_percent: '15' }); }}>
            <Plus className="h-4 w-4" />
            إضافة إعداد ضريبة
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6 rounded-2xl border-slate-200 dark:border-slate-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 dark:text-white">{editingId ? 'تعديل إعداد الضريبة' : 'إضافة إعداد ضريبة جديد'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
              <div>
                <Label>نسبة الضريبة %</Label>
                <Input type="number" step="0.01" min="0" max="100" value={form.tax_percent} onChange={(e) => setForm((p) => ({ ...p, tax_percent: e.target.value }))} className="mt-1 w-32 rounded-lg" required />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={form.is_enabled} onChange={(e) => setForm((p) => ({ ...p, is_enabled: e.target.checked }))} className="rounded border-gray-300" />
                مفعّل
              </label>
              <div className="flex gap-2">
                <Button type="submit" size="sm" className="rounded-lg" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'حفظ التعديل' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">الضريبة مفعّلة</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{active ? 'نعم' : 'لا'}</p>
            </div>
            <Receipt className="h-10 w-10 text-slate-600 dark:text-slate-400" />
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-700 dark:bg-slate-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">النسبة النشطة</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{active ? `${Number(active.tax_percent)}%` : '—'}</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Receipt className="h-5 w-5 text-slate-500" />
            قائمة إعدادات الضريبة
          </CardTitle>
          <CardDescription>جميع صفوف إعداد الضريبة</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              فشل تحميل إعدادات الضريبة.
            </div>
          )}
          {!isLoading && !error && list.length === 0 && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">لا توجد إعدادات بعد. استخدم &quot;إضافة إعداد ضريبة&quot; أعلاه.</div>
          )}
          {!isLoading && list.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">#</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">مفعّل</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">نسبة الضريبة %</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">آخر تحديث</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {list.map((t: TaxSettings) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{t.id}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${t.is_enabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {t.is_enabled ? 'نعم' : 'لا'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{Number(t.tax_percent)}%</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{new Date(t.updated_at).toLocaleDateString()}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={() => startEdit(t)} title="تعديل">
                          <Pencil className="h-4 w-4 text-slate-600" />
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
