import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { bannerService, type Banner, type BannerType, type CreateBannerData, type UpdateBannerData, type SliderPlatform } from '../../services/banner.service';
import { serviceService } from '../../services/service.service';
import { 
  Plus, Pencil, Trash2, RefreshCw, ExternalLink, Upload, X, 
  LayoutGrid, Smartphone, Apple, Monitor, Calendar, Hash
} from 'lucide-react';
import { toast } from 'sonner';
import type { MultilingualText } from '../../types';

const emptyForm = () => ({
  type: 'AD' as BannerType,
  title: '',
  description: '',
  link: '',
  service_id: '',
  platform: 'ALL' as SliderPlatform,
  valid_from: '',
  valid_to: '',
  sort_order: 0,
  is_active: true,
});

export const BannersPage = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: bannersData, isLoading: bannersLoading } = useQuery({
    queryKey: ['banners'],
    queryFn: () => bannerService.getBanners(),
  });
  const banners = bannersData?.data ?? [];

  const { data: servicesData } = useQuery({
    queryKey: ['services-all'],
    queryFn: () => serviceService.getAllServices({ limit: 1000 }),
  });
  const services = servicesData?.data ?? [];

  const isBannerValid = (b: Banner) => {
    if (!b.is_active) return false;
    const now = new Date();
    if (b.valid_from && new Date(b.valid_from) > now) return false;
    if (b.valid_to && new Date(b.valid_to) < now) return false;
    return true;
  };

  const activeBannersCount = banners.filter(isBannerValid).length;

  const createMutation = useMutation({
    mutationFn: (payload: CreateBannerData) => bannerService.createBanner(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success(t('common.bannerCreated'));
      resetForm();
    },
    onError: (error: Error) => toast.error(error.message || 'Error creating banner'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBannerData }) => bannerService.updateBanner(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success(t('common.bannerUpdated'));
      resetForm();
    },
    onError: (error: Error) => toast.error(error.message || 'Error updating banner'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => bannerService.deleteBanner(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      toast.success(t('common.bannerDeleted'));
    },
    onError: (error: Error) => toast.error(error.message || 'Error deleting banner'),
  });

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm());
    setSelectedFile(null);
    if (previewUrl && !previewUrl.startsWith('/uploads')) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const sanitizedForm = { ...form };
    if (sanitizedForm.type === 'AD' && sanitizedForm.link) {
      // Remove leading slashes from links if they were entered incorrectly
      sanitizedForm.link = sanitizedForm.link.replace(/^\/+/, '');
      // Ensure it starts with http if it's a domain
      if (!/^https?:\/\//i.test(sanitizedForm.link) && sanitizedForm.link.includes('.')) {
        sanitizedForm.link = 'https://' + sanitizedForm.link;
      }
    }

    const payload: UpdateBannerData & { banner_image: File } = {
      ...sanitizedForm,
      banner_image: selectedFile as File,
      sort_order: sanitizedForm.sort_order || 0
    };

    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      if (!selectedFile) {
        toast.error(t('common.bannerImageRequired'));
        return;
      }
      createMutation.mutate(payload);
    }
  };

  const startEdit = (b: Banner) => {
    setEditingId(b.id);
    setForm({
      type: b.type,
      title: b.title || '',
      description: b.description || '',
      link: b.link || '',
      service_id: b.service_id || '',
      platform: b.platform,
      valid_from: b.valid_from ? new Date(b.valid_from).toISOString().split('T')[0] : '',
      valid_to: b.valid_to ? new Date(b.valid_to).toISOString().split('T')[0] : '',
      sort_order: b.sort_order,
      is_active: b.is_active,
    });
    setPreviewUrl(b.image_url);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    // Check if confirming is possible
    const message = t('common.confirmDelete', { name: 'Banner' }) || 'هل أنت متأكد من حذف هذا البانر؟';
    if (window.confirm(message)) {
      deleteMutation.mutate(id);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('blob:')) return url;
    
    // Fallback to localhost if VITE_API_URL is not defined
    const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const baseUrl = backendUrl.replace(/\/$/, '').replace(/\/api$/, '');
    
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return baseUrl + cleanUrl;
  };

  const getBannerStatus = (b: Banner) => {
    if (!b.is_active) return { label: 'متوقف حالياً', color: 'bg-gray-400', shadow: '' };
    const now = new Date();
    if (b.valid_to && new Date(b.valid_to) < now) return { label: 'منتهي الصلاحية', color: 'bg-amber-500', shadow: 'shadow-[0_0_8px_rgba(245,158,11,0.6)]' };
    if (b.valid_from && new Date(b.valid_from) > now) return { label: 'مجدول لاحقاً', color: 'bg-blue-500', shadow: 'shadow-[0_0_8px_rgba(59,130,246,0.6)]' };
    return { label: 'نشط ويظهر للمستخدمين', color: 'bg-emerald-500', shadow: 'shadow-[0_0_8px_rgba(16,185,129,0.6)]' };
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg text-white">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              {t('common.banners')}
            </h1>
            <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
               إدارة الإعلانات، اللافتات، والعروض الترويجية في مكان واحد
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="rounded-xl gap-2" 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['banners'] })}
          >
            <RefreshCw className="h-4 w-4" />
            {t('common.refresh')}
          </Button>
          <Button 
            size="sm" 
            className="rounded-xl bg-indigo-600 gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-600/20" 
            onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm()); setPreviewUrl(null); setSelectedFile(null); }}
          >
            <Plus className="h-4 w-4" />
            {t('common.addBanner')}
          </Button>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'إجمالي البانرات', value: banners.length, icon: Hash, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'البانرات النشطة', value: activeBannersCount, icon: RefreshCw, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'متوفر للأندرويد', value: banners.filter(b => b.platform !== 'IOS').length, icon: Smartphone, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'متوفر للأيفون', value: banners.filter(b => b.platform !== 'ANDROID').length, icon: Apple, color: 'text-gray-600', bg: 'bg-gray-100' },
        ].map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {showForm && (
        <Card className="border-indigo-100 bg-indigo-50/50 backdrop-blur-sm dark:border-indigo-900/50 dark:bg-indigo-900/10 shadow-xl overflow-hidden ring-1 ring-indigo-500/20">
          <CardHeader className="bg-indigo-50/50 dark:bg-indigo-900/20">
            <CardTitle className="text-lg flex items-center gap-2">
              {editingId ? <Pencil className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
              {editingId ? t('common.editBanner') : t('common.addBanner')}
            </CardTitle>
            <CardDescription>أدخل تفاصيل البانر ليظهر للمستخدمين في التطبيق</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="grid gap-8 md:grid-cols-2">
              {/* Image Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    {t('common.bannerImage')}
                  </Label>
                  <div className="flex flex-col items-center gap-4">
                    {previewUrl ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded-xl border-2 border-indigo-200 bg-white shadow-inner dark:border-indigo-900 dark:bg-gray-800 group">
                        <img src={getImageUrl(previewUrl)} alt="Preview" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <button type="button" onClick={() => { setPreviewUrl(null); setSelectedFile(null); }} className="rounded-full bg-white/20 p-2 text-white hover:bg-white/40 backdrop-blur-md">
                            <X className="h-6 w-6" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex aspect-video w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-indigo-300 bg-white hover:bg-indigo-50 dark:border-indigo-900 dark:bg-gray-800 dark:hover:bg-indigo-900/20 transition-colors">
                        <Upload className="mb-2 h-8 w-8 text-indigo-400" />
                        <span className="text-sm font-medium text-indigo-600">{t('common.clickToUpload')}</span>
                        <p className="text-xs text-gray-500 mt-1">اضغط هنا لاختيار صورة (21:9)</p>
                        <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                      </label>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1.5 opacity-70">
                      <Hash className="h-3.5 w-3.5" />
                      {t('common.sortOrder')}
                    </Label>
                    <Input 
                      type="number" 
                      value={form.sort_order} 
                      onChange={(e) => {
                        const val = parseInt(e.target.value, 10);
                        setForm(p => ({ ...p, sort_order: isNaN(val) ? 0 : val }));
                      }} 
                      className="focus:ring-indigo-500" 
                    />
                  </div>
                  <div className="flex items-end pb-2">
                     <label className="flex items-center gap-2 cursor-pointer select-none">
                        <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                           <input type="checkbox" checked={form.is_active} onChange={(e) => setForm(p => ({ ...p, is_active: e.target.checked }))} className="sr-only" />
                           <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${form.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                        </div>
                        <span className="text-sm font-semibold">{t('common.isActive')}</span>
                     </label>
                  </div>
                </div>
              </div>

              {/* Details Column */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>نوع البانر</Label>
                  <select value={form.type} onChange={(e) => setForm(p => ({ ...p, type: e.target.value as BannerType }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 outline-none">
                    <option value="AD">{t('common.ad')} (رابط خارجي)</option>
                    <option value="SERVICE">{t('common.servicePromo')} (خدمة داخلية)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>العنوان (اختياري)</Label>
                  <Input value={form.title} onChange={(e) => setForm(p => ({ ...p, title: e.target.value }))} placeholder="أدخل عنواناً جذاباً" />
                </div>

                <div className="space-y-2">
                  <Label>الوصف (اختياري)</Label>
                  <textarea value={form.description} onChange={(e) => setForm(p => ({ ...p, description: e.target.value }))} placeholder="أدخل تفاصيل إضافية عن العرض" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 outline-none min-h-[80px]" />
                </div>

                {form.type === 'AD' ? (
                  <div className="space-y-2">
                    <Label>{t('common.link')}</Label>
                    <div className="relative">
                      <ExternalLink className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <Input value={form.link} onChange={(e) => setForm(p => ({ ...p, link: e.target.value }))} placeholder="https://..." className="pl-9" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>{t('common.selectService')}</Label>
                    <select value={form.service_id} onChange={(e) => setForm(p => ({ ...p, service_id: e.target.value }))} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 outline-none">
                      <option value="">{t('common.selectService')}</option>
                      {services.map(s => (
                        <option key={s.id} value={s.id}>
                          {typeof s.name === 'object' ? (i18n.language === 'ar' ? (s.name as MultilingualText).ar : (s.name as MultilingualText).en) : s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>المنصة المستهدفة</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'ALL', label: 'الكل', icon: Monitor },
                      { value: 'ANDROID', label: 'أندرويد', icon: Smartphone },
                      { value: 'IOS', label: 'أيفون', icon: Apple },
                    ].map(p => (
                      <button 
                        key={p.value} 
                        type="button" 
                        onClick={() => setForm(f => ({ ...f, platform: p.value as SliderPlatform }))}
                        className={`flex flex-col items-center gap-1 p-2 rounded-lg border transition-all ${form.platform === p.value ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-gray-200 hover:border-indigo-300'}`}
                      >
                        <p.icon className="h-4 w-4" />
                        <span className="text-xs font-medium">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1 opacity-70">
                      <Calendar className="h-3 w-3" />
                      تاريخ البدء
                    </Label>
                    <Input type="date" value={form.valid_from} onChange={(e) => setForm(p => ({ ...p, valid_from: e.target.value }))} className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1 opacity-70">
                      <Calendar className="h-3 w-3" />
                      تاريخ الانتهاء
                    </Label>
                    <Input type="date" value={form.valid_to} onChange={(e) => setForm(p => ({ ...p, valid_to: e.target.value }))} className="h-8 text-xs" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t mt-6">
                  <Button type="submit" className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 h-10 shadow-lg shadow-indigo-600/20" disabled={createMutation.isPending || updateMutation.isPending}>
                    {editingId ? t('common.save') : t('common.addBanner')}
                  </Button>
                  <Button type="button" variant="outline" className="flex-1 rounded-xl h-10" onClick={resetForm}>
                    {t('common.cancel')}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {bannersLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse h-[300px]">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
              <CardHeader className="space-y-2">
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-3 w-3/4 bg-gray-100 dark:bg-gray-800 rounded" />
              </CardHeader>
            </Card>
          ))
        ) : banners.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
            <div className="mb-4 rounded-full bg-indigo-50 p-6 dark:bg-indigo-900/20 animate-bounce">
              <LayoutGrid className="h-12 w-12 text-indigo-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">لا توجد إعلانات نشطة</h3>
            <p className="text-gray-500 max-w-xs mx-auto mt-2">قم بإضافة عروض ترويجية لتظهر للمستخدمين في الصفحة الرئيسية للتطبيق</p>
            <Button className="mt-6 rounded-xl bg-indigo-600" onClick={() => setShowForm(true)}>إضافة بانر جديد</Button>
          </div>
        ) : (
          banners.map((b) => (
            <Card key={b.id} className={`group overflow-hidden border-gray-200 bg-white/60 shadow-lg backdrop-blur-xl transition-all hover:shadow-xl dark:border-gray-700 dark:bg-gray-800/60 relative ${!b.is_active && 'grayscale opacity-70'}`}>
              <div className="relative aspect-video w-full overflow-hidden">
                <img src={getImageUrl(b.image_url)} alt="Banner" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {/* Actions Overlay */}
                <div className="absolute top-3 right-3 flex gap-2 translate-y-[-10px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 scale-95 group-hover:scale-100">
                  <Button size="icon" variant="secondary" className="h-9 w-9 rounded-xl bg-white/90 hover:bg-white shadow-xl backdrop-blur" onClick={() => startEdit(b)}>
                    <Pencil className="h-4 w-4 text-indigo-600" />
                  </Button>
                  <Button size="icon" variant="destructive" className="h-9 w-9 rounded-xl shadow-xl hover:bg-red-600" onClick={() => handleDelete(b.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Platform & Sort Badge */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                   <div className="flex gap-1.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/40 text-white backdrop-blur-md border border-white/20">
                         {b.platform === 'ALL' && <Monitor className="h-3.5 w-3.5" />}
                         {b.platform === 'ANDROID' && <Smartphone className="h-3.5 w-3.5" />}
                         {b.platform === 'IOS' && <Apple className="h-3.5 w-3.5" />}
                      </div>
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600/60 text-white backdrop-blur-md border border-white/20" title={t('common.sortOrder')}>
                         <span className="text-[10px] font-bold">{b.sort_order}</span>
                      </div>
                   </div>
                   <div className={`h-7 px-2 flex items-center justify-center rounded-lg backdrop-blur-md border border-white/20 text-[10px] font-bold text-white ${b.type === 'AD' ? 'bg-indigo-600/60' : 'bg-emerald-600/60'}`}>
                      {b.type === 'AD' ? 'إعلان خارجي' : 'خدمة داخلية'}
                   </div>
                </div>

                {/* Content Overlay */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                   <h3 className="font-bold text-lg line-clamp-1 group-hover:text-indigo-300 transition-colors">
                    {b.title || (b.type === 'AD' ? b.link : b.service?.name)}
                   </h3>
                   {b.description && <p className="text-xs text-gray-300 line-clamp-1 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">{b.description}</p>}
                </div>
              </div>

              <CardHeader className="p-4 space-y-3">
                <div className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-1.5 text-gray-500">
                     <Calendar className="h-3.5 w-3.5" />
                     {b.valid_from || b.valid_to ? (
                        <span>
                          {b.valid_from ? new Date(b.valid_from).toLocaleDateString('ar-EG') : '...'} - {b.valid_to ? new Date(b.valid_to).toLocaleDateString('ar-EG') : '...'}
                        </span>
                     ) : 'متاح دائماً'}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                   {/* Combined status check */}
                   {(() => {
                     const status = getBannerStatus(b);
                     return (
                       <>
                         <div className={`h-2.5 w-2.5 rounded-full ${status.color} ${status.shadow}`} />
                         <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                           {status.label}
                         </span>
                       </>
                     );
                   })()}
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
