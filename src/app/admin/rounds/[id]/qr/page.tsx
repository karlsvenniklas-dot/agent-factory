// QR-utskriftsvy - en A4-sida per station
// Server Component som renderar data, Client Component hanterar QR-rendering
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { QRPrintSheet } from "./QRPrintSheet";
import { PrintButton } from "./PrintButton";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function QRPage({ params }: PageProps) {
  const { id: roundId } = await params;

  const supabase = await createClient();

  const { data: round } = await supabase
    .from("rounds")
    .select("id, name")
    .eq("id", roundId)
    .single();

  if (!round) notFound();

  const { data: stations } = await supabase
    .from("stations")
    .select("id, name, position, qr_token")
    .eq("round_id", roundId)
    .order("position", { ascending: true });

  if (!stations || stations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-bark">Inga stationer finns i denna omgång.</p>
        <Link
          href={`/admin/rounds/${roundId}`}
          className="mt-4 inline-block text-forest-600 underline"
        >
          Tillbaka
        </Link>
      </div>
    );
  }

  // Hämta bas-URL från request headers
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = host.startsWith("localhost") ? "http" : "https";
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? `${protocol}://${host}`;

  return (
    <>
      {/* Kontroller - visas bara på skärm */}
      <div className="no-print mb-6 flex items-center gap-4">
        <Link
          href={`/admin/rounds/${roundId}`}
          className="inline-flex items-center gap-1 text-sm text-bark hover:text-soil min-h-[44px] rounded-lg px-2 focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
          Tillbaka
        </Link>
        <PrintButton />
      </div>

      <QRPrintSheet
        roundName={round.name}
        stations={stations}
        baseUrl={baseUrl}
      />
    </>
  );
}
