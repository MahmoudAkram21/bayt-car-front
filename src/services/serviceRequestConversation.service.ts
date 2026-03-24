import api from './api';

export interface ServiceRequestConversationAttachment {
  id?: string;
  file_name?: string;
  file_url?: string;
  file_type?: string;
  name?: string;
  url?: string;
  type?: string;
}

export interface ServiceRequestConversationSender {
  id?: string;
  name?: string | { en?: string; ar?: string };
  avatar?: string | null;
}

export interface ServiceRequestConversationMessage {
  id: string;
  conversationId?: string;
  senderId?: string;
  content?: string | null;
  attachments?: Array<ServiceRequestConversationAttachment | string> | null;
  isRead?: boolean;
  readAt?: string | null;
  createdAt?: string | null;
  sender?: ServiceRequestConversationSender | null;
}

type RawMessagesResponse =
  | unknown[]
  | {
      data?: unknown[] | { messages?: unknown[] };
      messages?: unknown[];
      conversation?: { messages?: unknown[] };
    };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const normalizeMessage = (message: Record<string, unknown>): ServiceRequestConversationMessage => ({
  id: String(message.id ?? ''),
  conversationId: String(message.conversationId ?? message.conversation_id ?? ''),
  senderId: String(message.senderId ?? message.sender_id ?? ''),
  content: typeof message.content === 'string' ? message.content : null,
  attachments: Array.isArray(message.attachments)
    ? (message.attachments as Array<ServiceRequestConversationAttachment | string>)
    : null,
  isRead:
    typeof message.isRead === 'boolean'
      ? message.isRead
      : typeof message.is_read === 'boolean'
        ? (message.is_read as boolean)
        : undefined,
  readAt:
    typeof message.readAt === 'string'
      ? message.readAt
      : typeof message.read_at === 'string'
        ? (message.read_at as string)
        : null,
  createdAt:
    typeof message.createdAt === 'string'
      ? message.createdAt
      : typeof message.created_at === 'string'
        ? (message.created_at as string)
        : null,
  sender:
    typeof message.sender === 'object' && message.sender !== null
      ? (message.sender as ServiceRequestConversationSender)
      : null,
});

const extractMessages = (payload: RawMessagesResponse): ServiceRequestConversationMessage[] => {
  if (Array.isArray(payload)) {
    return payload.filter(isRecord).map(normalizeMessage);
  }

  if (Array.isArray(payload.messages)) {
    return payload.messages.filter(isRecord).map(normalizeMessage);
  }

  if (payload.data && Array.isArray(payload.data)) {
    return payload.data.filter(isRecord).map(normalizeMessage);
  }

  if (payload.data && typeof payload.data === 'object' && Array.isArray(payload.data.messages)) {
    return payload.data.messages.filter(isRecord).map(normalizeMessage);
  }

  if (payload.conversation && Array.isArray(payload.conversation.messages)) {
    return payload.conversation.messages.filter(isRecord).map(normalizeMessage);
  }

  return [];
};

export const serviceRequestConversationService = {
  async getMessages(conversationId: string): Promise<ServiceRequestConversationMessage[]> {
    const response = await api.get<RawMessagesResponse>(`/chat/${conversationId}/messages`);
    return extractMessages(response.data);
  },
};
