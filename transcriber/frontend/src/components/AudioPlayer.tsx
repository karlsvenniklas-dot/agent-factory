import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, Volume2 } from "lucide-react";

interface Props {
  src: string;
  currentTime?: number;
  onTimeUpdate?: (t: number) => void;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ src, currentTime, onTimeUpdate }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [time, setTime] = useState(0);
  const [volume, setVolume] = useState(1);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onMeta = () => setDuration(a.duration);
    const onTime = () => {
      setTime(a.currentTime);
      onTimeUpdate?.(a.currentTime);
    };
    const onEnded = () => setPlaying(false);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("ended", onEnded);
    return () => {
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("ended", onEnded);
    };
  }, [onTimeUpdate]);

  useEffect(() => {
    if (currentTime !== undefined && audioRef.current) {
      audioRef.current.currentTime = currentTime;
      audioRef.current.play();
      setPlaying(true);
    }
  }, [currentTime]);

  const togglePlay = () => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play(); setPlaying(true); }
  };

  const seek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const t = parseFloat(e.target.value);
    if (audioRef.current) audioRef.current.currentTime = t;
    setTime(t);
  };

  return (
    <div className="bg-gray-800 border-t border-gray-700 px-6 py-3 flex items-center gap-4">
      <audio ref={audioRef} src={src} preload="metadata" />
      <button
        onClick={togglePlay}
        className="w-9 h-9 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center shrink-0 transition-colors"
      >
        {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>
      <div className="flex items-center gap-2 text-xs text-gray-400 shrink-0">
        <span>{formatTime(time)}</span>
        <span>/</span>
        <span>{formatTime(duration)}</span>
      </div>
      <input
        type="range"
        min={0}
        max={duration || 1}
        step={0.1}
        value={time}
        onChange={seek}
        className="flex-1 h-1 accent-indigo-500 cursor-pointer"
      />
      <div className="flex items-center gap-2 shrink-0">
        <Volume2 className="w-4 h-4 text-gray-400" />
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={volume}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setVolume(v);
            if (audioRef.current) audioRef.current.volume = v;
          }}
          className="w-16 h-1 accent-indigo-500 cursor-pointer"
        />
      </div>
    </div>
  );
}
