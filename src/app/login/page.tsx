"use client";

// Magic link-inloggning. Ny användare registreras automatiskt vid första login.
// Stöder ?next= för redirect efter auth.

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Mail, Loader2 } from "lucide-react";
import { Suspense } from "react";

function LoginForm() {
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") ?? "/play";

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
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`;

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: callbackUrl,
          shouldCreateUser: true,
        },
      });

      if (error) {
        setError("Kunde inte skicka länken. Kontrollera e-postadressen och försök igen.");
      } else {
        setIsSent(true);
      }
    } catch {
      setError("Något gick fel. Försök igen.");
    } finally {
      setIsLoading(false);
    }
  }

  if (isSent) {
    return (
      <div className="animate-slide-up">
        {/* Envelope illustration */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4" aria-hidden="true">📬</div>
          <h1 className="text-3xl font-display font-bold text-soil mb-3">
            Kolla din inkorg!
          </h1>
          <p className="text-base text-bark leading-relaxed">
            Vi har skickat en länk till{" "}
            <strong className="text-soil">{email}</strong>
          </p>
          <p className="text-base text-bark mt-2">
            Öppna mejlet och klicka på länken för att fortsätta.
          </p>
        </div>

        <button
          onClick={() => {
            setIsSent(false);
          }}
          className="w-full min-h-[56px] px-8 rounded-xl bg-linen border-2 border-forest-600 text-forest-600 text-lg font-semibold transition-all duration-150 hover:bg-forest-pale hover:border-forest-700 active:scale-95 focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Skicka igen
        </button>

        <p className="text-center text-sm text-bark mt-4">
          Fel adress?{" "}
          <button
            onClick={() => { setIsSent(false); setEmail(""); }}
            className="text-forest-600 underline underline-offset-2 hover:text-forest-700"
          >
            Ändra e-post
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Logotyp */}
      <div className="text-center mb-10">
        <div className="text-5xl mb-4" aria-hidden="true">🌲</div>
        <h1 className="text-3xl font-display font-bold text-soil">
          Tipspromenaden
        </h1>
        <p className="text-lg text-forest-600 font-medium">i Kinnared</p>
      </div>

      <p className="text-base text-bark text-center mb-8 leading-relaxed">
        Logga in med din e-post för att börja promenaden.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-2">
          <label
            htmlFor="email"
            className="text-base font-semibold text-soil"
          >
            Din e-postadress
          </label>
          <div className="relative">
            <Mail
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-bark/60"
              aria-hidden="true"
            />
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="namn@exempel.se"
              aria-describedby="email-hint"
              className="w-full min-h-[56px] pl-12 pr-4 rounded-xl bg-white border-2 border-sand text-soil text-lg placeholder:text-bark/60 hover:border-forest-300 focus:outline-none focus:border-forest-600 focus:ring-4 focus:ring-forest-200 transition-colors duration-150"
            />
          </div>
          <p id="email-hint" className="text-sm text-bark">
            Vi skickar en inloggningslänk till denna adress.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-xl bg-brick-pale border border-brick-300 px-4 py-3 text-sm text-brick-700 font-medium"
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          aria-busy={isLoading}
          className="inline-flex items-center justify-center gap-2 min-h-[56px] px-8 rounded-xl bg-forest-600 text-white text-lg font-semibold shadow-button transition-all duration-150 hover:bg-forest-700 hover:shadow-button-hover active:scale-95 active:shadow-none focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
              <span>Skickar...</span>
            </>
          ) : (
            "Skicka magisk länk"
          )}
        </button>

        <p className="text-center text-sm text-bark">
          Inget lösenord behövs. Ny? Du registreras automatiskt.
        </p>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-linen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
