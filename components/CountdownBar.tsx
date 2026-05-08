"use client";

import { useCountdown } from "@/lib/useCountdown";

interface Props {
  startedAt: number | null;
  durationMs: number;
  showSeconds?: boolean;
}

export default function CountdownBar({ startedAt, durationMs, showSeconds = true }: Props) {
  const { remainingMs, fraction, expired } = useCountdown(startedAt, durationMs);
  const seconds = Math.ceil(remainingMs / 1000);
  const color = expired
    ? "bg-red-500"
    : fraction < 0.3
      ? "bg-yellow-400"
      : "bg-spotify-green";

  return (
    <div className="space-y-1">
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className={`h-full ${color} transition-[width] duration-100 ease-linear`}
          style={{ width: `${fraction * 100}%` }}
        />
      </div>
      {showSeconds && (
        <div className="flex items-center justify-between text-xs text-white/50">
          <span>{expired ? "Tid ute" : "Snutt + gissningstid"}</span>
          <span className="tabular-nums font-bold text-white">{seconds}s</span>
        </div>
      )}
    </div>
  );
}
