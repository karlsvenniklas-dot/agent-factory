// Admin-vy för en enskild omgång: stationer, frågor, QR-utskrift.
// Placeholder för Fas 2.
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function RoundPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: round } = await supabase
    .from("rounds")
    .select("*, stations(*, questions(*))")
    .eq("id", id)
    .single();

  if (!round) {
    notFound();
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">{round.name}</h1>
        {round.description && (
          <p className="mt-1 text-sm text-gray-500">{round.description}</p>
        )}
      </div>

      <div className="rounded-xl border-2 border-dashed border-gray-200 p-12 text-center">
        <p className="text-gray-400">Stationer och frågor laddas här.</p>
        <p className="mt-1 text-xs text-gray-300">
          (Fas 2: RoundEditor + QRPrintSheet)
        </p>
      </div>
    </div>
  );
}
