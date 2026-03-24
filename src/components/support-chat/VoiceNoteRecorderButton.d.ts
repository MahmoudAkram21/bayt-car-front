type Props = {
    onRecorded: (file: File) => void;
    disabled?: boolean;
    labels: {
        record: string;
        stop: string;
    };
};
export declare function VoiceNoteRecorderButton({ onRecorded, disabled, labels }: Props): import("react/jsx-runtime").JSX.Element;
export {};
