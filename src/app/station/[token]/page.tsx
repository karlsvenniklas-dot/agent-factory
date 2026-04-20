// QR-scanning entry point. URL: /station/[token]
// Server Component: hämtar station + fråga, kontrollerar om redan svarat.
// Client Component (StationClient) hanterar interaktiviteten.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { StationClient } from "./StationClient";
import { ParticipantHeader } from "@/components/Header";
import type { QuestionOptions } from "@/lib/types";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function StationPage({ params }: PageProps) {
  const { token } = await params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/station/${token}`);
  }

  // Hämta station via qr_token
  const { data: station, error: stationError } = await supabase
    .from("stations")
    .select("id, name, position, round_id")
    .eq("qr_token", token)
    .single();

  if (stationError || !station) {
    return (
      <main className="min-h-screen bg-linen">
        <ParticipantHeader showBack backHref="/play" />
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="text-5xl mb-6" aria-hidden="true">🤔</div>
          <h1 className="text-2xl font-display font-bold text-soil mb-3">
            Hoppsan!
          </h1>
          <p className="text-base text-bark leading-relaxed mb-8">
            Den här QR-koden verkar inte vara giltig. Kontrollera att du
            skannat rätt station, eller fråga arrangören.
          </p>
          <a
            href="/play"
            className="inline-flex items-center justify-center gap-2 min-h-[56px] px-8 rounded-xl bg-forest-600 text-white text-lg font-semibold shadow-button hover:bg-forest-700 transition-all duration-150 active:scale-95"
          >
            Tillbaka till översikt
          </a>
        </div>
      </main>
    );
  }

  // Hämta aktiv omgång och kontrollera att stationens omgång är aktiv
  const { data: round } = await supabase
    .from("rounds")
    .select("id, name, is_active")
    .eq("id", station.round_id)
    .eq("is_active", true)
    .single();

  if (!round) {
    return (
      <main className="min-h-screen bg-linen">
        <ParticipantHeader showBack backHref="/play" />
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="text-5xl mb-6" aria-hidden="true">😴</div>
          <h1 className="text-2xl font-display font-bold text-soil mb-3">
            Omgången är inte aktiv
          </h1>
          <p className="text-base text-bark leading-relaxed mb-8">
            Den här stationen tillhör en omgång som inte är aktiv just nu.
            Fråga arrangören när nästa omgång startar!
          </p>
          <a
            href="/play"
            className="inline-flex items-center justify-center gap-2 min-h-[56px] px-8 rounded-xl bg-forest-600 text-white text-lg font-semibold shadow-button hover:bg-forest-700 transition-all duration-150 active:scale-95"
          >
            Tillbaka till översikt
          </a>
        </div>
      </main>
    );
  }

  // Kontrollera om användaren redan svarat på denna station
  const { data: existingAnswer } = await supabase
    .from("participant_answers")
    .select("id, is_correct, selected_index")
    .eq("user_id", user.id)
    .eq("round_id", round.id)
    .eq("station_id", station.id)
    .single();

  if (existingAnswer) {
    // Redan svarat - visa info och skicka tillbaka
    return (
      <main className="min-h-screen bg-linen">
        <ParticipantHeader showBack backHref="/play" />
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="text-5xl mb-6" aria-hidden="true">✅</div>
          <h1 className="text-2xl font-display font-bold text-soil mb-3">
            Redan svarat!
          </h1>
          <p className="text-base text-bark leading-relaxed mb-8">
            Du har redan svarat på den här frågan. Gå vidare till nästa
            station!
          </p>
          <a
            href="/play"
            className="inline-flex items-center justify-center gap-2 min-h-[56px] px-8 rounded-xl bg-forest-600 text-white text-lg font-semibold shadow-button hover:bg-forest-700 transition-all duration-150 active:scale-95"
          >
            Tillbaka till översikt
          </a>
        </div>
      </main>
    );
  }

  // Hämta fråga via questions_public-vyn (utan correct_index)
  const { data: question } = await supabase
    .from("questions_public")
    .select("id, station_id, text, options")
    .eq("station_id", station.id)
    .single();

  if (!question) {
    return (
      <main className="min-h-screen bg-linen">
        <ParticipantHeader showBack backHref="/play" />
        <div className="max-w-md mx-auto px-4 py-12 text-center">
          <div className="text-5xl mb-6" aria-hidden="true">🔧</div>
          <h1 className="text-2xl font-display font-bold text-soil mb-3">
            Frågan saknas
          </h1>
          <p className="text-base text-bark leading-relaxed mb-8">
            Den här stationen har ingen fråga ännu. Fråga arrangören!
          </p>
          <a
            href="/play"
            className="inline-flex items-center justify-center gap-2 min-h-[56px] px-8 rounded-xl bg-forest-600 text-white text-lg font-semibold shadow-button hover:bg-forest-700 transition-all duration-150 active:scale-95"
          >
            Tillbaka till översikt
          </a>
        </div>
      </main>
    );
  }

  // Räkna antal stationer i omgången för progressbar
  const { count: totalStations } = await supabase
    .from("stations")
    .select("id", { count: "exact", head: true })
    .eq("round_id", round.id);

  // Räkna hur många stationer användaren svarat på
  const { count: answeredCount } = await supabase
    .from("participant_answers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("round_id", round.id);

  // Hämta profil för display_name
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .single();

  return (
    <main className="min-h-screen bg-linen">
      <ParticipantHeader
        displayName={profile?.display_name}
        showBack
        backHref="/play"
      />
      <StationClient
        stationId={station.id}
        stationName={station.name}
        stationPosition={station.position}
        questionText={question.text}
        questionOptions={question.options as QuestionOptions}
        totalStations={totalStations ?? 10}
        answeredSoFar={answeredCount ?? 0}
      />
    </main>
  );
}
