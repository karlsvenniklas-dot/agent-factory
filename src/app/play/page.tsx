// Deltagarflöde - visar aktiv omgång och stationer användaren ännu inte besvarat.
// Placeholder för Fas 2.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function PlayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-forest-700">
          Tipspromenaden Kinnared
        </h1>
        <p className="mt-3 text-gray-600">
          Scanna QR-koden vid varje station för att besvara frågor.
        </p>

        {/* Placeholder - ersätts i Fas 2 med aktiv omgångsvy */}
        <div className="mt-8 rounded-xl border-2 border-dashed border-gray-200 p-8">
          <p className="text-sm text-gray-400">
            Ingen aktiv omgång just nu.
          </p>
          <p className="mt-1 text-xs text-gray-300">
            (Fas 2: stationslista + progress)
          </p>
        </div>
      </div>
    </main>
  );
}
