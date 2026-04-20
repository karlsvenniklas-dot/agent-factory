// Browser-side Supabase-klient.
// Använd denna i Client Components ('use client').
// OBS: Generics läggs till när vi kör `npx supabase gen types typescript` mot riktig DB.
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Saknar Supabase-miljövariabler. Kopiera .env.local.example till .env.local och fyll i värden."
    );
  }

  return createBrowserClient(url, key);
}
