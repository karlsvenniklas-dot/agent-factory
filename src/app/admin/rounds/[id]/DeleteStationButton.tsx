"use client";

import { Trash2 } from "lucide-react";

interface Props {
  name: string;
}

export function DeleteStationButton({ name }: Props) {
  return (
    <button
      type="submit"
      className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border-2 border-brick-300 text-brick-600 text-sm font-medium hover:bg-brick-pale hover:border-brick-600 transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-brick-300 focus-visible:outline-none"
      aria-label={`Ta bort ${name}`}
      onClick={(e) => {
        if (!confirm(`Ta bort "${name}"? Detta kan inte ångras.`)) {
          e.preventDefault();
        }
      }}
    >
      <Trash2 className="w-4 h-4" aria-hidden="true" />
      <span className="hidden sm:block">Ta bort</span>
    </button>
  );
}
