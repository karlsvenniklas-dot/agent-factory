// Callback från Supabase magic link.
// Supabase skickar hit med en code-parameter som byts mot en session.
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // next-parametern används för att redirecta tillbaka till ursprunglig URL
  const next = searchParams.get("next") ?? "/play";

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error) {
        // Redirect till play-sidan (eller ursprunglig destination)
        return NextResponse.redirect(`${origin}${next}`);
      }
    } catch {
      // Supabase-fel, redirect till login med felmeddelande
    }
  }

  // Misslyckad callback - redirect till login med felindikator
  return NextResponse.redirect(`${origin}/login?error=callback_failed`);
}
