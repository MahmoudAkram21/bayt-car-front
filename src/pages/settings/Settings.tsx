import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Settings, Save, RefreshCw, Globe, Server, Phone, Mail, MapPin, DollarSign } from 'lucide-react';
import { systemSettingsService } from '../../services/systemSettings.service';
import { Toaster, toast } from 'sonner';

export const SettingsPage = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: systemSettingsService.getSettings,
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: systemSettingsService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success('تم تحديث الإعدادات بنجاح');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || 'فشل تحديث الإعدادات');
    },
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    updateMutation.mutate(formData);
  };

  const defaultKeys = [
    { key: 'search_radius_km', label: 'نطاق البحث الافتراضي (كم)', type: 'number', description: 'نطاق البحث عن مقدمي الخدمة حول العميل', icon: MapPin },
    { key: 'commission_percent', label: 'نسبة العمولة الافتراضية (%)', type: 'number', description: 'النسبة المقتطعة من أرباح مقدم الخدمة', icon: DollarSign },
    { key: 'support_phone', label: 'رقم هاتف الدعم', type: 'text', description: 'رقم التواصل الظاهر في التطبيق', icon: Phone },
    { key: 'support_email', label: 'بريد الدعم الإلكتروني', type: 'email', description: 'البريد الإلكتروني للتواصل الظاهر في التطبيق', icon: Mail },
  ];

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <Toaster position="top-center" />
      
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
           <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg text-white">
             <Settings className="h-6 w-6" />
           </div>
           <div>
             <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
               إعدادات النظام
             </h1>
             <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
               تكوين الإعدادات العالمية للتطبيق
             </p>
           </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={updateMutation.isPending} 
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-600/20"
        >
          {updateMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          حفظ التغييرات
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Configuration Card */}
        <Card className="lg:col-span-2 overflow-hidden rounded-2xl border-gray-200 bg-white/60 shadow-lg backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/60">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg text-gray-900 dark:text-white">الإعدادات العامة</CardTitle>
                <CardDescription>إدارة المعاملات الأساسية للمنصة</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
            {defaultKeys.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="space-y-2">
                  <Label htmlFor={item.key} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Icon className="h-4 w-4 text-indigo-500" />
                    {item.label}
                  </Label>
                  <Input
                    id={item.key}
                    type={item.type}
                    value={formData[item.key] || ''}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                    className="rounded-xl border-gray-200 bg-white/50 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700/50"
                  />
                  {item.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.description}</p>
                  )}
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Other Settings Card */}
        <Card className="lg:col-span-1 overflow-hidden rounded-2xl border-gray-200 bg-white/60 shadow-lg backdrop-blur-xl dark:border-gray-700 dark:bg-gray-800/60">
          <CardHeader className="border-b border-gray-100 dark:border-gray-700">
             <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <Server className="h-5 w-5" />
                </div>
                <div>
                   <CardTitle className="text-lg text-gray-900 dark:text-white">إعدادات أخرى</CardTitle>
                   <CardDescription>إعدادات إضافية موجودة في قاعدة البيانات</CardDescription>
                </div>
             </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {Object.entries(formData).map(([key, value]) => {
                // Skip if already shown in default keys
                if (defaultKeys.find(k => k.key === key)) return null;

                return (
                  <div key={key} className="p-4 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                    <Label className="mb-2 block font-mono text-xs font-semibold text-gray-500 uppercase tracking-wider">{key.replace(/_/g, ' ')}</Label>
                    <Input
                      value={value}
                      onChange={(e) => handleChange(key, e.target.value)}
                      className="rounded-lg border-gray-200 bg-white/50 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700/50"
                    />
                  </div>
                );
              })}
              {Object.keys(formData).every(key => defaultKeys.find(k => k.key === key)) && (
                 <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-gray-500 italic">لا توجد إعدادات إضافية.</p>
                 </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
