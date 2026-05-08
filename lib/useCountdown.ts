"use client";

import { useEffect, useState } from "react";

// Synkad nedräkning: räknar ned mot roundStartedAt + durationMs.
// Returnerar { remainingMs, fraction (0..1), expired }.
export function useCountdown(
  startedAt: number | null,
  durationMs: number,
): { remainingMs: number; fraction: number; expired: boolean } {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    if (!startedAt) return;
    let raf = 0;
    const tick = () => {
      setNow(Date.now());
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [startedAt]);

  if (!startedAt) {
    return { remainingMs: durationMs, fraction: 1, expired: false };
  }
  const elapsed = now - startedAt;
  const remaining = Math.max(0, durationMs - elapsed);
  return {
    remainingMs: remaining,
    fraction: Math.max(0, Math.min(1, remaining / durationMs)),
    expired: remaining <= 0,
  };
}
