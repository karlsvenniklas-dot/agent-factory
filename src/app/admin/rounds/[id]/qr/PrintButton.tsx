"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="no-print inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl bg-forest-600 text-white text-base font-semibold shadow-button hover:bg-forest-700 active:scale-95 transition-all focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none"
    >
      <Printer className="w-5 h-5" aria-hidden="true" />
      Skriv ut (Cmd+P)
    </button>
  );
}
