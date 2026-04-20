// Server-side Supabase-klient.
// Använd denna i Server Components, Route Handlers och Server Actions.
// Hanterar cookies för session-persistence automatiskt.
// OBS: Generics läggs till när vi kör `npx supabase gen types typescript` mot riktig DB.
import { createServerClient } from "@supabase/ssr";
import type { CookieOptions } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

type CookieWithOptions = { name: string; value: string; options: CookieOptions };

export async function createClient() {
  const cookieStore = await cookies();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Saknar Supabase-miljövariabler. Kopiera .env.local.example till .env.local och fyll i värden."
    );
  }

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieWithOptions[]) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // setAll anropas ibland från Server Components där cookies är readonly.
          // Det är OK - middleware sköter session-refresh.
        }
      },
    },
  });
}

// Admin-klient med service role - BARA för server-side admin-operationer.
// Bypasser RLS, använd med försiktighet.
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Saknar SUPABASE_SERVICE_ROLE_KEY. Lägg till i .env.local (aldrig i klient-kod!)."
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
