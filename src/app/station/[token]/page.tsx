// QR-scanning entry point. URL: /station/[token]
// Deltagaren skannar QR -> hamnar här -> ser frågan för stationen.
// Placeholder för Fas 2.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
    // Spara destination så användaren kommer tillbaka efter login
    redirect(`/login?next=/station/${token}`);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <p className="text-sm text-gray-400">Station: {token}</p>
          <p className="mt-1 text-xs text-gray-300">
            (Fas 2: visa fråga + svarsalternativ)
          </p>
        </div>
      </div>
    </main>
  );
}
