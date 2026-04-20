// Admin-dashboard - listar omgångar och ger tillgång till editor.
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Pencil, Printer } from "lucide-react";
import { createRound } from "./actions";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: user } = await supabase.auth.getUser();
  const userId = user.user?.id;

  // Hämta alla omgångar
  const { data: rounds } = await supabase
    .from("rounds")
    .select("id, name, is_active, created_at")
    .order("created_at", { ascending: false });

  // Räkna deltagare per omgång
  const roundIds = rounds?.map((r) => r.id) ?? [];

  // Hämta antal unika deltagare per omgång
  const participantCounts: Record<string, number> = {};
  if (roundIds.length > 0) {
    const { data: counts } = await supabase
      .from("participant_answers")
      .select("round_id, user_id")
      .in("round_id", roundIds);

    if (counts) {
      for (const row of counts) {
        if (!participantCounts[row.round_id]) {
          participantCounts[row.round_id] = 0;
        }
        participantCounts[row.round_id]++;
      }
      // Konvertera till unika per omgång (enklast: räkna rader, bättre vore distinct)
      // Approximation för dashboard - räcker för MVP
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-display font-bold text-soil">Omgångar</h1>

        {/* Server Action via form */}
        <form action={createRound}>
          <input type="hidden" name="user_id" value={userId ?? ""} />
          <button
            type="submit"
            className="inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl bg-forest-600 text-white text-base font-semibold shadow-button transition-all duration-150 hover:bg-forest-700 active:scale-95 focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            Ny omgång
          </button>
        </form>
      </div>

      {rounds && rounds.length > 0 ? (
        <ul className="flex flex-col gap-4">
          {rounds.map((round) => (
            <li key={round.id}>
              <div className="bg-white rounded-2xl shadow-card border border-linen-dark p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-semibold text-soil">
                      {round.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={[
                          "inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full",
                          round.is_active
                            ? "bg-forest-pale text-forest-700 border border-forest-300"
                            : "bg-linen-dark text-bark border border-sand",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "w-1.5 h-1.5 rounded-full",
                            round.is_active ? "bg-forest-600" : "bg-sand",
                          ].join(" ")}
                          aria-hidden="true"
                        />
                        {round.is_active ? "Aktiv" : "Inaktiv"}
                      </span>
                      {participantCounts[round.id] !== undefined && (
                        <span className="text-xs text-bark">
                          {participantCounts[round.id]} svar
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    href={`/admin/rounds/${round.id}`}
                    className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border-2 border-forest-600 text-forest-600 text-sm font-semibold transition-all duration-150 hover:bg-forest-pale active:scale-95 focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none"
                  >
                    <Pencil className="w-4 h-4" aria-hidden="true" />
                    Redigera
                  </Link>
                  <Link
                    href={`/admin/rounds/${round.id}/qr`}
                    className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border-2 border-sand text-bark text-sm font-semibold transition-all duration-150 hover:bg-linen-dark hover:border-bark active:scale-95 focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none"
                  >
                    <Printer className="w-4 h-4" aria-hidden="true" />
                    QR-koder
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="bg-white rounded-2xl shadow-card border border-linen-dark p-12 text-center">
          <div className="text-4xl mb-4" aria-hidden="true">📋</div>
          <p className="text-base text-bark">Inga omgångar skapade ännu.</p>
          <p className="text-sm text-bark/60 mt-1">
            Klicka på knappen ovan för att komma igång.
          </p>
        </div>
      )}
    </div>
  );
}
