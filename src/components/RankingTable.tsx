import type { RankingEntry } from "@/lib/types";

interface RankingTableProps {
  entries: RankingEntry[];
  currentUserId?: string;
  totalStations?: number;
}

const MEDALS = ["🥇", "🥈", "🥉"];

export function RankingTable({
  entries,
  currentUserId,
  totalStations,
}: RankingTableProps) {
  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-bark">
        Inga deltagare ännu. Var den första att svara!
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2" role="list" aria-label="Rankinglista">
      {entries.map((entry) => {
        const isMe = entry.user_id === currentUserId;
        const rankIndex = Number(entry.rank) - 1;
        const medal = rankIndex < 3 ? MEDALS[rankIndex] : null;
        const displayName = entry.display_name ?? "Anonym";
        const maxScore = totalStations ?? entry.answered_stations;

        return (
          <div
            key={entry.user_id}
            role="listitem"
            className={[
              "flex items-center gap-3 p-3 rounded-xl border shadow-card",
              isMe
                ? "border-forest-400 bg-forest-pale"
                : "bg-white border-linen-dark",
            ].join(" ")}
            aria-current={isMe ? "true" : undefined}
          >
            {/* Placering */}
            <div className="w-10 text-center flex-shrink-0">
              {medal ? (
                <span className="text-xl" aria-label={`Plats ${rankIndex + 1}`}>
                  {medal}
                </span>
              ) : (
                <span className="text-lg font-bold text-bark">
                  {entry.rank}
                </span>
              )}
            </div>

            {/* Avatar-initial */}
            <div
              className="w-10 h-10 rounded-full bg-linen-dark border-2 border-sand flex items-center justify-center flex-shrink-0"
              aria-hidden="true"
            >
              <span className="text-sm font-bold text-bark">
                {displayName.charAt(0).toUpperCase()}
              </span>
            </div>

            {/* Namn */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-base font-medium text-soil truncate">
                  {displayName}
                </span>
                {isMe && (
                  <span className="text-xs bg-forest-600 text-white px-2 py-0.5 rounded-full flex-shrink-0">
                    Du
                  </span>
                )}
              </div>
              <span className="text-xs text-bark">
                {entry.answered_stations} av {maxScore} stationer
              </span>
            </div>

            {/* Poäng */}
            <div className="text-right flex-shrink-0">
              <span className="text-base font-semibold text-forest-600">
                {entry.correct_answers}/{maxScore}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
