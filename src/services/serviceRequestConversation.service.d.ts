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
    name?: string | {
        en?: string;
        ar?: string;
    };
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
export declare const serviceRequestConversationService: {
    getMessages(conversationId: string): Promise<ServiceRequestConversationMessage[]>;
};
