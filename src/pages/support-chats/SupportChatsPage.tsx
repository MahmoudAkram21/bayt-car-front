import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supportChatsService } from '../../services/supportChats.service';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { MessageSquare, Plus, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

export const SupportChatsPage = () => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const isArabic = i18n.language === 'ar';

  const { data: ticketsData, isLoading } = useQuery({
    queryKey: ['support-chats', page],
    queryFn: () => supportChatsService.listTickets({ page, limit: 10 }),
  });

  const tickets = ticketsData?.data ?? [];
  const pagination = ticketsData?.pagination;

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Open' },
      COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
    };

    const badge = badges[status] || badges.PENDING;
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };
  const getPriorityLabel = (priority?: string): string => {
    if (!priority) return '—';
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('supportChats.myTickets', 'My Support Tickets')}
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            {t('supportChats.subtitle', 'View and manage your support conversations')}
          </p>
        </div>
        <Link to="/support-chats/create">
          <Button className="gap-2">
            <Plus size={20} />
            {t('supportChats.newTicket', 'New Ticket')}
          </Button>
        </Link>
      </div>

      {/* Empty State */}
      {!isLoading && tickets.length === 0 && (
        <Card className="text-center py-12">
          <MessageSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {t('supportChats.noTickets', 'No support tickets')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('supportChats.createFirst', 'Create a support ticket to get started')}
          </p>
        </Card>
      )}

      {/* Tickets List */}
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <Link key={ticket.id} to={`/support-chats/${ticket.id}`}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {ticket.ticketId}
                      </h3>
                      {getStatusBadge(ticket.status)}
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 font-medium">
                      {ticket.subject}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                      {ticket.description}
                    </p>
                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                      </span>
                      {ticket.unread_count ? (
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          {ticket.unread_count} unread
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {getPriorityLabel(ticket.priority)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2">
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
    </div>
  );
};
