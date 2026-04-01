import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { notificationService } from '../../services/notification.service';
import { Bell, Send, Users, UserCheck, UserX, Loader2, History, RefreshCw } from 'lucide-react';
import { useRolePermissions } from '../../hooks/useRolePermissions';
import { format } from 'date-fns';

type TargetType = 'ALL' | 'CUSTOMERS' | 'PROVIDERS';

interface BroadcastResponse {
  success: boolean;
  message: string;
  successCount: number;
  errorCount: number;
}

export const BroadcastPage = () => {
  const { t } = useTranslation();
  const { can } = useRolePermissions();
  const canBroadcast = can('NOTIFICATIONS', 'CREATE');

  const [target, setTarget] = useState<TargetType>('ALL');
  const [titleEn, setTitleEn] = useState('');
  const [titleAr, setTitleAr] = useState('');
  const [bodyEn, setBodyEn] = useState('');
  const [bodyAr, setBodyAr] = useState('');
  const [result, setResult] = useState<BroadcastResponse | null>(null);

  const broadcastMutation = useMutation({
    mutationFn: notificationService.broadcast,
    onSuccess: (data) => {
      setResult(data);
      refetchLogs();
    },
  });

  const { data: logsData, isLoading: logsLoading, refetch: refetchLogs } = useQuery({
    queryKey: ['broadcastLogs'],
    queryFn: () => notificationService.getBroadcastLogs(1, 50),
  });

  const logs = logsData?.data ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    broadcastMutation.mutate({
      target,
      titleEn: titleEn.trim() || undefined,
      titleAr: titleAr.trim() || undefined,
      bodyEn: bodyEn.trim() || undefined,
      bodyAr: bodyAr.trim() || undefined,
    });
  };

  const handleReset = () => {
    setTarget('ALL');
    setTitleEn('');
    setTitleAr('');
    setBodyEn('');
    setBodyAr('');
    setResult(null);
  };

  const getTargetLabel = () => {
    switch (target) {
      case 'CUSTOMERS':
        return t('broadcast.customersOnly');
      case 'PROVIDERS':
        return t('broadcast.providersOnly');
      default:
        return t('broadcast.allUsers');
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
          {t('broadcast.title')}
        </h1>
        <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
          {t('broadcast.description')}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <Bell className="h-5 w-5 text-slate-500" />
              {t('broadcast.createBroadcast')}
            </CardTitle>
            <CardDescription>{t('broadcast.createBroadcastDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t('broadcast.targetAudience')}</Label>
                <select
                  value={target}
                  onChange={(e) => setTarget(e.target.value as TargetType)}
                  disabled={!canBroadcast || broadcastMutation.isPending}
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="ALL">{t('broadcast.allUsers')}</option>
                  <option value="CUSTOMERS">{t('broadcast.customersOnly')}</option>
                  <option value="PROVIDERS">{t('broadcast.providersOnly')}</option>
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t('broadcast.titleEn')}</Label>
                  <Input
                    type="text"
                    value={titleEn}
                    onChange={(e) => setTitleEn(e.target.value)}
                    placeholder={t('broadcast.titleEnPlaceholder')}
                    className="mt-1"
                    disabled={!canBroadcast || broadcastMutation.isPending}
                    required
                  />
                </div>
                <div>
                  <Label>{t('broadcast.titleAr')}</Label>
                  <Input
                    type="text"
                    value={titleAr}
                    onChange={(e) => setTitleAr(e.target.value)}
                    placeholder={t('broadcast.titleArPlaceholder')}
                    className="mt-1"
                    dir="rtl"
                    disabled={!canBroadcast || broadcastMutation.isPending}
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>{t('broadcast.bodyEn')}</Label>
                  <Input
                    type="text"
                    value={bodyEn}
                    onChange={(e) => setBodyEn(e.target.value)}
                    placeholder={t('broadcast.bodyEnPlaceholder')}
                    className="mt-1"
                    disabled={!canBroadcast || broadcastMutation.isPending}
                  />
                </div>
                <div>
                  <Label>{t('broadcast.bodyAr')}</Label>
                  <Input
                    type="text"
                    value={bodyAr}
                    onChange={(e) => setBodyAr(e.target.value)}
                    placeholder={t('broadcast.bodyArPlaceholder')}
                    className="mt-1"
                    dir="rtl"
                    disabled={!canBroadcast || broadcastMutation.isPending}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  disabled={!canBroadcast || broadcastMutation.isPending || (!titleEn && !titleAr)}
                  className="gap-2"
                >
                  {broadcastMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {t('broadcast.send')}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={broadcastMutation.isPending}
                >
                  {t('broadcast.reset')}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white">
              {t('broadcast.preview')}
            </CardTitle>
            <CardDescription>{t('broadcast.previewDesc')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                  <Bell className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {titleEn || titleAr || t('broadcast.titlePreview')}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {bodyEn || bodyAr || t('broadcast.bodyPreview')}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                      {target === 'CUSTOMERS' ? (
                        <UserX className="h-3 w-3" />
                      ) : target === 'PROVIDERS' ? (
                        <UserCheck className="h-3 w-3" />
                      ) : (
                        <Users className="h-3 w-3" />
                      )}
                      {getTargetLabel()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {result && (
              <div className={`mt-4 rounded-lg p-4 ${result.success ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-300'}`}>
                <p className="font-medium">{result.message}</p>
                <p className="mt-1 text-sm">
                  {t('broadcast.sentTo')} {result.successCount} {t('broadcast.users')}
                  {result.errorCount > 0 && ` (${result.errorCount} ${t('broadcast.errors')})`}
                </p>
              </div>
            )}

            {broadcastMutation.isError && (
              <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                <p className="font-medium">{t('broadcast.error')}</p>
                <p className="mt-1 text-sm">{broadcastMutation.error?.message}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 rounded-2xl border-gray-200 dark:border-gray-700 dark:bg-gray-800">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
              <History className="h-5 w-5 text-slate-500" />
              {t('broadcast.history')}
            </CardTitle>
            <CardDescription>{t('broadcast.historyDesc')}</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetchLogs()} disabled={logsLoading}>
            <RefreshCw className={`h-4 w-4 ${logsLoading ? 'animate-spin' : ''}`} />
          </Button>
        </CardHeader>
        <CardContent>
          {logsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
            </div>
          ) : logs.length === 0 ? (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">{t('broadcast.noLogs')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 dark:bg-gray-700/70">
                  <tr>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('broadcast.dateTime')}</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('broadcast.target')}</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('broadcast.title')}</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('broadcast.totalUsers')}</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('broadcast.success')}</th>
                    <th className="px-4 py-3 text-start text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">{t('broadcast.failed')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                        {format(new Date(log.created_at), 'PPpp')}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {log.target === 'CUSTOMERS' ? <UserX className="h-3 w-3" /> : log.target === 'PROVIDERS' ? <UserCheck className="h-3 w-3" /> : <Users className="h-3 w-3" />}
                          {log.target === 'ALL' ? t('broadcast.allUsers') : log.target === 'CUSTOMERS' ? t('broadcast.customersOnly') : t('broadcast.providersOnly')}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {log.title_en || log.title_ar || '-'}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-white">{log.total_users}</td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="text-emerald-600">{log.success_count}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className={log.error_count > 0 ? 'text-red-600' : 'text-gray-500'}>{log.error_count}</span>
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