import type { SupportMessage } from '../../services/supportChats.service';
type Props = {
    messages: SupportMessage[];
    /** Admin detail: admin on the right. Client detail: client on the right. */
    isAdminView: boolean;
};
export declare function SupportChatMessages({ messages, isAdminView }: Props): import("react/jsx-runtime").JSX.Element;
export {};
