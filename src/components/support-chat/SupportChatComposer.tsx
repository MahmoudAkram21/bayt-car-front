import { useRef } from 'react';
import { Send, ImagePlus, Paperclip } from 'lucide-react';
import { Button } from '../ui/button';
import { VoiceNoteRecorderButton } from './VoiceNoteRecorderButton';
import { PendingFilesList, type PendingFilesLabels } from './PendingFilesList';

type Props = {
  messageContent: string;
  onMessageChange: (v: string) => void;
  pendingFiles: File[];
  onPendingFilesChange: (files: File[]) => void;
  onSubmit: () => void;
  disabled?: boolean;
  isSending?: boolean;
  placeholder: string;
  voiceLabels: { record: string; stop: string };
  pendingAttachmentLabels: PendingFilesLabels;
  /** Localized tooltips for attachment toolbar buttons */
  attachmentToolLabels: { attachImage: string; attachFile: string };
};

const MAX_FILES = 5;
const ACCEPT = 'image/jpeg,image/png,image/gif,image/webp,audio/*';

export function SupportChatComposer({
  messageContent,
  onMessageChange,
  pendingFiles,
  onPendingFilesChange,
  onSubmit,
  disabled,
  isSending,
  placeholder,
  voiceLabels,
  pendingAttachmentLabels,
  attachmentToolLabels,
}: Props) {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const next = [...pendingFiles];
    for (let i = 0; i < list.length && next.length < MAX_FILES; i++) {
      next.push(list[i]);
    }
    onPendingFilesChange(next);
  };

  const removeFile = (index: number) => {
    onPendingFilesChange(pendingFiles.filter((_, i) => i !== index));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (disabled || isSending) return;
    if (!messageContent.trim() && pendingFiles.length === 0) return;
    onSubmit();
  };

  const canSend =
    (messageContent.trim().length > 0 || pendingFiles.length > 0) && !disabled && !isSending;

  return (
    <div className="border-t p-4 space-y-2">
      {pendingFiles.length > 0 && (
        <PendingFilesList
          files={pendingFiles}
          onRemove={removeFile}
          labels={pendingAttachmentLabels}
        />
      )}
      <form onSubmit={handleFormSubmit} className="flex flex-wrap items-end gap-2">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          multiple
          className="hidden"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = '';
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled || isSending || pendingFiles.length >= MAX_FILES}
          onClick={() => imageInputRef.current?.click()}
          title={attachmentToolLabels.attachImage}
        >
          <ImagePlus className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={disabled || isSending || pendingFiles.length >= MAX_FILES}
          onClick={() => fileInputRef.current?.click()}
          title={attachmentToolLabels.attachFile}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <VoiceNoteRecorderButton
          disabled={disabled || isSending || pendingFiles.length >= MAX_FILES}
          onRecorded={(file) => {
            if (pendingFiles.length >= MAX_FILES) return;
            onPendingFilesChange([...pendingFiles, file]);
          }}
          labels={voiceLabels}
        />
        <input
          type="text"
          value={messageContent}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled || isSending}
          className="min-w-0 flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <Button type="submit" disabled={!canSend} className="gap-2 shrink-0">
          <Send size={18} />
        </Button>
      </form>
    </div>
  );
}
