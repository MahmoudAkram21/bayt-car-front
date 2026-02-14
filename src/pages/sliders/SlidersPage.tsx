import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { slidersService, type Slider, type SliderPlatform } from '../../services/sliders.service';
import { Image, LayoutGrid, Plus, Pencil, Trash2, RefreshCw, CheckCircle2, Smartphone, Monitor } from 'lucide-react';
import { format } from 'date-fns';

const PLATFORM_OPTIONS: { value: SliderPlatform; label: string }[] = [
  { value: 'ALL', label: 'الكل' },
  { value: 'ANDROID', label: 'أندرويد' },
  { value: 'IOS', label: 'آيفون' },
];

const emptyForm = () => ({
  image_url: '',
  title: '',
  description: '',
  action_url: '',
  platform: 'ALL' as SliderPlatform,
  valid_from: '',
  valid_to: '',
  sort_order: '0',
  is_active: true,
});

export const SlidersPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());

  const { data, isLoading, error } = useQuery({
    queryKey: ['sliders'],
    queryFn: () => slidersService.list(),
  });
  const sliders = data?.data ?? [];
  const activeCount = sliders.filter((s: Slider) => s.is_active).length;

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof slidersService.create>[0]) => slidersService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sliders'] });
      setShowForm(false);
      setForm(emptyForm());
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Slider> }) => slidersService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sliders'] });
      setEditingId(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => slidersService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sliders'] }),
  });

  const toPayload = () => ({
    image_url: form.image_url.trim() || undefined,
    title: form.title.trim() || null,
    description: form.description.trim() || null,
    action_url: form.action_url.trim() || null,
    platform: form.platform,
    valid_from: form.valid_from.trim() ? new Date(form.valid_from).toISOString() : null,
    valid_to: form.valid_to.trim() ? new Date(form.valid_to).toISOString() : null,
    sort_order: parseInt(form.sort_order, 10) || 0,
    is_active: form.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url.trim()) return;
    const payload = toPayload() as Partial<Slider> & { image_url: string };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };
  const startEdit = (s: Slider) => {
    setEditingId(s.id);
    setForm({
      image_url: s.image_url,
      title: s.title ?? '',
      description: s.description ?? '',
      action_url: s.action_url ?? '',
      platform: s.platform,
      valid_from: s.valid_from ? s.valid_from.slice(0, 16) : '',
      valid_to: s.valid_to ? s.valid_to.slice(0, 16) : '',
      sort_order: String(s.sort_order),
      is_active: s.is_active,
    });
    setShowForm(true);
  };
  const handleDelete = (id: number) => {
    if (window.confirm('هل تريد حذف السلايدر؟')) deleteMutation.mutate(id);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
           <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg text-white">
             <Image className="h-6 w-6" />
           </div>
           <div>
             <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
               إدارة السلايدر
             </h1>
             <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
               إدارة الصور والعروض الترويجية في التطبيق
             </p>
           </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl gap-2 hover:bg-white/50 hover:text-indigo-600 dark:hover:bg-gray-800/50 dark:hover:text-indigo-400" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['sliders'] })}
          >
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button 
            size="sm" 
            className="rounded-xl bg-indigo-600 gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20" 
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm()); }}
          >
            <Plus className="h-4 w-4" />
            إضافة سلايدر
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="border-indigo-100 bg-indigo-50/50 backdrop-blur-sm dark:border-indigo-900/50 dark:bg-indigo-900/10">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">{editingId ? 'تعديل السلايدر' : 'إضافة سلايدر جديد'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <Label>رابط الصورة (مطلوب)</Label>
                <div className="flex gap-4">
                  <Input value={form.image_url} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} placeholder="https://example.com/image.jpg" className="mt-1 flex-1 bg-white dark:bg-gray-800" required />
                  {form.image_url && (
                    <div className="h-10 w-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                      <img src={form.image_url} alt="Preview" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label>العنوان</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="mt-1 bg-white dark:bg-gray-800" />
              </div>
              <div>
                <Label>المنصة</Label>
                <select value={form.platform} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value as SliderPlatform }))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white">
                  {PLATFORM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label>الوصف</Label>
                <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="mt-1 bg-white dark:bg-gray-800" />
              </div>
              <div className="sm:col-span-2">
                <Label>رابط الإجراء</Label>
                <Input value={form.action_url} onChange={(e) => setForm((p) => ({ ...p, action_url: e.target.value }))} placeholder="https://..." className="mt-1 bg-white dark:bg-gray-800" />
              </div>
              <div>
                <Label>صالح من</Label>
                <Input type="datetime-local" value={form.valid_from} onChange={(e) => setForm((p) => ({ ...p, valid_from: e.target.value }))} className="mt-1 bg-white dark:bg-gray-800" />
              </div>
              <div>
                <Label>صالح حتى</Label>
                <Input type="datetime-local" value={form.valid_to} onChange={(e) => setForm((p) => ({ ...p, valid_to: e.target.value }))} className="mt-1 bg-white dark:bg-gray-800" />
              </div>
              <div>
                <Label>ترتيب العرض</Label>
                <Input type="number" min="0" value={form.sort_order} onChange={(e) => setForm((p) => ({ ...p, sort_order: e.target.value }))} className="mt-1 bg-white dark:bg-gray-800" />
              </div>
              <div className="flex items-center pt-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  <input type="checkbox" checked={form.is_active} onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                  مفعّل ونشط
                </label>
              </div>
              <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
                <Button type="submit" size="sm" className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-700" disabled={createMutation.isPending || updateMutation.isPending}>
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
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">إجمالي السلايدر</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{sliders.length}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-400">
              <LayoutGrid className="h-6 w-6" />
            </div>
          </div>
        </div>
        <div className="group overflow-hidden rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm backdrop-blur-xl transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800/60">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">السلايدر النشط</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{activeCount}</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-gray-200 bg-white/60 shadow-lg backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/60">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Image className="h-5 w-5 text-indigo-500" />
            جميع السلايدر
          </CardTitle>
          <CardDescription>عرض وترتيب الصور في التطبيق</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="py-8 text-center text-red-600 dark:text-red-400">
              فشل تحميل السلايدر.
            </div>
          )}
          {!isLoading && !error && sliders.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 dark:bg-indigo-900/20">
                <Image className="h-8 w-8 text-indigo-300 dark:text-indigo-600" />
              </div>
              <p className="mt-4 text-gray-500 dark:text-gray-400">لا يوجد سلايدر بعد.</p>
            </div>
          )}
          {!isLoading && sliders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100/50 dark:bg-gray-700/40">
                  <tr>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">معاينة</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">العنوان</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">المنصة</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">الصلاحية</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">الترتيب</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">الحالة</th>
                    <th className="px-6 py-3 text-start text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sliders.map((s: Slider) => (
                    <tr key={s.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <td className="px-6 py-4">
                        <div className="h-12 w-20 overflow-hidden rounded-lg border border-gray-200 shadow-sm dark:border-gray-700">
                           <img src={s.image_url} alt={s.title ?? ''} className="h-full w-full object-cover transition-transform hover:scale-110" onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).className = 'h-full w-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center'; }} />
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{s.title ?? '—'}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                           {s.platform === 'ANDROID' && <Smartphone className="h-4 w-4" />}
                           {s.platform === 'IOS' && <Smartphone className="h-4 w-4" />}
                           {s.platform === 'ALL' && <Monitor className="h-4 w-4" />}
                           {s.platform}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex flex-col gap-0.5">
                           <span>{s.valid_from ? format(new Date(s.valid_from), 'PP') : '—'}</span>
                           <span className="text-xs text-gray-400">إلى</span>
                           <span>{s.valid_to ? format(new Date(s.valid_to), 'PP') : '—'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-mono">{s.sort_order}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                           <span className={`h-1.5 w-1.5 rounded-full ${s.is_active ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                           {s.is_active ? 'نشط' : 'معطل'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/20 dark:hover:text-indigo-400" onClick={() => startEdit(s)} title="تعديل">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 text-red-500 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20" onClick={() => handleDelete(s.id)} title="حذف">
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
