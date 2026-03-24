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
}
export interface SupportMessage {
    id: string;
    ticket_id: string;
    sender_id: string;
    sender_role: 'CLIENT' | 'ADMIN';
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
export declare const supportChatsService: {
    /**
     * Create a new support ticket
     */
    createTicket(payload: {
        service_request_id: string;
        subject: string;
        description: string;
        category: string;
        priority?: string;
    }): Promise<{
        message: string;
        data: SupportTicket;
    }>;
    /**
     * Get a single support ticket
     */
    getTicket(ticketId: string): Promise<SupportTicket>;
    /**
     * List support tickets
     */
    listTickets(params?: {
        status?: string;
        priority?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: SupportTicket[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    /**
     * Send a message in a support ticket (JSON text-only or multipart with images/audio).
     */
    sendMessage(ticketId: string, payload: {
        content: string;
        files?: File[];
    }): Promise<{
        message: string;
        data: SupportMessage;
    }>;
    /**
     * Mark messages as read
     */
    markMessagesAsRead(messageIds: string[]): Promise<{
        message: string;
        updated: number;
    }>;
    /**
     * Get unread count
     */
    getUnreadCount(): Promise<{
        total_unread: number;
    }>;
    /**
     * List all support tickets (Admin)
     */
    listAllTickets(params?: {
        status?: string;
        priority?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        data: SupportTicket[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    /**
     * Get unassigned tickets (Admin)
     */
    getUnassignedTickets(params?: {
        page?: number;
        limit?: number;
    }): Promise<{
        data: SupportTicket[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            pages: number;
        };
    }>;
    /**
     * Get a support ticket (Admin)
     */
    getTicketAdmin(ticketId: string): Promise<SupportTicket>;
    /**
     * Update support ticket (Admin)
     */
    updateTicket(ticketId: string, payload: {
        status?: string;
        priority?: string;
    }): Promise<{
        message: string;
        data: SupportTicket;
    }>;
    /**
     * Assign ticket to admin
     */
    assignTicket(ticketId: string, adminId: string): Promise<{
        message: string;
        data: SupportTicket;
    }>;
    /**
     * Send message as admin (JSON or multipart).
     */
    sendAdminMessage(ticketId: string, payload: {
        content: string;
        files?: File[];
    }): Promise<{
        message: string;
        data: SupportMessage;
    }>;
    /**
     * Get unread count (Admin)
     */
    getUnreadCountAdmin(): Promise<{
        total_unread: number;
    }>;
};
