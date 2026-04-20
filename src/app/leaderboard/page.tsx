// Rankingvy - visar poängställning för aktiv/avslutad omgång.
// Placeholder för Fas 2.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function LeaderboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-center text-2xl font-bold text-forest-700">
          Ranking
        </h1>
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-400">Inga resultat ännu.</p>
          <p className="mt-1 text-xs text-gray-300">
            (Fas 2: live-ranking med RPC get_ranking())
          </p>
        </div>
      </div>
    </main>
  );
}
