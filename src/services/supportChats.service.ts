import api from './api';

export interface SupportTicketClient {
  id: string;
  name: string | null;
  email: string | null;
}

export interface SupportTicket {
  id: string;
  ticketId: string;
  service_request_id: string;
  client_id: string;
  admin_id: string | null;
  subject: string;
  description: string | null;
  status: 'PENDING' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;
  assigned_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  unread_count?: number;
  messages?: SupportMessage[];
  /** Customer who opened the ticket (included on admin/list/detail responses). */
  client?: SupportTicketClient | null;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_role: 'CLIENT' | 'ADMIN';
  sender_name?: string;
  content: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
  attachments?: SupportAttachment[];
}

export interface SupportAttachment {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export const supportChatsService = {
  /**
   * Create a new support ticket
   */
  async createTicket(payload: {
    service_request_id: string;
    subject: string;
    description: string;
    category: string;
    priority?: string;
  }) {
    const response = await api.post<{ message: string; data: SupportTicket }>(
      '/support-tickets',
      payload
    );
    return response.data;
  },

  /**
   * Get a single support ticket
   */
  async getTicket(ticketId: string) {
    const response = await api.get<SupportTicket>(
      `/support-tickets/${ticketId}`
    );
    return response.data;
  },

  /**
   * List support tickets
   */
  async listTickets(params?: {
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get<{
      data: SupportTicket[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
    }>('/support-tickets', { params });
    return response.data;
  },

  /**
   * Send a message in a support ticket (JSON text-only or multipart with images/audio).
   */
  async sendMessage(
    ticketId: string,
    payload: { content: string; files?: File[] },
  ) {
    const { content, files } = payload;
    if (files?.length) {
      const fd = new FormData();
      fd.append('content', content ?? '');
      files.forEach((f) => fd.append('files', f));
      const response = await api.post<{ message: string; data: SupportMessage }>(
        `/support-tickets/${ticketId}/messages`,
        fd,
      );
      return response.data;
    }
    const response = await api.post<{ message: string; data: SupportMessage }>(
      `/support-tickets/${ticketId}/messages`,
      { content: content.trim() },
    );
    return response.data;
  },

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(messageIds: string[]) {
    const response = await api.post<{ message: string; updated: number }>(
      '/support-tickets/messages/read',
      { message_ids: messageIds }
    );
    return response.data;
  },

  /**
   * Get unread count
   */
  async getUnreadCount() {
    const response = await api.get<{ total_unread: number }>(
      '/support-tickets/unread/count'
    );
    return response.data;
  },

  // ===== ADMIN ENDPOINTS =====

  /**
   * List all support tickets (Admin)
   */
  async listAllTickets(params?: {
    status?: string;
    priority?: string;
    page?: number;
    limit?: number;
  }) {
    const response = await api.get<{
      data: SupportTicket[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
    }>('/admin/support-tickets', { params });
    return response.data;
  },

  /**
   * Get unassigned tickets (Admin)
   */
  async getUnassignedTickets(params?: {
    page?: number;
    limit?: number;
  }) {
    const response = await api.get<{
      data: SupportTicket[];
      pagination: {
        total: number;
        page: number;
        limit: number;
        pages: number;
      };
    }>('/admin/support-tickets/unassigned', { params });
    return response.data;
  },

  /**
   * Get a support ticket (Admin)
   */
  async getTicketAdmin(ticketId: string) {
    const response = await api.get<SupportTicket>(
      `/admin/support-tickets/${ticketId}`
    );
    return response.data;
  },

  /**
   * Update support ticket (Admin)
   */
  async updateTicket(ticketId: string, payload: {
    status?: string;
    priority?: string;
  }) {
    const response = await api.patch<{ message: string; data: SupportTicket }>(
      `/admin/support-tickets/${ticketId}`,
      payload
    );
    return response.data;
  },

  /**
   * Assign ticket to admin
   */
  async assignTicket(ticketId: string, adminId: string) {
    const response = await api.post<{ message: string; data: SupportTicket }>(
      `/admin/support-tickets/${ticketId}/assign`,
      { admin_id: adminId }
    );
    return response.data;
  },

  /**
   * Send message as admin (JSON or multipart).
   */
  async sendAdminMessage(
    ticketId: string,
    payload: { content: string; files?: File[] },
  ) {
    const { content, files } = payload;
    if (files?.length) {
      const fd = new FormData();
      fd.append('content', content ?? '');
      files.forEach((f) => fd.append('files', f));
      const response = await api.post<{ message: string; data: SupportMessage }>(
        `/admin/support-tickets/${ticketId}/messages`,
        fd,
      );
      return response.data;
    }
    const response = await api.post<{ message: string; data: SupportMessage }>(
      `/admin/support-tickets/${ticketId}/messages`,
      { content: content.trim() },
    );
    return response.data;
  },

  /**
   * Get unread count (Admin)
   */
  async getUnreadCountAdmin() {
    const response = await api.get<{ total_unread: number }>(
      '/admin/support-tickets/unread/count'
    );
    return response.data;
  },
};
