// Deltagaröversikt - visar aktiv omgång, progress och avklarade stationer.
// Server Component.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ParticipantHeader } from "@/components/Header";
import { ProgressBar } from "@/components/ProgressBar";
import Link from "next/link";
import { CheckCircle2, Circle, Trophy } from "lucide-react";

export default async function PlayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Hämta profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.display_name ?? user.email?.split("@")[0] ?? "du";

  // Hämta aktiv omgång
  const { data: round } = await supabase
    .from("rounds")
    .select("id, name, description")
    .eq("is_active", true)
    .single();

  if (!round) {
    return (
      <main className="min-h-screen bg-linen">
        <ParticipantHeader displayName={displayName} />
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="text-5xl mb-6" aria-hidden="true">😴</div>
          <h1 className="text-2xl font-display font-bold text-soil mb-3">
            Ingen aktiv omgång just nu
          </h1>
          <p className="text-base text-bark leading-relaxed">
            Promenaden är inte igång just nu. Kom tillbaka när nästa omgång
            startar!
          </p>
        </div>
      </main>
    );
  }

  // Hämta alla stationer i omgången
  const { data: stations } = await supabase
    .from("stations")
    .select("id, name, position")
    .eq("round_id", round.id)
    .order("position", { ascending: true });

  // Hämta användarens svar för denna omgång
  const { data: myAnswers } = await supabase
    .from("participant_answers")
    .select("station_id, is_correct")
    .eq("user_id", user.id)
    .eq("round_id", round.id);

  const answeredStationIds = new Set(myAnswers?.map((a) => a.station_id) ?? []);
  const totalStations = stations?.length ?? 0;
  const answeredCount = answeredStationIds.size;
  const allDone = answeredCount >= totalStations && totalStations > 0;

  // Om alla stationer klara → redirect till leaderboard
  if (allDone) {
    redirect(`/leaderboard?round=${round.id}`);
  }

  return (
    <main className="min-h-screen bg-linen pb-32">
      <ParticipantHeader displayName={displayName} />

      <div className="max-w-md mx-auto px-4 py-8 flex flex-col gap-8 animate-fade-in">
        {/* Hälsning */}
        <section>
          <h1 className="text-2xl font-display font-bold text-soil">
            Hej {displayName}!{" "}
            <span aria-hidden="true">👋</span>
          </h1>
          <p className="text-base text-bark mt-1">{round.name}</p>
        </section>

        {/* Progress */}
        <section aria-label="Din progress">
          <ProgressBar answered={answeredCount} total={totalStations} />
        </section>

        {/* Instruktion */}
        <section className="bg-white rounded-2xl shadow-card border border-linen-dark p-6">
          <p className="text-base text-soil leading-relaxed">
            Skanna nästa QR-kod med din kamera för att fortsätta promenaden.
          </p>

          <a
            href="https://support.apple.com/sv-se/HT208843"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 min-h-[56px] w-full justify-center rounded-xl bg-forest-600 text-white text-lg font-semibold shadow-button transition-all duration-150 hover:bg-forest-700 active:scale-95 focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2 focus-visible:outline-none"
            aria-label="Instruktioner för att öppna kameran"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
              <line x1="3" y1="15" x2="21" y2="15" />
              <line x1="9" y1="3" x2="9" y2="21" />
              <line x1="15" y1="3" x2="15" y2="21" />
            </svg>
            Skanna QR-kod
          </a>
          <p className="text-xs text-bark text-center mt-3">
            Öppna kameraappen och rikta mot QR-koden vid stationen
          </p>
        </section>

        {/* Stationslista */}
        {stations && stations.length > 0 && (
          <section aria-label="Stationer du klarat">
            <h2 className="text-sm font-semibold text-bark uppercase tracking-wide mb-3">
              Stationer du klarat
            </h2>
            <ul className="flex flex-col gap-2">
              {stations.map((station) => {
                const isDone = answeredStationIds.has(station.id);
                return (
                  <li
                    key={station.id}
                    className={[
                      "flex items-center gap-3 px-4 py-3 rounded-xl border",
                      isDone
                        ? "bg-forest-pale border-forest-200 text-forest-700"
                        : "bg-white border-linen-dark text-bark",
                    ].join(" ")}
                  >
                    {isDone ? (
                      <CheckCircle2
                        className="w-5 h-5 text-forest-600 flex-shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <Circle
                        className="w-5 h-5 text-sand flex-shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span className="text-base font-medium">
                      {station.position}. {station.name}
                    </span>
                    {isDone && (
                      <span className="sr-only">- avklarad</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        {/* Länk till leaderboard */}
        {answeredCount > 0 && (
          <Link
            href={`/leaderboard?round=${round.id}`}
            className="flex items-center justify-center gap-2 text-forest-600 text-base font-medium underline underline-offset-2 hover:text-forest-700 min-h-[44px] focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none rounded-lg"
          >
            <Trophy className="w-4 h-4" aria-hidden="true" />
            Se resultat så här långt
          </Link>
        )}
      </div>
    </main>
  );
}
