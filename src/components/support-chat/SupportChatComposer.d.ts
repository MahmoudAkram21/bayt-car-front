import { type PendingFilesLabels } from './PendingFilesList';
type Props = {
    messageContent: string;
    onMessageChange: (v: string) => void;
    pendingFiles: File[];
    onPendingFilesChange: (files: File[]) => void;
    onSubmit: () => void;
    disabled?: boolean;
    isSending?: boolean;
    placeholder: string;
    voiceLabels: {
        record: string;
        stop: string;
    };
    pendingAttachmentLabels: PendingFilesLabels;
    /** Localized tooltips for attachment toolbar buttons */
    attachmentToolLabels: {
        attachImage: string;
        attachFile: string;
    };
};
export declare function SupportChatComposer({ messageContent, onMessageChange, pendingFiles, onPendingFilesChange, onSubmit, disabled, isSending, placeholder, voiceLabels, pendingAttachmentLabels, attachmentToolLabels, }: Props): import("react/jsx-runtime").JSX.Element;
export {};
