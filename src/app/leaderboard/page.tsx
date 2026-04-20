// Rankingvy - visar poängställning för aktiv omgång.
// Server Component. Highlightar inloggad användares rad.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ParticipantHeader } from "@/components/Header";
import { RankingTable } from "@/components/RankingTable";
import Link from "next/link";
import type { RankingEntry } from "@/lib/types";

interface PageProps {
  searchParams: Promise<{ round?: string }>;
}

export default async function LeaderboardPage({ searchParams }: PageProps) {
  const { round: roundParam } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/leaderboard");
  }

  // Hämta profil
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  const displayName = profile?.display_name ?? user.email?.split("@")[0] ?? "du";

  // Välj omgång: explicit param eller aktiv
  let roundId = roundParam;
  let roundName = "";

  if (roundId) {
    const { data: r } = await supabase
      .from("rounds")
      .select("id, name")
      .eq("id", roundId)
      .single();
    roundName = r?.name ?? "";
  } else {
    const { data: r } = await supabase
      .from("rounds")
      .select("id, name")
      .eq("is_active", true)
      .single();
    roundId = r?.id;
    roundName = r?.name ?? "";
  }

  if (!roundId) {
    return (
      <main className="min-h-screen bg-linen">
        <ParticipantHeader displayName={displayName} showBack backHref="/play" />
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="text-5xl mb-6" aria-hidden="true">🏆</div>
          <h1 className="text-2xl font-display font-bold text-soil mb-3">
            Inga resultat ännu
          </h1>
          <p className="text-base text-bark">
            Det finns ingen aktiv omgång med resultat just nu.
          </p>
          <Link
            href="/play"
            className="inline-flex items-center justify-center gap-2 mt-8 min-h-[56px] px-8 rounded-xl bg-forest-600 text-white text-lg font-semibold shadow-button hover:bg-forest-700 transition-all duration-150 active:scale-95"
          >
            Tillbaka
          </Link>
        </div>
      </main>
    );
  }

  // Hämta ranking via RPC
  const { data: rankingData } = await supabase.rpc("get_ranking", {
    round_uuid: roundId,
  });

  const entries: RankingEntry[] = (rankingData ?? []) as RankingEntry[];

  // Hämta total antal stationer för att visa maxpoäng
  const { count: totalStations } = await supabase
    .from("stations")
    .select("id", { count: "exact", head: true })
    .eq("round_id", roundId);

  // Min progress
  const myEntry = entries.find((e) => e.user_id === user.id);
  const myRank = myEntry?.rank;
  const allDone = myEntry && Number(myEntry.answered_stations) >= (totalStations ?? 0);

  return (
    <main className="min-h-screen bg-linen pb-8">
      <ParticipantHeader
        displayName={displayName}
        showBack
        backHref="/play"
      />

      <div className="max-w-md mx-auto px-4 py-8 flex flex-col gap-6 animate-fade-in">
        {/* Header */}
        <section className="text-center">
          <div className="text-4xl mb-3" aria-hidden="true">🏆</div>
          <h1 className="text-3xl font-display font-bold text-soil">
            {allDone ? "Klart!" : "Ranking"}
          </h1>
          <p className="text-base text-bark mt-2">{roundName}</p>
          {entries.length > 0 && (
            <p className="text-sm text-bark mt-1">
              {entries.length} deltagare
            </p>
          )}
        </section>

        {/* Min score om klar */}
        {allDone && myEntry && (
          <div className="bg-forest-pale border-2 border-forest-400 rounded-2xl p-6 text-center animate-fanfare">
            <p className="text-lg font-semibold text-forest-700">
              Du fick{" "}
              <strong className="text-2xl">
                {myEntry.correct_answers} av {totalStations ?? myEntry.answered_stations}
              </strong>{" "}
              rätt!
            </p>
            {myRank && (
              <p className="text-base text-soil mt-2">
                Din placering:{" "}
                <strong className="text-forest-700">#{myRank}</strong>
              </p>
            )}
          </div>
        )}

        {/* Rankingtabell */}
        <RankingTable
          entries={entries}
          currentUserId={user.id}
          totalStations={totalStations ?? undefined}
        />

        {/* Footer-text om klar */}
        {allDone && (
          <div className="text-center text-sm text-bark leading-relaxed pt-4 border-t border-linen-dark">
            <p>Tack för att du gick tipspromenaden!</p>
            <p className="mt-1">
              När en ny omgång publiceras kan du gå promenaden igen.
            </p>
          </div>
        )}

        {/* Tillbaka om inte klar */}
        {!allDone && (
          <Link
            href="/play"
            className="inline-flex items-center justify-center gap-2 w-full min-h-[56px] px-8 rounded-xl bg-linen border-2 border-forest-600 text-forest-600 text-lg font-semibold transition-all duration-150 hover:bg-forest-pale hover:border-forest-700 active:scale-95 focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            Fortsätt promenaden
          </Link>
        )}
      </div>
    </main>
  );
}
