import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { supportChatsService } from '../../services/supportChats.service';
import {
  connectSocket,
  joinSupportTicket,
  leaveSupportTicket,
  onSupportTicketMessage,
  offSupportTicketMessage,
  onSupportTicketError,
  offSupportTicketError,
  disconnectSocket,
} from '../../lib/socket';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { format } from 'date-fns';
import { SupportChatMessages } from '../../components/support-chat/SupportChatMessages';
import { SupportChatComposer } from '../../components/support-chat/SupportChatComposer';

export const SupportChatDetailPage = () => {
  const { t } = useTranslation();
  const { ticketId } = useParams<{ ticketId: string }>();
  const queryClient = useQueryClient();
  const [messageContent, setMessageContent] = useState('');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // Fetch ticket
  const { data: ticket, isLoading } = useQuery({
    queryKey: ['support-chat', ticketId],
    queryFn: () => supportChatsService.getTicket(ticketId!),
    enabled: !!ticketId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: (vars: { content: string; files: File[] }) =>
      supportChatsService.sendMessage(ticketId!, vars),
    onSuccess: () => {
      setMessageContent('');
      setPendingFiles([]);
      queryClient.invalidateQueries({ queryKey: ['support-chat', ticketId] });
    },
  });

  // Mark unread as read
  useEffect(() => {
    if (ticket?.messages) {
      const unreadIds = ticket.messages
        .filter(msg => !msg.is_read && msg.sender_role === 'ADMIN')
        .map(msg => msg.id);

      if (unreadIds.length > 0) {
        supportChatsService.markMessagesAsRead(unreadIds);
      }
    }
  }, [ticket?.messages]);

  // Real-time socket initialization for support ticket chat
  useEffect(() => {
    const handler = (payload: any) => {
      if (payload.ticket_id !== ticketId) return;

      queryClient.setQueryData(['support-chat', ticketId], (oldData: any) => {
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

  if (isLoading) {
    return <div className="p-6 text-center">{t('common.loading', 'Loading...')}</div>;
  }

  if (!ticket) {
    return <div className="p-6 text-center">{t('common.notFound', 'Ticket not found')}</div>;
  }

  const statusBadges: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Open' },
    COMPLETED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Completed' },
  };

  const statusBadge = statusBadges[ticket.status] || statusBadges.PENDING;
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
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {ticket.ticketId}
                </h1>
                <span className={`px-3 py-1 rounded text-sm font-medium ${statusBadge.bg} ${statusBadge.text}`}>
                  {statusBadge.label}
                </span>
              </div>
              <h2 className="text-lg text-gray-600 dark:text-gray-400">
                {ticket.subject}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('supportChats.priority', 'Priority')}: <span className="font-bold">{getPriorityLabel(ticket.priority)}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {format(new Date(ticket.created_at), 'MMM dd, yyyy HH:mm')}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 dark:text-gray-300">
            {ticket.description}
          </p>
          {ticket.resolved_at && (
            <p className="text-sm text-gray-500 mt-4">
              {t('supportChats.resolvedAt', 'Resolved at')}: {format(new Date(ticket.resolved_at), 'MMM dd, yyyy HH:mm')}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Chat Section */}
      <Card className="flex flex-col h-[600px]">
        <CardHeader className="border-b">
          <CardTitle>{t('supportChats.conversation', 'Conversation')}</CardTitle>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-y-auto py-6 space-y-4">
          <SupportChatMessages messages={ticket.messages ?? []} isAdminView={false} />
        </CardContent>

        {ticket.status !== 'COMPLETED' && (
          <SupportChatComposer
            messageContent={messageContent}
            onMessageChange={setMessageContent}
            pendingFiles={pendingFiles}
            onPendingFilesChange={setPendingFiles}
            onSubmit={handleSendMessage}
            disabled={false}
            isSending={sendMessageMutation.isPending}
            placeholder={t('supportChats.typePlaceholder', 'Type your message...')}
            voiceLabels={{
              record: t('supportChats.voiceRecord', 'Record voice'),
              stop: t('supportChats.voiceStop', 'Stop'),
            }}
            pendingAttachmentLabels={{
              remove: t('supportChats.removeAttachment', 'Remove attachment'),
              voicePreview: t('supportChats.voicePreview', 'Voice preview'),
            }}
            attachmentToolLabels={{
              attachImage: t('supportChats.attachImage', 'Add image'),
              attachFile: t('supportChats.attachFile', 'Attach file'),
            }}
          />
        )}

        {ticket.status === 'COMPLETED' && (
          <div className="border-t p-4 bg-gray-50 dark:bg-gray-800 text-center text-gray-600 dark:text-gray-400 text-sm">
            {t('supportChats.ticketCompleted', 'This ticket is completed. Chat is closed — you cannot send messages.')}
          </div>
        )}
      </Card>
    </div>
  );
};
