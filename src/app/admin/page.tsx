// Admin-dashboard - listar omgångar och ger tillgång till editor.
// Placeholder för Fas 2.
import { createClient } from "@/lib/supabase/server";
import { Plus } from "lucide-react";

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: rounds } = await supabase
    .from("rounds")
    .select("id, name, is_active, created_at")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Omgångar</h1>
        {/* Knapp för att skapa ny omgång - funktionalitet i Fas 2 */}
        <button className="flex items-center gap-1.5 rounded-lg bg-forest-600 px-3 py-2 text-sm font-medium text-white hover:bg-forest-700">
          <Plus className="h-4 w-4" />
          Ny omgång
        </button>
      </div>

      {rounds && rounds.length > 0 ? (
        <ul className="space-y-2">
          {rounds.map((round) => (
            <li key={round.id}>
              <a
                href={`/admin/rounds/${round.id}`}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 hover:border-forest-300 hover:shadow-sm transition"
              >
                <span className="font-medium text-gray-800">{round.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    round.is_active
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {round.is_active ? "Aktiv" : "Inaktiv"}
                </span>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
          <p className="text-gray-400">Inga omgångar skapade ännu.</p>
          <p className="mt-1 text-xs text-gray-300">
            (Fas 2: skapa omgång med stationer och frågor)
          </p>
        </div>
      )}
    </div>
  );
}
