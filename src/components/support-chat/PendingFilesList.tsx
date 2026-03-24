import { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { VoiceMessageBar } from './VoiceMessageBar';

export type PendingFilesLabels = {
  remove: string;
  voicePreview: string;
};

type Props = {
  files: File[];
  onRemove: (index: number) => void;
  labels: PendingFilesLabels;
};

function isAudioFile(file: File): boolean {
  return file.type.startsWith('audio/');
}

/**
 * Shows pending attachments before send. Audio files get an inline preview player via blob URLs (revoked on cleanup).
 */
export function PendingFilesList({ files, onRemove, labels }: Props) {
  const filesKey = useMemo(
    () => files.map((f) => `${f.name}:${f.size}:${f.lastModified}:${f.type}`).join('|'),
    [files],
  );

  const audioUrls = useMemo(
    () => files.map((f) => (isAudioFile(f) ? URL.createObjectURL(f) : null)),
    [filesKey, files],
  );

  useEffect(() => {
    return () => {
      audioUrls.forEach((u) => {
        if (u) URL.revokeObjectURL(u);
      });
    };
  }, [audioUrls]);

  if (files.length === 0) return null;

  return (
    <ul className="flex w-full flex-col gap-2 text-xs text-gray-600 dark:text-gray-300">
      {files.map((file, i) => {
        const key = `${file.name}-${file.size}-${file.lastModified}-${i}`;
        if (isAudioFile(file) && audioUrls[i]) {
          return (
            <li key={key} className="flex w-full min-w-0 items-start gap-2">
              <span className="sr-only">{labels.voicePreview}</span>
              <div className="min-w-0 flex-1">
                <VoiceMessageBar src={audioUrls[i]!} tone="pending" />
              </div>
              <button
                type="button"
                className="mt-2 shrink-0 rounded-full p-1.5 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600"
                onClick={() => onRemove(i)}
                aria-label={labels.remove}
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            </li>
          );
        }

        return (
          <li
            key={key}
            className="flex max-w-full items-center gap-1 rounded-md bg-gray-100 px-2 py-1 dark:bg-gray-700 sm:inline-flex sm:w-auto"
          >
            <span className="max-w-[min(100%,140px)] truncate">{file.name}</span>
            <button
              type="button"
              className="rounded p-0.5 hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => onRemove(i)}
              aria-label={labels.remove}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </li>
        );
      })}
    </ul>
  );
}
