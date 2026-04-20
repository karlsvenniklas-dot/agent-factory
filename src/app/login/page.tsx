"use client";

// Magic link-inloggning. Ny användare registreras automatiskt vid första login.
// En profil skapas via DB-trigger (se migration) vid första auth.

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Mail, Loader2, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          // Skicka tillbaka till /auth/callback som hanterar sessionen
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          // Ny användare skapas automatiskt om e-posten inte finns
          shouldCreateUser: true,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setIsSent(true);
      }
    } catch {
      setError("Något gick fel. Försök igen.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logotyp/titel */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-forest-700">
            Tipspromenaden
          </h1>
          <p className="mt-1 text-sm text-gray-500">Kinnared</p>
        </div>

        {isSent ? (
          <div className="rounded-xl border border-forest-200 bg-forest-50 p-6 text-center">
            <CheckCircle className="mx-auto mb-3 h-10 w-10 text-forest-500" />
            <h2 className="font-semibold text-forest-800">Kolla din e-post!</h2>
            <p className="mt-2 text-sm text-gray-600">
              Vi har skickat en inloggningslänk till{" "}
              <span className="font-medium">{email}</span>. Klicka på länken
              för att logga in.
            </p>
            <button
              onClick={() => {
                setIsSent(false);
                setEmail("");
              }}
              className="mt-4 text-sm text-forest-600 underline hover:text-forest-800"
            >
              Använd annan e-postadress
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-sm font-medium text-gray-700"
              >
                E-postadress
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="din@epost.se"
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isLoading || !email}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-forest-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-forest-700 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Skickar...
                </>
              ) : (
                "Skicka inloggningslänk"
              )}
            </button>

            <p className="text-center text-xs text-gray-500">
              Ny användare? Du registreras automatiskt vid första inloggningen.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
