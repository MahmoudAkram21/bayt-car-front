import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { RefreshCw, Ticket, MessageSquare } from 'lucide-react';
import { supportChatsService, type SupportTicket } from '../../services/supportChats.service';
import { format } from 'date-fns';

const getStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
    COMPLETED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
  };
  return colorMap[status] || 'bg-gray-100 text-gray-700 dark:bg-gray-900/40 dark:text-gray-300';
};

export const SupportTicketsPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-support-tickets', page],
    queryFn: () => supportChatsService.listAllTickets({ page, limit }),
  });

  const tickets: SupportTicket[] = data?.data ?? [];
  const pagination = data?.pagination;
  const isArabic = i18n.language === 'ar';
  const getCategoryLabel = (category?: string): string => {
    if (!category) return '—';
    const keyMap: Record<string, string> = {
      TECHNICAL_ISSUE: 'supportChats.categoryTechnical',
      BILLING_PAYMENT: 'supportChats.categoryBilling',
      SERVICE_QUALITY: 'supportChats.categoryServiceQuality',
      PROVIDER_ISSUE: 'supportChats.categoryProviderIssue',
      FEATURE_REQUEST: 'supportChats.categoryFeatureRequest',
      ACCOUNT_ISSUE: 'supportChats.categoryAccountIssue',
      OTHER: 'supportChats.categoryOther',
    };
    const fallbackMap: Record<string, string> = {
      TECHNICAL_ISSUE: 'Technical Issue',
      BILLING_PAYMENT: 'Billing / Payment',
      SERVICE_QUALITY: 'Service Quality',
      PROVIDER_ISSUE: 'Provider Issue',
      FEATURE_REQUEST: 'Feature Request',
      ACCOUNT_ISSUE: 'Account Issue',
      OTHER: 'Other',
    };
    return t(keyMap[category] ?? '', fallbackMap[category] ?? category);
  };
  const getStatusLabel = (status: string): string => {
    const statusMap: Record<string, string> = {
      PENDING: t('admin.supportChats.statusOpen', 'Open'),
      COMPLETED: t('admin.supportChats.statusCompleted', 'Completed'),
    };
    return statusMap[status] || status;
  };

  const handleViewTicket = (ticketId: string) => {
    navigate(`/admin/support-chats/${ticketId}`);
  };
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('supportTickets.title', 'Support Tickets')}
          </h1>
          <p className="mt-2 max-w-2xl text-base text-gray-600 dark:text-gray-400">
            {t('supportTickets.description', 'Manage customer support tickets and conversations')}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="shrink-0 rounded-xl gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          {t('supportTickets.refresh', 'Refresh')}
        </Button>
      </div>

      <Card className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700">
        <CardContent className="p-0">
          {error && (
            <div className="p-6 text-center">
              <p className="font-medium text-red-600 dark:text-red-400">
                {t('supportTickets.loadingError', 'Error loading support tickets')}
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
          {!isLoading && !error && tickets.length === 0 && (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <Ticket className="h-12 w-12 text-gray-300 dark:text-gray-600" />
              <p className="mt-4 text-xl font-bold text-gray-900 dark:text-white">
                {t('supportTickets.noTickets', 'No support tickets')}
              </p>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {t('supportTickets.noTicketsDesc', 'There are no support tickets at the moment')}
              </p>
            </div>
          )}
          {!isLoading && !error && tickets.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100/50 dark:bg-gray-700/40">
                  <tr>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('supportTickets.ticketId', 'Ticket ID')}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('supportTickets.customerEmail', 'Customer email')}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('supportTickets.subject', 'Subject')}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('supportTickets.category', 'Category')}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('common.status', 'Status')}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('supportTickets.date', 'Date')}
                    </th>
                    <th className="px-6 py-4 text-start text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                      {t('common.actions', 'Actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-700/30">
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-300">
                            <Ticket className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white font-mono">
                            {ticket.ticketId}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-[14rem] truncate">
                        {ticket.client?.email || '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                        {ticket.subject || '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        {getCategoryLabel(ticket.category)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {getStatusLabel(ticket.status)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {ticket.created_at ? format(new Date(ticket.created_at), isArabic ? 'dd/MM/yyyy HH:mm' : 'MMM dd, yyyy HH:mm') : '—'}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleViewTicket(ticket.id)}
                        >
                          <MessageSquare className="h-4 w-4" />
                          {t('supportTickets.view', 'View')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {pagination && pagination.total > limit && (
            <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('common.total', 'Total')}: {pagination.total} • {t('common.page', 'Page')} {pagination.page || page} / {Math.ceil((pagination.total || 0) / limit)}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {t('common.previous', 'Previous')}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= Math.ceil((pagination.total || 0) / limit)}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t('common.next', 'Next')}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
