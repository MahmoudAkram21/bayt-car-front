import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { splashService, type SplashScreen, type SplashPlatform } from '../../services/splash.service';
import { Image, Monitor, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';

const PLATFORM_OPTIONS: { value: SplashPlatform; label: string }[] = [
  { value: 'ALL', label: 'الكل' },
  { value: 'ANDROID', label: 'أندرويد' },
  { value: 'IOS', label: 'آيفون' },
];

const emptyForm = () => ({
  image_url: '',
  title: '',
  description: '',
  action_url: '',
  platform: 'ALL' as SplashPlatform,
  valid_from: '',
  valid_to: '',
  is_active: true,
});

export const SplashPage = () => {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());

  const { data, isLoading, error } = useQuery({
    queryKey: ['splash'],
    queryFn: () => splashService.list(),
  });
  const list = data?.data ?? [];
  const activeCount = list.filter((s: SplashScreen) => s.is_active).length;

  const createMutation = useMutation({
    mutationFn: (payload: Parameters<typeof splashService.create>[0]) => splashService.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['splash'] });
      setShowForm(false);
      setForm(emptyForm());
    },
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<SplashScreen> }) => splashService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['splash'] });
      setEditingId(null);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: (id: number) => splashService.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['splash'] }),
  });

  const toPayload = () => ({
    image_url: form.image_url.trim() || undefined,
    title: form.title.trim() || null,
    description: form.description.trim() || null,
    action_url: form.action_url.trim() || null,
    platform: form.platform,
    valid_from: form.valid_from.trim() ? new Date(form.valid_from).toISOString() : null,
    valid_to: form.valid_to.trim() ? new Date(form.valid_to).toISOString() : null,
    is_active: form.is_active,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url.trim()) return;
    const payload = toPayload() as Partial<SplashScreen> & { image_url: string };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };
  const startEdit = (s: SplashScreen) => {
    setEditingId(s.id);
    setForm({
      image_url: s.image_url,
      title: s.title ?? '',
      description: s.description ?? '',
      action_url: s.action_url ?? '',
      platform: s.platform,
      valid_from: s.valid_from ? s.valid_from.slice(0, 16) : '',
      valid_to: s.valid_to ? s.valid_to.slice(0, 16) : '',
      is_active: s.is_active,
    });
    setShowForm(true);
  };
  const handleDelete = (id: number) => {
    if (window.confirm('هل تريد حذف شاشة السبلاش؟')) deleteMutation.mutate(id);
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            شاشات السبلاش
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            شاشات البداية لتطبيق الموبايل. صورة، عنوان، وصف، إجراء. المنصة وفترة الصلاحية.
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" className="rounded-xl gap-2" onClick={() => queryClient.invalidateQueries({ queryKey: ['splash'] })}>
            <RefreshCw className="h-4 w-4" />
            تحديث
          </Button>
          <Button size="sm" className="rounded-xl bg-cyan-600 gap-2 hover:bg-cyan-700" onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm()); }}>
            <Plus className="h-4 w-4" />
            إضافة سبلاش
          </Button>
        </div>
      </div>

      {showForm && (
        <Card className="mb-6 rounded-2xl border-cyan-200 dark:border-cyan-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-gray-900 dark:text-white">{editingId ? 'تعديل شاشة السبلاش' : 'إضافة شاشة سبلاش جديدة'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="sm:col-span-2">
                <Label>رابط الصورة (مطلوب)</Label>
                <Input value={form.image_url} onChange={(e) => setForm((p) => ({ ...p, image_url: e.target.value }))} placeholder="https://..." className="mt-1 rounded-lg" required />
              </div>
              <div>
                <Label>العنوان</Label>
                <Input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} className="mt-1 rounded-lg" />
              </div>
              <div>
                <Label>المنصة</Label>
                <select value={form.platform} onChange={(e) => setForm((p) => ({ ...p, platform: e.target.value as SplashPlatform }))} className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                  {PLATFORM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <Label>الوصف</Label>
                <Input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} className="mt-1 rounded-lg" />
              </div>
              <div className="sm:col-span-2">
                <Label>رابط الإجراء</Label>
                <Input value={form.action_url} onChange={(e) => setForm((p) => ({ ...p, action_url: e.target.value }))} placeholder="https://..." className="mt-1 rounded-lg" />
              </div>
              <div>
                <Label>صالح من</Label>
                <Input type="datetime-local" value={form.valid_from} onChange={(e) => setForm((p) => ({ ...p, valid_from: e.target.value }))} className="mt-1 rounded-lg" />
              </div>
              <div>
                <Label>صالح حتى</Label>
                <Input type="datetime-local" value={form.valid_to} onChange={(e) => setForm((p) => ({ ...p, valid_to: e.target.value }))} className="mt-1 rounded-lg" />
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
        <div className="overflow-hidden rounded-2xl border border-cyan-200 bg-cyan-50 shadow-sm dark:border-cyan-800 dark:bg-cyan-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">إجمالي السبلاش</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{list.length}</p>
            </div>
            <Monitor className="h-10 w-10 text-cyan-600 dark:text-cyan-400" />
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/20">
          <div className="flex items-center justify-between p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">النشطة</p>
              <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">{activeCount}</p>
            </div>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-gray-200 shadow-lg dark:border-gray-700 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <Image className="h-5 w-5 text-cyan-500" />
            جميع شاشات السبلاش
          </CardTitle>
          <CardDescription>الصورة، العنوان، المنصة، فترة الصلاحية</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
            </div>
          )}
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 py-8 text-center text-red-600 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              فشل تحميل شاشات السبلاش.
            </div>
          )}
          {!isLoading && !error && list.length === 0 && (
            <div className="py-12 text-center text-gray-500 dark:text-gray-400">لا توجد شاشات سبلاش بعد. استخدم &quot;إضافة سبلاش&quot; أعلاه.</div>
          )}
          {!isLoading && list.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">معاينة</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">العنوان</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">المنصة</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">صالح حتى</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">الحالة</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {list.map((s: SplashScreen) => (
                    <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="px-6 py-4">
                        <img src={s.image_url} alt={s.title ?? ''} className="h-12 w-20 rounded object-cover" onError={(e) => { (e.target as HTMLImageElement).src = ''; (e.target as HTMLImageElement).className = 'h-12 w-20 rounded bg-gray-200 dark:bg-gray-600'; }} />
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{s.title ?? '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{s.platform}</td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{s.valid_to ? format(new Date(s.valid_to), 'PP') : '—'}</td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${s.is_active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`}>
                          {s.is_active ? 'نشط' : 'غير نشط'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0" onClick={() => startEdit(s)} title="تعديل">
                          <Pencil className="h-4 w-4 text-cyan-600" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(s.id)} title="حذف">
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
