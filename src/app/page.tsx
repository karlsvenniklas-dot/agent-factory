// Landingpage - redirectar baserat på auth-status.
// Inloggad -> /play, Utloggad -> /login
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  let isAuthenticated = false;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    isAuthenticated = !!user;
  } catch {
    // Supabase env-vars saknas (t.ex. under lokal dev utan .env.local)
    // Fallback till login-sidan
    isAuthenticated = false;
  }

  if (isAuthenticated) {
    redirect("/play");
  } else {
    redirect("/login");
  }
}
