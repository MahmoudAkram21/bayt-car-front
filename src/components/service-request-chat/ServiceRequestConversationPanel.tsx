import type { ReactNode } from 'react';
import { format } from 'date-fns';
import { AlertCircle, Briefcase, ImageIcon, MessageSquare, Paperclip, User } from 'lucide-react';
import { resolveUploadFileUrl } from '../../lib/resolveUploadUrl';
import {
  type ServiceRequestConversationAttachment,
  type ServiceRequestConversationMessage,
} from '../../services/serviceRequestConversation.service';
import { VoiceMessageBar } from '../support-chat/VoiceMessageBar';

type Props = {
  conversationId?: string | null;
  messages: ServiceRequestConversationMessage[];
  isLoading: boolean;
  errorMessage?: string | null;
  customerName: string;
  providerName: string;
  customerIds: string[];
  providerIds: string[];
};

type SenderKind = 'customer' | 'provider' | 'unknown';

const getText = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value !== null) {
    const name = value as { en?: string; ar?: string };
    return name.en || name.ar || '';
  }
  return '';
};

const normalizeAttachment = (attachment: ServiceRequestConversationAttachment | string) => {
  if (typeof attachment === 'string') {
    return {
      id: attachment,
      url: resolveUploadFileUrl(attachment),
      name: attachment.split('/').pop() || 'Attachment',
      type: '',
    };
  }

  const rawUrl = attachment.file_url ?? attachment.url ?? '';
  return {
    id: attachment.id ?? rawUrl ?? attachment.file_name ?? attachment.name ?? Math.random().toString(36),
    url: resolveUploadFileUrl(rawUrl),
    name: attachment.file_name ?? attachment.name ?? (rawUrl.split('/').pop() || 'Attachment'),
    type: attachment.file_type ?? attachment.type ?? '',
  };
};

const getAttachmentKind = (type: string, url: string) => {
  const lowerType = type.toLowerCase();
  const lowerUrl = url.toLowerCase();
  if (lowerType.startsWith('image/') || /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/.test(lowerUrl)) {
    return 'image';
  }
  if (lowerType.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|webm)$/.test(lowerUrl)) {
    return 'audio';
  }
  return 'file';
};

const getSenderKind = (
  senderId: string | undefined,
  customerIds: string[],
  providerIds: string[],
): SenderKind => {
  if (!senderId) return 'unknown';
  if (customerIds.includes(senderId)) return 'customer';
  if (providerIds.includes(senderId)) return 'provider';
  return 'unknown';
};

const getSenderLabel = (
  message: ServiceRequestConversationMessage,
  senderKind: SenderKind,
  customerName: string,
  providerName: string,
) => {
  const senderName = getText(message.sender?.name);
  if (senderName) return senderName;
  if (senderKind === 'customer') return customerName;
  if (senderKind === 'provider') return providerName;
  return 'Participant';
};

const getTimestamp = (message: ServiceRequestConversationMessage) => {
  if (!message.createdAt) return '';
  try {
    return format(new Date(message.createdAt), 'MMM d, HH:mm');
  } catch {
    return '';
  }
};

const renderAttachments = (
  attachments: Array<ServiceRequestConversationAttachment | string> | null | undefined,
  tone: 'incoming' | 'outgoing',
) => {
  if (!attachments?.length) return null;

  return (
    <div className="mt-3 flex flex-col gap-2">
      {attachments.map((attachment) => {
        const item = normalizeAttachment(attachment);
        const kind = getAttachmentKind(item.type, item.url);

        if (kind === 'image') {
          return (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-xl border border-black/5 bg-white/70"
            >
              <img
                src={item.url}
                alt={item.name}
                className="max-h-56 w-full rounded-xl object-contain"
                loading="lazy"
              />
            </a>
          );
        }

        if (kind === 'audio') {
          return (
            <VoiceMessageBar
              key={item.id}
              src={item.url}
              tone={tone}
              className="rounded-xl border border-black/5 bg-white/70 p-2"
            />
          );
        }

        return (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-xl border border-black/5 bg-white/80 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-white"
          >
            <Paperclip className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.name}</span>
          </a>
        );
      })}
    </div>
  );
};

