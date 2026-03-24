import { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { cn } from '../../lib/utils';

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

type Tone = 'outgoing' | 'incoming' | 'pending';

const shell: Record<Tone, string> = {
  outgoing:
    'bg-blue-200/70 text-blue-900/90 dark:bg-blue-900/45 dark:text-blue-100',
  incoming: 'bg-gray-200/90 text-gray-800 dark:bg-gray-700/90 dark:text-gray-100',
  pending:
    'bg-blue-200/70 text-blue-900/90 dark:bg-blue-900/45 dark:text-blue-100',
};

const playBtn: Record<Tone, string> = {
  outgoing: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
  incoming: 'bg-gray-600 text-white hover:bg-gray-700 dark:bg-gray-500',
  pending: 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500',
};

const progressFill: Record<Tone, string> = {
  outgoing: 'bg-blue-600 dark:bg-blue-400',
  incoming: 'bg-gray-600 dark:bg-gray-400',
  pending: 'bg-blue-600 dark:bg-blue-400',
};

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
export function VoiceMessageBar({
  src,
  tone,
  className,
  playLabel = 'Play',
  pauseLabel = 'Pause',
}: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onLoaded = () => setDuration(a.duration || 0);
    const onTime = () => setCurrent(a.currentTime);
    const onEnded = () => {
      setPlaying(false);
      setCurrent(0);
    };
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    a.addEventListener('loadedmetadata', onLoaded);
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnded);
    a.addEventListener('play', onPlay);
    a.addEventListener('pause', onPause);
    return () => {
      a.removeEventListener('loadedmetadata', onLoaded);
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('ended', onEnded);
      a.removeEventListener('play', onPlay);
      a.removeEventListener('pause', onPause);
    };
  }, [src]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) void a.play().catch(() => setPlaying(false));
    else a.pause();
  };

  const pct = duration > 0 ? Math.min(100, (current / duration) * 100) : 0;

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current;
    if (!a || !duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const next = (x / rect.width) * duration;
    a.currentTime = Math.max(0, Math.min(duration, next));
    setCurrent(a.currentTime);
  };

  const displayTime =
    playing || current > 0.5 ? formatDuration(current) : formatDuration(duration);

  const bars = 28;
  return (
    <div
      className={cn(
        'flex w-full min-w-0 max-w-full items-center gap-2 rounded-2xl px-2 py-1.5',
        shell[tone],
        className,
      )}
    >
      <audio ref={audioRef} src={src} preload="metadata" playsInline className="hidden" />
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-full shadow-sm transition-transform active:scale-95',
          playBtn[tone],
        )}
        aria-label={playing ? pauseLabel : playLabel}
      >
        {playing ? <Pause className="h-4 w-4" strokeWidth={2.5} /> : <Play className="ms-0.5 h-4 w-4" strokeWidth={2.5} />}
      </button>

      <div className="min-w-0 flex-1">
        <div
          className="mb-1 flex h-7 items-end justify-between gap-[2px] opacity-80"
          aria-hidden
        >
          {Array.from({ length: bars }, (_, i) => (
            <div
              key={i}
              className="w-[3px] max-w-[4px] flex-1 rounded-full bg-current opacity-50"
              style={{
                height: `${28 + Math.abs(Math.sin(i * 0.55)) * 72}%`,
              }}
            />
          ))}
        </div>
        <button
          type="button"
          className="relative h-1.5 w-full cursor-pointer rounded-full bg-black/10 dark:bg-white/15"
          onClick={seek}
          aria-label="Seek"
        >
          <span
            className={cn('absolute inset-y-0 left-0 rounded-full', progressFill[tone])}
            style={{ width: `${pct}%` }}
          />
        </button>
      </div>

      <span className="w-11 shrink-0 text-end text-[11px] font-medium tabular-nums opacity-90">
        {displayTime}
      </span>
    </div>
  );
}
