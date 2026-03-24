import type { SupportAttachment } from '../../services/supportChats.service';
import { resolveUploadFileUrl } from '../../lib/resolveUploadUrl';
import { VoiceMessageBar } from './VoiceMessageBar';

type Tone = 'outgoing' | 'incoming';

type Props = {
  attachments: SupportAttachment[];
  /** Voice bubble: matches message side (WhatsApp-style). */
  tone?: Tone;
};

export function SupportMessageAttachments({ attachments, tone = 'incoming' }: Props) {
  if (!attachments?.length) return null;

  return (
    <div className="mt-2 flex flex-col gap-2">
      {attachments.map((a) => {
        const url = resolveUploadFileUrl(a.file_url);
        if (a.file_type.startsWith('image/')) {
          return (
            <a
              key={a.id}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="block overflow-hidden rounded-lg"
            >
              <img
                src={url}
                alt={a.file_name}
                className="max-h-56 max-w-full rounded-lg object-contain"
                loading="lazy"
              />
            </a>
          );
        }
        if (a.file_type.startsWith('audio/')) {
          return (
            <VoiceMessageBar key={a.id} src={url} tone={tone} className="mt-0.5" />
          );
        }
        return (
          <a
            key={a.id}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium underline break-all"
          >
            {a.file_name}
          </a>
        );
      })}
    </div>
  );
}
