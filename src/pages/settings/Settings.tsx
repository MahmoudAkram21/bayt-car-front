import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Label } from '../../components/ui/label';
import { Settings, Save, RefreshCw, Globe, Server, Phone, Mail, MapPin, DollarSign, MessageSquare, Clock, Gift } from 'lucide-react';
import { systemSettingsService } from '../../services/systemSettings.service';
import { Toaster, toast } from 'sonner';
import { useRolePermissions } from '../../hooks/useRolePermissions';

export const SettingsPage = () => {
  const { t } = useTranslation();
  const { can } = useRolePermissions();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const canUpdateSettings = can('SETTINGS', 'UPDATE');

  const { data: settings, isLoading } = useQuery({
    queryKey: ['system-settings'],
    queryFn: systemSettingsService.getSettings,
  });

  useEffect(() => {
    if (settings) {
      const validRefundType =
        settings.cancellation_refund_type === 'FULL_REFUND' ||
        settings.cancellation_refund_type === 'REFUND_WITH_COMMISSION';
      const validDiscountMode =
        settings.discount_mode === 'DISABLED' || settings.discount_mode === 'PROVIDER';
      setFormData({
        ...settings,
        cancellation_refund_type: validRefundType ? settings.cancellation_refund_type : 'FULL_REFUND',
        discount_mode: validDiscountMode ? settings.discount_mode : 'PROVIDER',
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: systemSettingsService.updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-settings'] });
      toast.success(t('settingsPage.saveSuccess'));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || t('settingsPage.saveError'));
    },
  });

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (!canUpdateSettings) return;
    updateMutation.mutate(formData);
  };

  const defaultKeys = [
    { key: 'welcome_message_ar', labelKey: 'settingsPage.welcomeMessageAr', descriptionKey: 'settingsPage.welcomeMessageArDesc', type: 'text', icon: MessageSquare },
    { key: 'welcome_message_en', labelKey: 'settingsPage.welcomeMessageEn', descriptionKey: 'settingsPage.welcomeMessageEnDesc', type: 'text', icon: MessageSquare },
    { key: 'search_radius_km', labelKey: 'settingsPage.searchRadiusKm', descriptionKey: 'settingsPage.searchRadiusKmDesc', type: 'number', icon: MapPin },
    { key: 'commission_percent', labelKey: 'settingsPage.commissionPercent', descriptionKey: 'settingsPage.commissionPercentDesc', type: 'number', icon: DollarSign },
    { key: 'loyalty_points_multiplier', labelKey: 'settingsPage.loyaltyPointsMultiplier', descriptionKey: 'settingsPage.loyaltyPointsMultiplierDesc', type: 'number', icon: Gift },
    { key: 'loyalty_points_expiry_days', labelKey: 'settingsPage.loyaltyPointsExpiryDays', descriptionKey: 'settingsPage.loyaltyPointsExpiryDaysDesc', type: 'number', icon: Clock },
    { key: 'PAYMENT_TIMEOUT_MINUTES', labelKey: 'settingsPage.paymentTimeoutMinutes', descriptionKey: 'settingsPage.paymentTimeoutMinutesDesc', type: 'number', icon: Clock },
    { key: 'cancellation_refund_type', labelKey: 'common.settingsCancellationRefundTypeLabel', descriptionKey: 'common.settingsCancellationRefundTypeDesc', type: 'select', icon: RefreshCw, options: ['FULL_REFUND', 'REFUND_WITH_COMMISSION'] },
    { key: 'discount_mode', labelKey: 'settingsPage.discountMode', descriptionKey: 'settingsPage.discountModeDesc', type: 'select', icon: DollarSign, options: ['DISABLED', 'PROVIDER'] },
    { key: 'support_phone', labelKey: 'settingsPage.supportPhone', descriptionKey: 'settingsPage.supportPhoneDesc', type: 'text', icon: Phone },
    { key: 'support_email', labelKey: 'settingsPage.supportEmail', descriptionKey: 'settingsPage.supportEmailDesc', type: 'email', icon: Mail },
    { key: 'service_icon_shape', labelKey: 'settingsPage.serviceIconShape', descriptionKey: 'settingsPage.serviceIconShapeDesc', type: 'select', icon: Globe, options: ['circle', 'square', 'rounded'] },
    { key: 'service_display_color', labelKey: 'settingsPage.serviceDisplayColor', descriptionKey: 'settingsPage.serviceDisplayColorDesc', type: 'color', icon: Globe },
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
               {t('settingsPage.pageTitle')}
             </h1>
             <p className="mt-1 text-base text-gray-600 dark:text-gray-400">
               {t('settingsPage.pageSubtitle')}
             </p>
           </div>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!canUpdateSettings || updateMutation.isPending} 
          className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shadow-lg shadow-indigo-600/20"
        >
          {updateMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {t('settingsPage.saveChanges')}
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
                <CardTitle className="text-lg text-gray-900 dark:text-white">{t('settingsPage.generalTitle')}</CardTitle>
                <CardDescription>{t('settingsPage.generalDesc')}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 p-6 sm:grid-cols-2">
            {defaultKeys.map((item) => {
              const Icon = item.icon;
              
              // Render color picker for color type
              if (item.type === 'color') {
                const label = 'labelKey' in item && item.labelKey ? t(item.labelKey) : (item as { label?: string }).label;
                const description = 'descriptionKey' in item && item.descriptionKey ? t(item.descriptionKey) : (item as { description?: string }).description;
                return (
                  <div key={item.key} className="space-y-2">
                    <Label htmlFor={item.key} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Icon className="h-4 w-4 text-indigo-500" />
                      {label}
                    </Label>
                    <div className="flex gap-3 items-center">
                      <input
                        id={item.key}
                        type="color"
                        value={formData[item.key] || '#0d9488'}
                        onChange={(e) => handleChange(item.key, e.target.value)}
                        disabled={!canUpdateSettings}
                        className="h-10 w-16 rounded-lg border-2 border-gray-200 cursor-pointer dark:border-gray-600 transition-colors hover:border-indigo-400"
                        title={String(label ?? '')}
                      />
                      <Input
                        value={formData[item.key] || ''}
                        onChange={(e) => handleChange(item.key, e.target.value)}
                        disabled={!canUpdateSettings}
                        placeholder="#0d9488"
                        className="flex-1 rounded-xl border-gray-200 bg-white/50 font-mono text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700/50"
                      />
                    </div>
                    {description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                    )}
                  </div>
                );
              }
              
              // Render dropdown for select type
              if (item.type === 'select') {
                const label = 'labelKey' in item && item.labelKey ? t(item.labelKey) : (item as { label?: string }).label;
                const description = 'descriptionKey' in item && item.descriptionKey ? t(item.descriptionKey) : (item as { description?: string }).description;
                const placeholder =
                  item.key === 'cancellation_refund_type'
                    ? t('common.settingsRefundTypePlaceholder')
                    : item.key === 'discount_mode'
                      ? t('settingsPage.discountMode')
                      : t('settingsPage.iconShapePlaceholder');
                const optionLabel =
                  item.key === 'cancellation_refund_type'
                    ? (opt: string) =>
                        opt === 'FULL_REFUND' ? t('common.settingsRefundTypeFull') : t('common.settingsRefundTypeWithCommission')
                    : item.key === 'discount_mode'
                      ? (opt: string) =>
                          opt === 'DISABLED' ? t('settingsPage.discountModeDisabled') : t('settingsPage.discountModeProvider')
                      : (opt: string) =>
                          opt === 'circle' ? t('settingsPage.iconShapeCircle') : opt === 'square' ? t('settingsPage.iconShapeSquare') : t('settingsPage.iconShapeRounded');
                return (
                  <div key={item.key} className="space-y-2">
                    <Label htmlFor={item.key} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <Icon className="h-4 w-4 text-indigo-500" />
                      {label}
                    </Label>
                    <select
                      id={item.key}
                      value={formData[item.key] || ''}
                      onChange={(e) => handleChange(item.key, e.target.value)}
                      disabled={!canUpdateSettings}
                      className="w-full rounded-xl border-2 border-gray-200 bg-white/50 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-indigo-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 dark:border-gray-600 dark:bg-gray-700/50 dark:text-gray-300"
                    >
                      <option value="">-- {placeholder} --</option>
                      {item.options?.map((option: string) => (
                        <option key={option} value={option}>
                          {optionLabel(option)}
                        </option>
                      ))}
                    </select>
                    {description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
                    )}
                  </div>
                );
              }
              
              // Render standard input for other types
              const label = 'labelKey' in item && item.labelKey ? t(item.labelKey) : (item as { label?: string }).label;
              const description = 'descriptionKey' in item && item.descriptionKey ? t(item.descriptionKey) : (item as { description?: string }).description;
              return (
                <div key={item.key} className="space-y-2">
                  <Label htmlFor={item.key} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Icon className="h-4 w-4 text-indigo-500" />
                    {label}
                  </Label>
                  <Input
                    id={item.key}
                    type={item.type}
                    value={formData[item.key] || ''}
                    onChange={(e) => handleChange(item.key, e.target.value)}
                    disabled={!canUpdateSettings}
                    className="rounded-xl border-gray-200 bg-white/50 focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700/50"
                  />
                  {description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
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
                   <CardTitle className="text-lg text-gray-900 dark:text-white">{t('settingsPage.otherTitle')}</CardTitle>
                   <CardDescription>{t('settingsPage.otherDesc')}</CardDescription>
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
                      disabled={!canUpdateSettings}
                      className="rounded-lg border-gray-200 bg-white/50 text-sm focus:border-indigo-500 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700/50"
                    />
                  </div>
                );
              })}
              {Object.keys(formData).every(key => defaultKeys.find(k => k.key === key)) && (
                 <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-gray-500 italic">{t('settingsPage.noOtherSettings')}</p>
                 </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
