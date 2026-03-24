export type PendingFilesLabels = {
    remove: string;
    voicePreview: string;
};
type Props = {
    files: File[];
    onRemove: (index: number) => void;
    labels: PendingFilesLabels;
};
/**
 * Shows pending attachments before send. Audio files get an inline preview player via blob URLs (revoked on cleanup).
 */
export declare function PendingFilesList({ files, onRemove, labels }: Props): import("react/jsx-runtime").JSX.Element | null;
export {};
