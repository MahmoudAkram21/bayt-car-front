import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import type { SupportMessage } from '../../services/supportChats.service';
import { cn } from '../../lib/utils';
import { SupportMessageAttachments } from './SupportMessageAttachments';

type Props = {
  messages: SupportMessage[];
  /** Admin detail: admin on the right. Client detail: client on the right. */
  isAdminView: boolean;
};

export function SupportChatMessages({ messages, isAdminView }: Props) {
  const { t } = useTranslation();

  if (!messages?.length) {
    return (
      <div className="py-10 text-center text-sm text-gray-500 dark:text-gray-400">
        {isAdminView
          ? t('admin.supportChats.noMessages', 'No messages yet. Start by sending a message below.')
          : t(
              'supportChats.noMessages',
              'No messages yet. Start the conversation by sending a message below.',
            )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((message) => {
        const isMine = isAdminView
          ? message.sender_role === 'ADMIN'
          : message.sender_role === 'CLIENT';
        const label = isAdminView
          ? message.sender_name ||
            (message.sender_role === 'ADMIN'
              ? t('admin.supportChats.youAdmin', 'System User')
              : t('admin.supportChats.customer', 'Customer'))
          : isMine
            ? t('supportChats.you', 'You')
            : t('supportChats.admin', 'Support Admin');

        return (
          <div
            key={message.id}
            className={cn('flex w-full', isMine ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[85%] rounded-lg px-3 py-2 shadow-sm sm:max-w-md lg:max-w-lg',
                isMine
                  ? 'rounded-tr-sm bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                  : 'rounded-tl-sm bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100',
              )}
            >
              <p className="mb-1 text-xs font-semibold opacity-90">{label}</p>
              {message.content?.trim() ? (
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{message.content}</p>
              ) : null}
              <SupportMessageAttachments
                attachments={message.attachments ?? []}
                tone={isMine ? 'outgoing' : 'incoming'}
              />
              <p className="mt-1 text-end text-[11px] tabular-nums opacity-70">
                {format(new Date(message.created_at), 'HH:mm')}
                {message.is_read && isMine && (
                  <span className="ms-1.5" aria-hidden>
                    ✓✓
                  </span>
                )}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
