import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { RefreshCw, Ticket, User, Flag, FlagOff } from 'lucide-react';
import { supportTicketsService } from '../../services/supportTickets.service';
import { format } from 'date-fns';
import type { SupportTicketItem } from '../../types';

const getName = (name: unknown): string => {
  if (typeof name === 'string') return name;
  const o = name as { en?: string; ar?: string };
  return o?.en || o?.ar || '—';
};

export const SupportTicketsPage = () => {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['support-tickets', page],
    queryFn: () => supportTicketsService.getSupportTickets({ page, limit }),
  });

  const flagMutation = useMutation({
    mutationFn: ({ id, is_flagged_for_support, admin_note }: { id: string; is_flagged_for_support: boolean; admin_note?: string | null }) =>
      supportTicketsService.updateFlag(id, { is_flagged_for_support, admin_note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['support-tickets'] });
    },
  });

  const list = data?.data ?? [];
  const pagination = data?.pagination;
  const isArabic = i18n.language === 'ar';

  const getStatusLabel = (item: SupportTicketItem) => {
    if (item.cancelRequestStatus === 'PENDING') return t('supportTickets.cancelPending');
    if (item.isFlaggedForSupport) return t('supportTickets.flagged');
    if (['COMPLETED'].includes(item.status)) return t('supportTickets.resolved');
    if (['CANCELLED', 'REJECTED'].includes(item.status)) return t('supportTickets.closed');
    return item.status;
  };

  const getStatusColor = (item: SupportTicketItem) => {
    if (item.cancelRequestStatus === 'PENDING') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300';
    if (item.isFlaggedForSupport) return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300';
    if (['CANCELLED', 'REJECTED'].includes(item.status)) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300';
    if (item.status === 'COMPLETED') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300';
    return 'bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300';
  };

  const handleToggleFlag = (item: SupportTicketItem) => {
    flagMutation.mutate({
      id: item.id,
      is_flagged_for_support: !item.isFlaggedForSupport,
      admin_note: item.adminNote,
    });
  };

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('supportTickets.title')}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            {t('supportTickets.description')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="shrink-0 rounded-xl gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t('supportTickets.refresh')}
        </Button>
      </div>

      <Card className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
        <CardContent className="p-0">
          {error && (
            <div className="p-6 text-center">
              <p className="font-medium text-red-600 dark:text-red-400">
                {t('supportTickets.loadingError')}
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                {(error as { response?: { data?: { error?: string } } })?.response?.data?.error ?? (error as Error)?.message}
              </p>
            </div>
          )}
          {isLoading && (
            <div className="flex items-center justify-center p-12">
              <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          )}
          {!isLoading && !error && list.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Ticket className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                {t('supportTickets.noTickets')}
              </p>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {t('supportTickets.noTicketsDesc')}
              </p>
            </div>
          )}
          {!isLoading && !error && list.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100/50 dark:bg-gray-700/40">
                  <tr>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('supportTickets.customer')}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('supportTickets.service')}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('common.status')}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('supportTickets.date')}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('supportTickets.total')}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('common.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {list.map((item: SupportTicketItem) => (
                    <tr key={item.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300">
                            <User className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {getName(item.customer?.name) || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {getName(item.service?.name) || '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(item)}`}>
                          {getStatusLabel(item)}
                        </span>
                        {item.adminNote && (
                          <p className="mt-1 max-w-[180px] truncate text-xs text-gray-500 dark:text-gray-400" title={item.adminNote}>
                            {item.adminNote}
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {item.createdAt ? format(new Date(item.createdAt), isArabic ? 'dd/MM/yyyy' : 'MMM dd, yyyy') : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {item.finalPrice != null ? `${Number(item.finalPrice).toFixed(2)} SAR` : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleToggleFlag(item)}
                          disabled={flagMutation.isPending}
                        >
                          {item.isFlaggedForSupport ? (
                            <>
                              <FlagOff className="h-4 w-4" />
                              {t('supportTickets.unflag')}
                            </>
                          ) : (
                            <>
                              <Flag className="h-4 w-4" />
                              {t('supportTickets.flag')}
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('common.total')} {pagination.total} • {pagination.page} / {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {t('common.previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t('common.next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
