import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supportChatsService } from '../../../services/supportChats.service';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { TicketIcon, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export const AdminSupportChatsPage = () => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [priority, setPriority] = useState<string>('');
  const isArabic = i18n.language === 'ar';

  // Fetch all tickets
  const { data: ticketsData, isLoading: ticketsLoading } = useQuery({
    queryKey: ['admin-support-chats', page, status, priority],
    queryFn: () =>
      supportChatsService.listAllTickets({
        page,
        limit: 10,
        status: status || undefined,
        priority: priority || undefined,
      }),
  });

  // Fetch unassigned tickets
  const { data: unassignedData } = useQuery({
    queryKey: ['admin-support-chats-unassigned'],
    queryFn: () => supportChatsService.getUnassignedTickets({ limit: 5 }),
  });

  const tickets = ticketsData?.data ?? [];
  const pagination = ticketsData?.pagination;
  const unassignedCount = unassignedData?.data.length ?? 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock size={16} className="text-yellow-600" />;
      case 'COMPLETED':
        return <CheckCircle size={16} className="text-green-600" />;
      default:
        return <TicketIcon size={16} className="text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('admin.supportChats.statusOpen', 'Open') },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: t('admin.supportChats.statusCompleted', 'Completed') },
    };

    const badge = badges[status] || badges.PENDING;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'text-red-700 font-bold';
      case 'HIGH':
        return 'text-red-600 font-bold';
      case 'MEDIUM':
        return 'text-yellow-600 font-semibold';
      case 'LOW':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };
  const getPriorityLabel = (priority: string) => {
    const keyMap: Record<string, string> = {
      LOW: 'supportChats.priorityLow',
      MEDIUM: 'supportChats.priorityMedium',
      HIGH: 'supportChats.priorityHigh',
      URGENT: 'supportChats.priorityUrgent',
    };
    const fallbackMap: Record<string, string> = {
      LOW: 'Low',
      MEDIUM: 'Medium',
      HIGH: 'High',
      URGENT: 'Urgent',
    };
    return t(keyMap[priority] ?? '', fallbackMap[priority] ?? priority);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('admin.supportChats.title', 'Support Tickets Management')}
        </h1>
        <p className="mt-1 text-gray-600 dark:text-gray-400">
          {t('admin.supportChats.subtitle', 'Manage and respond to customer support tickets')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('admin.supportChats.unassigned', 'Unassigned')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {unassignedCount}
                </p>
              </div>
              <AlertCircle size={32} className="text-red-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('admin.supportChats.openChats', 'Open (chat active)')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {tickets.filter(t => t.status === 'PENDING').length}
                </p>
              </div>
              <Clock size={32} className="text-yellow-500 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {t('admin.supportChats.completed', 'Completed (chat closed)')}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {tickets.filter(t => t.status === 'COMPLETED').length}
                </p>
              </div>
              <CheckCircle size={32} className="text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.supportChats.filterStatus', 'Filter by Status')}
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">{t('admin.supportChats.allStatuses', 'All Statuses')}</option>
                <option value="PENDING">{t('admin.supportChats.statusOpenPending', 'Open (PENDING)')}</option>
                <option value="COMPLETED">{t('admin.supportChats.statusCompleted', 'Completed')}</option>
              </select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('admin.supportChats.filterPriority', 'Filter by Priority')}
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  setPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">{t('admin.supportChats.allPriorities', 'All Priorities')}</option>
                <option value="LOW">{getPriorityLabel('LOW')}</option>
                <option value="MEDIUM">{getPriorityLabel('MEDIUM')}</option>
                <option value="HIGH">{getPriorityLabel('HIGH')}</option>
                <option value="URGENT">{getPriorityLabel('URGENT')}</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setStatus('');
                  setPriority('');
                  setPage(1);
                }}
              >
                {t('admin.supportChats.clearFilters', 'Clear Filters')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tickets List */}
      <Card>
        <CardHeader>
          <CardTitle>{t('admin.supportChats.tickets', 'Support Tickets')}</CardTitle>
        </CardHeader>
        <CardContent>
          {ticketsLoading ? (
            <div className="text-center py-8 text-gray-500">
              {t('common.loading', 'Loading...')}
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {t('admin.supportChats.noTickets', 'No support tickets found')}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      {t('admin.supportChats.ticketId', 'Ticket ID')}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      {t('admin.supportChats.customerEmail', 'Customer email')}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      {t('admin.supportChats.subject', 'Subject')}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      {t('admin.supportChats.status', 'Status')}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      {t('admin.supportChats.priority', 'Priority')}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      {t('admin.supportChats.created', 'Created')}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                      {t('admin.supportChats.action', 'Action')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <tr
                      key={ticket.id}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {ticket.ticketId}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs max-w-[14rem] truncate">
                        {ticket.client?.email || '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {ticket.subject}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(ticket.status)}
                          {getStatusBadge(ticket.status)}
                        </div>
                      </td>
                      <td className={`py-3 px-4 ${getPriorityColor(ticket.priority)}`}>
                        {getPriorityLabel(ticket.priority)}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400 text-xs">
                        {format(new Date(ticket.created_at), 'MMM dd, HH:mm')}
                      </td>
                      <td className="py-3 px-4">
                        <Link to={`/admin/support-chats/${ticket.id}`}>
                          <Button variant="outline" size="sm">
                            {t('admin.supportChats.view', 'View')}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
              >
                {isArabic ? '→' : '←'} Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(pagination.pages, page + 1))}
                disabled={page >= pagination.pages}
              >
                Next {isArabic ? '←' : '→'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
