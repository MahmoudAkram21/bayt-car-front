import type { SupportAttachment } from '../../services/supportChats.service';
type Tone = 'outgoing' | 'incoming';
type Props = {
    attachments: SupportAttachment[];
    /** Voice bubble: matches message side (WhatsApp-style). */
    tone?: Tone;
};
export declare function SupportMessageAttachments({ attachments, tone }: Props): import("react/jsx-runtime").JSX.Element | null;
export {};
