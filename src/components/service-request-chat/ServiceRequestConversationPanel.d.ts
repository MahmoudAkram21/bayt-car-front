import { type ServiceRequestConversationMessage } from '../../services/serviceRequestConversation.service';
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
export declare function ServiceRequestConversationPanel({ conversationId, messages, isLoading, errorMessage, customerName, providerName, customerIds, providerIds, }: Props): import("react/jsx-runtime").JSX.Element;
export {};
