import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { promoService, type PromoOffer, type OfferType, type OfferScope } from '../../services/promo.service';
import { Tag, Percent, Plus, Pencil, Trash2, RefreshCw, CheckCircle2, Ticket, Calendar } from 'lucide-react';
import { format } from 'date-fns';

const TYPE_OPTIONS: { value: OfferType; label: string }[] = [
  { value: 'PERCENTAGE', label: 'نسبة مئوية' },
  { value: 'FIXED', label: 'مبلغ ثابت' },
];
const SCOPE_OPTIONS: { value: OfferScope; label: string }[] = [
  { value: 'ALL', label: 'جميع الخدمات' },
  { value: 'SERVICE', label: 'خدمة محددة' },
];

const emptyForm = () => ({
  code: '',
  type: 'PERCENTAGE' as OfferType,
  value: '0',
  min_order_amount: '',
  max_discount: '',
  valid_from: '',
  valid_to: '',
  usage_limit: '',
  scope: 'ALL' as OfferScope,
  entity_id: '',
  is_active: true,
});

export const PromoPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());

  const { data, isLoading, error } = useQuery({
    queryKey: ['promo-offers'],
    queryFn: () => promoService.list(),
  });
  const offers = data?.data ?? [];
  const activeCount = offers.filter((o: PromoOffer) => o.is_active).length;

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof promoService.create>[0]) => promoService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-offers'] });
      setShowForm(false);
      setForm(emptyForm());
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<PromoOffer> }) => promoService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['promo-offers'] });
      setEditingId(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => promoService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['promo-offers'] }),
  });

  const toPayload = () => ({
    code: form.code.trim(),
    type: form.type,
    value: parseFloat(form.value),
    min_order_amount: form.min_order_amount.trim() ? parseFloat(form.min_order_amount) : null,
    max_discount: form.max_discount.trim() ? parseFloat(form.max_discount) : null,
    valid_from: form.valid_from.trim() || null,
    valid_to: form.valid_to.trim() || null,
    usage_limit: form.usage_limit.trim() ? parseInt(form.usage_limit, 10) : null,
    scope: form.scope,
    entity_id: form.entity_id.trim() ? parseInt(form.entity_id, 10) : null,
    is_active: form.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = toPayload();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };
  const startEdit = (o: PromoOffer) => {
    setEditingId(o.id);
    setForm({
      code: o.code,
      type: o.type,
      value: String(o.value),
      min_order_amount: o.min_order_amount != null ? String(o.min_order_amount) : '',
      max_discount: o.max_discount != null ? String(o.max_discount) : '',
      valid_from: o.valid_from ? o.valid_from.slice(0, 16) : '',
      valid_to: o.valid_to ? o.valid_to.slice(0, 16) : '',
      usage_limit: o.usage_limit != null ? String(o.usage_limit) : '',
      scope: o.scope,
      entity_id: o.entity_id != null ? String(o.entity_id) : '',
      is_active: o.is_active,
    });
    setShowForm(true);
  };
  const handleDelete = (id: number) => {
    if (window.confirm('هل تريد حذف العرض الترويجي؟')) deleteMutation.mutate(id);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
           <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg text-white">
             <Tag className="h-6 w-6" />
           </div>
           <div>
             <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
               العروض الترويجية
             </h1>
             <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
               إدارة أكواد الخصم والعروض الخاصة
             </p>
           </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl gap-2 hover:bg-white/50 hover:text-rose-600 dark:hover:bg-gray-800/50 dark:hover:text-rose-400" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['promo-offers'] })}
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button 
            size="sm" 
            className="rounded-xl bg-rose-600 gap-2 hover:bg-rose-700 shadow-lg shadow-rose-600/20" 
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm()); }}
          >
            <Plus className="h-4 w-4" />
            إضافة عرض
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-rose-100 bg-rose-50/50 backdrop-blur-sm dark:border-rose-900/50 dark:bg-rose-900/10">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">{editingId ? 'تعديل العرض الترويجي' : 'إضافة عرض ترويجي جديد'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label>الكود</Label>
                <div className="relative">
                  <Tag className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <Input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" className="bg-white pr-9 font-mono uppercase dark:bg-gray-800" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>النوع</Label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as OfferType }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white" required>
                  {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>القيمة (نسبة أو مبلغ)</Label>
                <Input type="number" step="0.01" min="0" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} className="bg-white dark:bg-gray-800" required />
              </div>
              <div className="space-y-2">
                <Label>الحد الأدنى للطلب (اختياري)</Label>
                <Input type="number" min="0" value={form.min_order_amount} onChange={(e) => setForm((p) => ({ ...p, min_order_amount: e.target.value }))} className="bg-white dark:bg-gray-800" />
              </div>
              <div className="space-y-2">
                <Label>الحد الأقصى للخصم (اختياري)</Label>
                <Input type="number" min="0" value={form.max_discount} onChange={(e) => setForm((p) => ({ ...p, max_discount: e.target.value }))} className="bg-white dark:bg-gray-800" />
              </div>
              <div className="space-y-2">
                <Label>صالح من (اختياري)</Label>
                <Input type="datetime-local" value={form.valid_from} onChange={(e) => setForm((p) => ({ ...p, valid_from: e.target.value }))} className="bg-white dark:bg-gray-800" />
              </div>
              <div className="space-y-2">
                <Label>صالح حتى (اختياري)</Label>
                <Input type="datetime-local" value={form.valid_to} onChange={(e) => setForm((p) => ({ ...p, valid_to: e.target.value }))} className="bg-white dark:bg-gray-800" />
              </div>
              <div className="space-y-2">
                <Label>حد الاستخدام (اختياري)</Label>
                <Input type="number" min="0" value={form.usage_limit} onChange={(e) => setForm((p) => ({ ...p, usage_limit: e.target.value }))} className="bg-white dark:bg-gray-800" />
              </div>
              <div className="space-y-2">
                <Label>النطاق</Label>
                <select value={form.scope} onChange={(e) => setForm((p) => ({ ...p, scope: e.target.value as OfferScope }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                  {SCOPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <Label>معرف الخدمة (للنطاق المحدد)</Label>
                <Input type="number" min="0" value={form.entity_id} onChange={(e) => setForm((p) => ({ ...p, entity_id: e.target.value }))} className="bg-white dark:bg-gray-800" placeholder="ID الخدمة" />
              </div>
              <div className="flex items-center pb-2">
                 <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
                  مفعّل ونشط
                </label>
              </div>
              <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
                <Button type="submit" size="sm" className="w-full rounded-xl bg-rose-600 hover:bg-rose-700" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'حفظ' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" size="sm" className="w-full rounded-xl" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm()); }}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">إجمالي العروض</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{offers.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400">
              <Ticket className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">العروض النشطة</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{activeCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
             <div>
               <p className="text-sm font-medium text-gray-500 dark:text-gray-400">نوع الخصم</p>
               <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-semibold">{offers.filter((o: any) => o.type === 'PERCENTAGE').length}</span> نسبة / 
                  <span className="font-semibold"> {offers.filter((o: any) => o.type === 'FIXED').length}</span> ثابت
               </div>
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
            <Tag className="h-5 w-5 text-rose-500" />
            قائمة العروض
          </CardTitle>
          <CardDescription>إدارة وتتبع استخدام كود الخصم</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="py-8 text-center text-red-600 dark:text-red-400">
              فشل تحميل العروض.
            </div>
          )}
          {!isLoading && !error && offers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/20">
                <Ticket className="h-8 w-8 text-rose-300 dark:text-rose-600" />
              </div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">لا توجد عروض ترويجية.</p>
            </div>
          )}
          {!isLoading && offers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100/50 dark:bg-gray-700/40">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">الكود</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">القيمة</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">الصلاحية</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">الاستخدام</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">الحالة</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {offers.map((o: PromoOffer) => (
                    <tr key={o.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <span className="flex h-8 items-center justify-center rounded-md bg-rose-100 px-2 font-mono text-sm font-bold text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                             {o.code}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                           {o.type === 'PERCENTAGE' ? `${Number(o.value)}%` : `${Number(o.value)} ر.س`}
                        </div>
                        <div className="text-xs text-gray-500">{o.type === 'PERCENTAGE' ? 'نسبة' : 'ثابت'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                           <Calendar className="h-3.5 w-3.5 text-gray-400" />
                           {o.valid_to ? format(new Date(o.valid_to), 'PP') : 'مفتوح'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                           <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-200">
                              {o.usage_count} {o.usage_limit ? `/ ${o.usage_limit}` : ''}
                           </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${o.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${o.is_active ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                          {o.is_active ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-900/20 dark:hover:text-rose-400" onClick={() => startEdit(o)} title="تعديل">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20" onClick={() => handleDelete(o.id)} title="حذف">
                            <Trash2 className="h-4 w-4" />
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
