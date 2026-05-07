"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveAuth } from "@/lib/spotify";

export default function CallbackPage() {
  return (
    <Suspense fallback={<p className="text-white/70">Loggar in mot Spotify…</p>}>
      <CallbackInner />
    </Suspense>
  );
}

// PKCE-flödet återvänder hit. Vi byter authorization code mot tokens
// direkt från webbläsaren (ingen client_secret krävs).
function CallbackInner() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = params.get("code");
    const state = params.get("state");
    const errParam = params.get("error");
    if (errParam) {
      setError(`Spotify nekade inloggning: ${errParam}`);
      return;
    }
    if (!code) {
      setError("Saknar authorization code");
      return;
    }

    const storedState = sessionStorage.getItem("spotify_oauth_state");
    const verifier = sessionStorage.getItem("spotify_oauth_verifier");
    const returnTo = sessionStorage.getItem("spotify_oauth_return") ?? "/";
    if (!verifier || !storedState || storedState !== state) {
      setError("State-mismatch — försök igen");
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
    if (!clientId || !redirectUri) {
      setError("Spotify-miljövariabler saknas");
      return;
    }

    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: verifier,
    });

    fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`Token-utbyte misslyckades (${res.status})`);
        return res.json();
      })
      .then((data: { access_token: string; refresh_token: string; expires_in: number }) => {
        saveAuth({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: Date.now() + data.expires_in * 1000,
        });
        sessionStorage.removeItem("spotify_oauth_state");
        sessionStorage.removeItem("spotify_oauth_verifier");
        sessionStorage.removeItem("spotify_oauth_return");
        router.replace(returnTo);
      })
      .catch((err: Error) => setError(err.message));
  }, [params, router]);

  return (
    <div className="card mx-auto max-w-md text-center">
      {error ? (
        <>
          <h2 className="mb-2 text-xl font-bold text-red-400">Inloggningsfel</h2>
          <p className="text-sm text-white/70">{error}</p>
          <a href="/" className="btn-secondary mt-6 inline-flex">
            Tillbaka
          </a>
        </>
      ) : (
        <p className="text-white/70">Loggar in mot Spotify…</p>
      )}
    </div>
  );
}
