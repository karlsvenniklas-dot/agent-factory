// Next.js middleware - körs på varje request för att refresha Supabase-sessionen.
// Skyddade routes hanteras här via redirect till /login.
import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Routes som kräver inloggning
const protectedPaths = ["/play", "/leaderboard", "/station", "/admin"];


export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Refresha session - returnerar response med uppdaterade cookies
  const response = await updateSession(request);

  // Enkel path-kontroll för auth-skydd.
  // Faktisk user-check sker i respektive Server Component för bättre UX.
  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  if (isProtected) {
    // Kontrollera om session-cookie finns (snabb check utan DB-anrop)
    const hasSession =
      request.cookies.has("sb-access-token") ||
      // Supabase SSR använder projekt-specifikt cookie-namn
      [...request.cookies.getAll()].some(
        (c) => c.name.includes("auth-token") || c.name.startsWith("sb-")
      );

    if (!hasSession) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Kör middleware på alla paths utom Next.js-internals och statiska filer
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