const EmptyState = ({
  icon,
  title,
  description,
}: {
  icon: ReactNode;
  title: string;
  description: string;
}) => (
  <div className="flex h-full min-h-[280px] flex-col items-center justify-center px-6 text-center">
    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm dark:bg-slate-800 dark:text-slate-300">
      {icon}
    </div>
    <p className="mt-4 text-base font-semibold text-gray-900 dark:text-white">{title}</p>
    <p className="mt-2 max-w-sm text-sm leading-6 text-gray-600 dark:text-gray-400">{description}</p>
  </div>
);

export function ServiceRequestConversationPanel({
  conversationId,
  messages,
  isLoading,
  errorMessage,
  customerName,
  providerName,
  customerIds,
  providerIds,
}: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50/80 dark:bg-slate-900/40">
      <div className="border-b border-slate-200/80 px-5 py-4 dark:border-slate-800">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Conversation</h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              View the customer and provider chat related to this service request.
            </p>
          </div>
          <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {conversationId ? 'Linked chat' : 'No chat yet'}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs">
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-medium text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
            <User className="h-3.5 w-3.5" />
            {customerName}
          </span>
          <span className="text-slate-400">to</span>
          <span className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 font-medium text-slate-700 shadow-sm dark:bg-slate-800 dark:text-slate-200">
            <Briefcase className="h-3.5 w-3.5" />
            {providerName}
          </span>
        </div>

        {conversationId && (
          <p className="mt-3 break-all font-mono text-[11px] text-slate-500 dark:text-slate-400">
            Conversation ID: {conversationId}
          </p>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {!conversationId ? (
          <EmptyState
            icon={<MessageSquare className="h-6 w-6" />}
            title="No conversation started yet"
            description="This service request does not have a customer-provider chat yet. The panel will populate automatically once a conversation is created."
          />
        ) : isLoading ? (
          <div className="space-y-4 px-5 py-5">
            {[0, 1, 2].map((item) => (
              <div key={item} className={`flex ${item % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                <div className="w-full max-w-[82%] animate-pulse rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                  <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-3 h-3 w-full rounded bg-slate-200 dark:bg-slate-700" />
                  <div className="mt-2 h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                </div>
              </div>
            ))}
          </div>
        ) : errorMessage ? (
          <EmptyState
            icon={<AlertCircle className="h-6 w-6" />}
            title="Could not load this conversation"
            description={errorMessage}
          />
        ) : messages.length === 0 ? (
          <EmptyState
            icon={<ImageIcon className="h-6 w-6" />}
            title="Conversation is empty"
            description="A conversation record exists for this request, but no messages have been sent yet."
          />
        ) : (
          <div className="space-y-4 px-5 py-5">
            {messages.map((message) => {
              const senderKind = getSenderKind(message.senderId, customerIds, providerIds);
              const isProvider = senderKind === 'provider';
              const senderLabel = getSenderLabel(message, senderKind, customerName, providerName);
              const timestamp = getTimestamp(message);
              const tone = isProvider ? 'outgoing' : 'incoming';

              return (
                <div key={message.id} className={`flex ${isProvider ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`w-full max-w-[85%] rounded-[24px] border px-4 py-3 shadow-sm ${
                      isProvider
                        ? 'border-teal-200 bg-teal-50 text-teal-950 dark:border-teal-900/70 dark:bg-teal-950/30 dark:text-teal-50'
                        : 'border-white/70 bg-white text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
                        {senderLabel}
                      </p>
                      {timestamp && (
                        <span className="shrink-0 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                          {timestamp}
                        </span>
                      )}
                    </div>

                    {message.content?.trim() ? (
                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6">{message.content}</p>
                    ) : null}

                    {renderAttachments(message.attachments, tone)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
