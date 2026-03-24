type Tone = 'outgoing' | 'incoming' | 'pending';
type Props = {
    src: string;
    tone: Tone;
    className?: string;
    playLabel?: string;
    pauseLabel?: string;
};
/**
 * WhatsApp-style voice row: play, waveform strip, scrub bar, duration.
 */
export declare function VoiceMessageBar({ src, tone, className, playLabel, pauseLabel, }: Props): import("react/jsx-runtime").JSX.Element;
export {};
