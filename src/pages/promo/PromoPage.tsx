import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { promoService, type PromoOffer, type OfferType, type OfferScope } from '../../services/promo.service';
import { Tag, Percent, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
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
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            العروض الترويجية
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            أكواد الخصم: نسبة أو مبلغ ثابت، صلاحية، حد الاستخدام. نطاق: الكل أو خدمة محددة.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => queryClient.invalidateQueries({ queryKey: ['promo-offers'] })}>
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button size="sm" className="rounded-xl bg-rose-600 gap-2 hover:bg-rose-700" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm()); }}>
            <Plus className="h-4 w-4" />
            إضافة عرض
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6 rounded-2xl border-rose-200 dark:border-rose-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 dark:text-white">{editingId ? 'تعديل العرض الترويجي' : 'إضافة عرض ترويجي جديد'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <Label>الكود</Label>
                <Input value={form.code} onChange={(e) => setForm((p) => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="SUMMER20" className="mt-1 rounded-lg font-mono" required />
              </div>
              <div>
                <Label>النوع</Label>
                <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as OfferType }))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" required>
                  {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <Label>القيمة (نسبة أو مبلغ)</Label>
                <Input type="number" step="0.01" min="0" value={form.value} onChange={(e) => setForm((p) => ({ ...p, value: e.target.value }))} className="mt-1 rounded-lg" required />
              </div>
              <div>
                <Label>الحد الأدنى للطلب (اختياري)</Label>
                <Input type="number" min="0" value={form.min_order_amount} onChange={(e) => setForm((p) => ({ ...p, min_order_amount: e.target.value }))} className="mt-1 rounded-lg" />
              </div>
              <div>
                <Label>الحد الأقصى للخصم (اختياري)</Label>
                <Input type="number" min="0" value={form.max_discount} onChange={(e) => setForm((p) => ({ ...p, max_discount: e.target.value }))} className="mt-1 rounded-lg" />
              </div>
              <div>
                <Label>صالح من (اختياري)</Label>
                <Input type="datetime-local" value={form.valid_from} onChange={(e) => setForm((p) => ({ ...p, valid_from: e.target.value }))} className="mt-1 rounded-lg" />
              </div>
              <div>
                <Label>صالح حتى (اختياري)</Label>
                <Input type="datetime-local" value={form.valid_to} onChange={(e) => setForm((p) => ({ ...p, valid_to: e.target.value }))} className="mt-1 rounded-lg" />
              </div>
              <div>
                <Label>حد الاستخدام (اختياري)</Label>
                <Input type="number" min="0" value={form.usage_limit} onChange={(e) => setForm((p) => ({ ...p, usage_limit: e.target.value }))} className="mt-1 rounded-lg" />
              </div>
              <div>
                <Label>النطاق</Label>
                <select value={form.scope} onChange={(e) => setForm((p) => ({ ...p, scope: e.target.value as OfferScope }))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  {SCOPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <Label>معرف الخدمة (إن كان النطاق خدمة محددة)</Label>
                <Input type="number" min="0" value={form.entity_id} onChange={(e) => setForm((p) => ({ ...p, entity_id: e.target.value }))} className="mt-1 rounded-lg" />
              </div>
              <div className="flex items-end gap-2">
                <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="rounded border-gray-300" />
                  مفعّل
                </label>
              </div>
              <div className="flex items-end gap-2 sm:col-span-2">
                <Button type="submit" size="sm" className="rounded-lg" disabled={createMutation.isPending || updateMutation.isPending}>
                  {editingId ? 'حفظ التعديل' : 'إضافة'}
                </Button>
                <Button type="button" variant="outline" size="sm" className="rounded-lg" onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm()); }}>
                  إلغاء
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-rose-200 bg-rose-50 shadow-sm dark:border-rose-800 dark:bg-rose-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">إجمالي العروض</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{offers.length}</p>
            </div>
            <Tag className="h-10 w-10 text-rose-600 dark:text-rose-400" />
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">النشطة</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
            </div>
            <Percent className="h-10 w-10 text-emerald-600 dark:text-emerald-400" />
          </div>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Tag className="h-5 w-5 text-rose-500" />
            جميع العروض
          </CardTitle>
          <CardDescription>الكود، النوع، القيمة، الصلاحية، الاستخدام</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              فشل تحميل العروض.
            </div>
          )}
          {!isLoading && !error && offers.length === 0 && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">لا توجد عروض بعد. استخدم &quot;إضافة عرض&quot; أعلاه.</div>
          )}
          {!isLoading && offers.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">الكود</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">النوع</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">القيمة</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">صالح حتى</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">الاستخدام</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">الحالة</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {offers.map((o: PromoOffer) => (
                    <tr key={o.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-6 py-4 font-mono text-sm font-medium text-gray-900 dark:text-white">{o.code}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{o.type === 'PERCENTAGE' ? 'نسبة' : 'ثابت'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">{o.type === 'PERCENTAGE' ? `${Number(o.value)}%` : Number(o.value)}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{o.valid_to ? format(new Date(o.valid_to), 'PP') : '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900 dark:text-white">{o.usage_count}{o.usage_limit != null ? ` / ${o.usage_limit}` : ''}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${o.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {o.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={() => startEdit(o)} title="تعديل">
                          <Pencil className="h-4 w-4 text-rose-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(o.id)} title="حذف">
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
