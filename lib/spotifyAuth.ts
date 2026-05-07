import { generateCodeChallenge, generateCodeVerifier, generateRandomString } from "./pkce";

const SCOPES = [
  "streaming",
  "user-read-email",
  "user-read-private",
  "user-modify-playback-state",
  "user-read-playback-state",
  "playlist-read-private",
  "playlist-read-collaborative",
];

export async function startSpotifyLogin(returnTo: string): Promise<void> {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    alert(
      "Spotify-konfiguration saknas. Skapa .env.local från .env.example och fyll i NEXT_PUBLIC_SPOTIFY_CLIENT_ID samt NEXT_PUBLIC_SPOTIFY_REDIRECT_URI.",
    );
    return;
  }

  const verifier = generateCodeVerifier();
  const challenge = await generateCodeChallenge(verifier);
  const state = generateRandomString();

  sessionStorage.setItem("spotify_oauth_verifier", verifier);
  sessionStorage.setItem("spotify_oauth_state", state);
  sessionStorage.setItem("spotify_oauth_return", returnTo);

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    redirect_uri: redirectUri,
    scope: SCOPES.join(" "),
    code_challenge_method: "S256",
    code_challenge: challenge,
    state,
  });

  window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
}
