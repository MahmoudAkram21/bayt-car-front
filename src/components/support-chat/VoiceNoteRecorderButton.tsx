import { useRef, useState } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '../ui/button';

type Props = {
  onRecorded: (file: File) => void;
  disabled?: boolean;
  labels: { record: string; stop: string };
};

export function VoiceNoteRecorderButton({ onRecorded, disabled, labels }: Props) {
  const [recording, setRecording] = useState(false);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const stopTracks = (stream: MediaStream | null) => {
    stream?.getTracks().forEach((t) => t.stop());
  };

  const start = async () => {
    if (disabled || recording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      const mr = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stopTracks(stream);
        const type = mr.mimeType || 'audio/webm';
        const blob = new Blob(chunksRef.current, { type });
        const ext = type.includes('webm') ? 'webm' : type.includes('mp4') ? 'm4a' : 'webm';
        const file = new File([blob], `voice-${Date.now()}.${ext}`, { type });
        onRecorded(file);
      };
      mr.start(200);
      mediaRef.current = mr;
      setRecording(true);
    } catch (e) {
      console.warn('Microphone access failed', e);
    }
  };

  const stop = () => {
    if (!recording || !mediaRef.current) return;
    mediaRef.current.stop();
    mediaRef.current = null;
    setRecording(false);
  };

  return (
    <Button
      type="button"
      variant={recording ? 'destructive' : 'outline'}
      size="icon"
      disabled={disabled}
      onClick={recording ? stop : start}
      title={recording ? labels.stop : labels.record}
      aria-pressed={recording}
    >
      {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  );
}
