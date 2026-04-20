"use client";

import { useState } from "react";

interface Props {
  roundId?: string;
  initialActive: boolean;
}

// Hanterar is_active checkbox -> hidden input som skickas med form
export function ActiveToggleClient({ initialActive }: Props) {
  const [isActive, setIsActive] = useState(initialActive);

  return (
    <>
      {/* Visuell toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={isActive}
          aria-label="Aktiv omgång"
          onClick={() => setIsActive(!isActive)}
          className={[
            "relative w-11 h-6 rounded-full border-2 transition-colors focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none",
            isActive
              ? "bg-forest-600 border-forest-600"
              : "bg-linen-dark border-sand",
          ].join(" ")}
        >
          <span
            className={[
              "absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform",
              isActive ? "translate-x-5" : "translate-x-0",
            ].join(" ")}
          />
        </button>
        <span
          className="text-base font-medium text-soil cursor-pointer"
          onClick={() => setIsActive(!isActive)}
        >
          Aktiv omgång
        </span>
      </div>

      {/* Hidden input som skickas med form-submit */}
      <input type="hidden" name="is_active" value={isActive ? "true" : "false"} />
    </>
  );
}
