import type { SpotifyTrackInfo } from "@/types/game";

const SPOTIFY_API = "https://api.spotify.com/v1";

export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // ms epoch
}

const STORAGE_KEY = "spotify_quiz_auth";

export function loadAuth(): StoredAuth | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredAuth;
  } catch {
    return null;
  }
}

export function saveAuth(auth: StoredAuth): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
}

export function clearAuth(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export async function refreshAccessToken(refreshToken: string): Promise<StoredAuth> {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
  if (!clientId) throw new Error("NEXT_PUBLIC_SPOTIFY_CLIENT_ID saknas");

  const params = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
  });

  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params.toString(),
  });
  if (!res.ok) throw new Error(`Refresh misslyckades (${res.status})`);
  const data = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token ?? refreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

export async function getValidAccessToken(): Promise<string | null> {
  const auth = loadAuth();
  if (!auth) return null;
  const fiveMin = 5 * 60 * 1000;
  if (auth.expiresAt - Date.now() > fiveMin) return auth.accessToken;
  try {
    const refreshed = await refreshAccessToken(auth.refreshToken);
    saveAuth(refreshed);
    return refreshed.accessToken;
  } catch {
    clearAuth();
    return null;
  }
}

export function extractPlaylistId(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) return null;
  // Acceptera ren id, spotify-URI eller URL.
  if (/^[A-Za-z0-9]{22}$/.test(trimmed)) return trimmed;
  const uriMatch = trimmed.match(/^spotify:playlist:([A-Za-z0-9]{22})$/);
  if (uriMatch) return uriMatch[1];
  const urlMatch = trimmed.match(/playlist\/([A-Za-z0-9]{22})/);
  if (urlMatch) return urlMatch[1];
  return null;
}

interface SpotifyPlaylistTrackResponse {
  items: Array<{
    track: {
      id: string;
      name: string;
      uri: string;
      preview_url: string | null;
      artists: Array<{ name: string }>;
      album: { images: Array<{ url: string }> };
      is_local?: boolean;
    } | null;
  }>;
  next: string | null;
}

export async function fetchPlaylistTracks(
  playlistId: string,
  accessToken: string,
): Promise<SpotifyTrackInfo[]> {
  const tracks: SpotifyTrackInfo[] = [];
  let url: string | null =
    `${SPOTIFY_API}/playlists/${playlistId}/tracks?limit=100&fields=items(track(id,name,uri,preview_url,is_local,artists(name),album(images))),next`;

  while (url) {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Spotify API ${res.status}: ${body}`);
    }
    const data = (await res.json()) as SpotifyPlaylistTrackResponse;
    for (const item of data.items) {
      const t = item.track;
      if (!t || t.is_local || !t.id) continue;
      tracks.push({
        id: t.id,
        name: t.name,
        uri: t.uri,
        previewUrl: t.preview_url,
        artists: t.artists.map((a) => a.name),
        albumArt: t.album.images[0]?.url ?? null,
      });
    }
    url = data.next;
  }
  return tracks;
}

interface SpotifyPlaylistMetaResponse {
  name: string;
  description: string | null;
  images: Array<{ url: string }>;
  owner: { display_name: string };
  tracks: { total: number };
}

export async function fetchPlaylistMeta(
  playlistId: string,
  accessToken: string,
): Promise<{
  name: string;
  description: string | null;
  image: string | null;
  owner: string;
  total: number;
}> {
  const res = await fetch(`${SPOTIFY_API}/playlists/${playlistId}?fields=name,description,images,owner.display_name,tracks.total`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error(`Spotify API ${res.status}`);
  const data = (await res.json()) as SpotifyPlaylistMetaResponse;
  return {
    name: data.name,
    description: data.description,
    image: data.images[0]?.url ?? null,
    owner: data.owner.display_name,
    total: data.tracks.total,
  };
}

export async function transferPlaybackToDevice(
  accessToken: string,
  deviceId: string,
): Promise<void> {
  const res = await fetch(`${SPOTIFY_API}/me/player`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ device_ids: [deviceId], play: false }),
  });
  if (!res.ok && res.status !== 202 && res.status !== 204) {
    throw new Error(`Transfer playback failed (${res.status})`);
  }
}

export async function playTrack(
  accessToken: string,
  deviceId: string,
  uri: string,
  positionMs = 0,
): Promise<void> {
  const res = await fetch(`${SPOTIFY_API}/me/player/play?device_id=${deviceId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ uris: [uri], position_ms: positionMs }),
  });
  if (!res.ok && res.status !== 202 && res.status !== 204) {
    const body = await res.text();
    throw new Error(`Play failed (${res.status}): ${body}`);
  }
}

export async function pausePlayback(accessToken: string): Promise<void> {
  await fetch(`${SPOTIFY_API}/me/player/pause`, {
    method: "PUT",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}
