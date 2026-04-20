// Progressbar med träd-ikoner - en gran per avklarad station

interface ProgressBarProps {
  answered: number;
  total: number;
}

function TreeIcon({ state }: { state: "done" | "active" | "upcoming" }) {
  const colors = {
    done: "#2D5016",
    active: "#D4A017",
    upcoming: "#C4B49E",
  };
  return (
    <svg
      width="20"
      height="24"
      viewBox="0 0 20 24"
      aria-hidden="true"
      className={[
        state === "done" && "animate-tree-grow",
        state === "upcoming" && "opacity-50",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {/* Stam */}
      <rect x="8" y="18" width="4" height="6" fill={colors[state]} rx="1" />
      {/* Nedre lager */}
      <polygon points="10,4 2,18 18,18" fill={colors[state]} />
      {/* Mitten-lager */}
      <polygon points="10,1 3,13 17,13" fill={colors[state]} />
      {/* Topp */}
      <polygon points="10,0 5,8 15,8" fill={colors[state]} />
    </svg>
  );
}

export function ProgressBar({ answered, total }: ProgressBarProps) {
  // Visa max 10 träd - skalat om total > 10
  const displayTotal = Math.min(total, 10);
  const scale = total > 10 ? total / 10 : 1;
  const displayAnswered = Math.min(Math.round(answered / scale), displayTotal);

  return (
    <div className="flex flex-col gap-2 w-full">
      <span className="sr-only">
        Station {answered} av {total} avklarad
      </span>
      <div className="flex items-end gap-1 justify-center h-10" role="img" aria-hidden="true">
        {Array.from({ length: displayTotal }, (_, i) => {
          let state: "done" | "active" | "upcoming";
          if (i < displayAnswered) {
            state = "done";
          } else if (i === displayAnswered && answered < total) {
            state = "active";
          } else {
            state = "upcoming";
          }
          return (
            <div key={i} className="flex flex-col items-center justify-end">
              <TreeIcon state={state} />
            </div>
          );
        })}
      </div>
      <p className="text-sm text-bark text-center">
        {answered} av {total} stationer
      </p>
    </div>
  );
}
