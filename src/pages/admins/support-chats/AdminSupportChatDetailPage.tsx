import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supportChatsService } from '../../../services/supportChats.service';
import {
  connectSocket,
  joinSupportTicket,
  leaveSupportTicket,
  onSupportTicketMessage,
  offSupportTicketMessage,
  onSupportTicketError,
  offSupportTicketError,
  disconnectSocket,
} from '../../../lib/socket';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { ArrowLeft, Check } from 'lucide-react';
import { format } from 'date-fns';
import { SupportChatMessages } from '../../../components/support-chat/SupportChatMessages';
import { SupportChatComposer } from '../../../components/support-chat/SupportChatComposer';

export const AdminSupportChatDetailPage = () => {
  const { t } = useTranslation();
  const { ticketId } = useParams<{ ticketId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [messageContent, setMessageContent] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [newStatus, setNewStatus] = useState<string>('');
  const [newPriority, setNewPriority] = useState<string>('');

  const { data: ticket, isLoading, isError, error } = useQuery({
    queryKey: ['admin-support-chat', ticketId],
    queryFn: () => supportChatsService.getTicketAdmin(ticketId!),
    enabled: !!ticketId,
  });

  const apiErrorMessage =
    isError && error && typeof error === 'object' && 'response' in error
      ? (error as { response?: { data?: { error?: string } } }).response?.data?.error
      : null;

  const sendMessageMutation = useMutation({
    mutationFn: (vars: { content: string; files: File[] }) =>
      supportChatsService.sendAdminMessage(ticketId!, vars),
    onSuccess: () => {
      setMessageContent('');
      setPendingFiles([]);
      queryClient.invalidateQueries({ queryKey: ['admin-support-chat', ticketId] });
    },
  });

  const sendMessageErrorPayload = sendMessageMutation.error as
    | { response?: { data?: { error?: string; errors?: { msg?: string }[] } } }
    | undefined;
  const sendMessageErrorText =
    sendMessageErrorPayload?.response?.data?.error ??
    (Array.isArray(sendMessageErrorPayload?.response?.data?.errors)
      ? sendMessageErrorPayload.response!.data!.errors!.map((e) => e.msg || JSON.stringify(e)).join(', ')
      : null);

  const updateTicketMutation = useMutation({
    mutationFn: (data: { status?: string; priority?: string }) =>
      supportChatsService.updateTicket(ticketId!, data),
    onSuccess: () => {
      setNewStatus('');
      setNewPriority('');
      queryClient.invalidateQueries({ queryKey: ['admin-support-chat', ticketId] });
    },
  });

  useEffect(() => {
    if (ticket) {
      setNewStatus(ticket.status);
      setNewPriority(ticket.priority);
    }
  }, [ticket]);

  useEffect(() => {
    const handler = (payload: any) => {
      if (payload.ticket_id !== ticketId) return;

      queryClient.setQueryData(['admin-support-chat', ticketId], (oldData: any) => {
        if (!oldData) return oldData;
        const list = oldData.messages || [];
        if (list.some((m: { id: string }) => m.id === payload.message?.id)) {
          return oldData;
        }
        return {
          ...oldData,
          messages: [...list, payload.message],
        };
      });
    };

    const errorHandler = (payload: any) => {
      console.warn('Socket support ticket error:', payload?.message);
    };

    connectSocket();
    if (ticketId) {
      joinSupportTicket(ticketId);
    }

    onSupportTicketMessage(handler);
    onSupportTicketError(errorHandler);

    return () => {
      if (ticketId) {
        leaveSupportTicket(ticketId);
      }
      offSupportTicketMessage(handler);
      offSupportTicketError(errorHandler);
      disconnectSocket();
    };
  }, [ticketId, queryClient]);

  const handleSendMessage = () => {
    if (!messageContent.trim() && pendingFiles.length === 0) return;
    sendMessageMutation.mutate({
      content: messageContent,
      files: pendingFiles,
    });
  };

  const handleUpdateStatus = () => {
    if (newStatus && newStatus !== ticket?.status) {
      updateTicketMutation.mutate({ status: newStatus });
    }
  };

  const handleUpdatePriority = () => {
    if (newPriority && newPriority !== ticket?.priority) {
      updateTicketMutation.mutate({ priority: newPriority });
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center">{t('common.loading', 'Loading...')}</div>;
  }

  if (isError) {
    return (
      <div className="p-6 text-center space-y-2 max-w-lg mx-auto">
        <p className="font-medium text-red-600 dark:text-red-400">
          {t('admin.supportChats.loadFailed', 'Could not load this support ticket')}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {apiErrorMessage ||
            (error instanceof Error ? error.message : t('common.unknownError', 'Unknown error'))}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {t(
            'admin.supportChats.loadFailedHint',
            'Check that you are logged in as a dashboard admin and the ticket id in the URL is valid.',
          )}
        </p>
        <Button type="button" variant="outline" onClick={() => navigate('/admin/support-chats')}>
          {t('common.back', 'Back')}
        </Button>
      </div>
    );
  }

  if (!ticket) {
    return <div className="p-6 text-center">{t('common.notFound', 'Ticket not found')}</div>;
  }

  const statusBadges: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: t('admin.supportChats.statusOpen', 'Open') },
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: t('admin.supportChats.statusCompleted', 'Completed') },
  };

  const statusBadge = statusBadges[ticket.status] || statusBadges.PENDING;
  const getLocalizedPriority = (value?: string) => {
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
    if (!value) return '—';
    return t(keyMap[value] ?? '', fallbackMap[value] ?? value);
  };
  const getLocalizedCategory = (value?: string) => {
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
    if (!value) return '—';
    return t(keyMap[value] ?? '', fallbackMap[value] ?? value);
  };

  return (
    <div className="p-4 md:p-6 max-w-[1700px] mx-auto">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4 rounded-2xl border border-gray-200 bg-white px-4 py-3.5 shadow-sm dark:border-gray-700 dark:bg-gray-900/50">
        <button
          type="button"
          onClick={() => navigate('/admin/support-chats')}
          className="flex shrink-0 items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          <ArrowLeft size={18} />
          {t('common.back', 'Back')}
        </button>
        <div className="hidden h-6 w-px shrink-0 bg-gray-200 sm:block dark:bg-gray-600" aria-hidden />
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-lg font-bold tracking-tight text-gray-900 dark:text-white">
              {ticket.ticketId}
            </span>
            <span
              className={`shrink-0 rounded-md px-2.5 py-0.5 text-xs font-semibold ${statusBadge.bg} ${statusBadge.text}`}
            >
              {statusBadge.label}
            </span>
          </div>
          <h1 className="min-w-0 text-lg font-semibold leading-snug text-gray-800 dark:text-gray-200 sm:border-l sm:border-gray-200 sm:pl-3 sm:text-xl dark:sm:border-gray-600">
            {ticket.subject}
          </h1>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <Card className="flex min-h-0 flex-1 flex-col border-gray-200 dark:border-gray-700 lg:min-h-[calc(100vh-9.5rem)]">
          <CardHeader className="border-b border-gray-200 py-3.5 dark:border-gray-700">
            <CardTitle className="text-lg font-semibold">{t('admin.supportChats.conversation', 'Conversation')}</CardTitle>
          </CardHeader>

          <CardContent className="flex min-h-0 flex-1 flex-col p-0 overflow-hidden">
            <div className="min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-4">
              <SupportChatMessages messages={ticket.messages ?? []} isAdminView />
            </div>

            {ticket.status !== 'COMPLETED' && (
              <SupportChatComposer
                messageContent={messageContent}
                onMessageChange={setMessageContent}
                pendingFiles={pendingFiles}
                onPendingFilesChange={setPendingFiles}
                onSubmit={handleSendMessage}
                disabled={false}
                isSending={sendMessageMutation.isPending}
                placeholder={t('admin.supportChats.typePlaceholder', 'Type your response...')}
                voiceLabels={{
                  record: t('admin.supportChats.voiceRecord', 'Record voice'),
                  stop: t('admin.supportChats.voiceStop', 'Stop'),
                }}
                pendingAttachmentLabels={{
                  remove: t('admin.supportChats.removeAttachment', 'Remove attachment'),
                  voicePreview: t('admin.supportChats.voicePreview', 'Voice preview'),
                }}
                attachmentToolLabels={{
                  attachImage: t('admin.supportChats.attachImage', 'Add image'),
                  attachFile: t('admin.supportChats.attachFile', 'Attach file'),
                }}
              />
            )}
            {ticket.status !== 'COMPLETED' && sendMessageMutation.isError && sendMessageErrorText && (
              <div className="px-4 pb-3">
                <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                  {sendMessageErrorText}
                </p>
              </div>
            )}
            {ticket.status === 'COMPLETED' && (
              <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 text-center text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800/80 dark:text-gray-400">
                {t(
                  'admin.supportChats.ticketCompleted',
                  'This ticket is completed. Chat is closed — you cannot send messages.',
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <aside className="flex w-full shrink-0 flex-col lg:w-80 xl:w-[22rem] lg:sticky lg:top-4 lg:self-start">
          <Card className="border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden lg:max-h-[calc(100vh-9.5rem)]">
            <CardHeader className="py-3 border-b border-gray-100 dark:border-gray-800">
              <CardTitle className="text-base font-semibold">
                {t('admin.supportChats.ticketDetails', 'Ticket details')}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-0">
              <div className="space-y-4 px-6 py-4 text-base overflow-y-auto max-h-[42vh] lg:max-h-[46vh]">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t('admin.supportChats.customer', 'Customer')}
                  </p>
                  <p className="mt-1 text-base font-semibold text-gray-900 dark:text-white break-words">
                    {ticket.client?.name || '—'}
                  </p>
                  <p className="mt-0.5 break-all text-sm text-gray-600 dark:text-gray-400">
                    {ticket.client?.email || '—'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {t('admin.supportChats.category', 'Category')}
                    </p>
                    <p className="mt-1 font-medium text-gray-900 dark:text-white">{getLocalizedCategory(ticket.category)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {t('admin.supportChats.priority', 'Priority')}
                    </p>
                    <p className="mt-1 font-medium text-gray-900 dark:text-white">{getLocalizedPriority(ticket.priority)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {t('admin.supportChats.created', 'Created')}
                    </p>
                    <p className="mt-1 font-medium text-gray-900 dark:text-white">
                      {format(new Date(ticket.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  {ticket.resolved_at ? (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        {t('admin.supportChats.resolved', 'Resolved')}
                      </p>
                      <p className="mt-1 font-medium text-gray-900 dark:text-white">
                        {format(new Date(ticket.resolved_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  ) : null}
                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    {t('admin.supportChats.internalId', 'Internal ID')}
                  </p>
                  <p className="mt-1 break-all font-mono text-xs text-gray-700 dark:text-gray-300">
                    {ticket.id}
                  </p>
                </div>

                {ticket.description ? (
                  <div className="border-t border-gray-100 pt-3 dark:border-gray-800">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {t('supportChats.description', 'Description')}
                    </p>
                    <p className="mt-1 whitespace-pre-wrap text-gray-700 dark:text-gray-300">{ticket.description}</p>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-gray-100 dark:border-gray-800">
                <div className="px-6 pt-3 pb-2">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {t('admin.supportChats.manageTicket', 'Manage ticket')}
                  </h3>
                </div>
                <div className="space-y-4 px-6 pb-4 overflow-y-auto max-h-[32vh] lg:max-h-[28vh]">
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.supportChats.status', 'Status')}
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        disabled={ticket.status === 'COMPLETED'}
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 disabled:opacity-60 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="PENDING">{t('admin.supportChats.statusOpen', 'Open')}</option>
                        <option value="COMPLETED">{t('admin.supportChats.markCompleted', 'Completed (close chat)')}</option>
                      </select>
                      <Button
                        type="button"
                        size="icon"
                        onClick={handleUpdateStatus}
                        disabled={
                          ticket.status === 'COMPLETED' ||
                          newStatus === ticket.status ||
                          updateTicketMutation.isPending
                        }
                        className="shrink-0"
                        aria-label={t('admin.supportChats.applyStatus', 'Apply status')}
                      >
                        <Check size={18} />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-700 dark:text-gray-300">
                      {t('admin.supportChats.priority', 'Priority')}
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={newPriority}
                        onChange={(e) => setNewPriority(e.target.value)}
                        className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                      >
                        <option value="LOW">{getLocalizedPriority('LOW')}</option>
                        <option value="MEDIUM">{getLocalizedPriority('MEDIUM')}</option>
                        <option value="HIGH">{getLocalizedPriority('HIGH')}</option>
                        <option value="URGENT">{getLocalizedPriority('URGENT')}</option>
                      </select>
                      <Button
                        type="button"
                        size="icon"
                        onClick={handleUpdatePriority}
                        disabled={newPriority === ticket.priority || updateTicketMutation.isPending}
                        className="shrink-0"
                        aria-label={t('admin.supportChats.applyPriority', 'Apply priority')}
                      >
                        <Check size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
};

