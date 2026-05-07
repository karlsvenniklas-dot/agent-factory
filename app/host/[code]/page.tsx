"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRoom } from "@/lib/useRoom";
import { getPlayerId } from "@/lib/playerId";
import {
  clearAuth,
  extractPlaylistId,
  fetchPlaylistMeta,
  fetchPlaylistTracks,
  getValidAccessToken,
} from "@/lib/spotify";
import { startSpotifyLogin } from "@/lib/spotifyAuth";
import type { SpotifyTrackInfo } from "@/types/game";

const SpotifyPlayer = dynamic(() => import("@/components/SpotifyPlayer"), { ssr: false });

interface PageProps {
  params: { code: string };
}

const DEFAULT_PLAYLIST = process.env.NEXT_PUBLIC_DEFAULT_PLAYLIST_ID ?? "1x6HoQHp7B6jUIqA3zSzgC";
const SNIPPET_MS = 15000;

export default function HostPage({ params }: PageProps) {
  const code = params.code.toUpperCase();
  const { state, send, connected, error } = useRoom(code);

  const [playerId, setPlayerId] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [tracks, setTracks] = useState<SpotifyTrackInfo[] | null>(null);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [playlistMeta, setPlaylistMeta] = useState<{
    name: string;
    image: string | null;
    owner: string;
    total: number;
  } | null>(null);
  const [playlistInput, setPlaylistInput] = useState(DEFAULT_PLAYLIST);
  const [playlistError, setPlaylistError] = useState<string | null>(null);
  const [hostName, setHostName] = useState("Värd");
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [premiumError, setPremiumError] = useState(false);

  // Engångs-init: läs persistent player-id, hämta token om det finns.
  useEffect(() => {
    setPlayerId(getPlayerId());
    getValidAccessToken().then((t) => {
      setToken(t);
      setTokenChecked(true);
    });
  }, []);

  // När vi har player-id + connection: claima värd-rollen.
  useEffect(() => {
    if (!connected || !playerId) return;
    send({ type: "host_claim", playerId, name: hostName });
  }, [connected, playerId, hostName, send]);

  const playableTracks = useMemo(
    () => (tracks ?? []).filter((t) => t.uri),
    [tracks],
  );

  const remainingTracks = useMemo(() => {
    if (!state) return playableTracks;
    return playableTracks.filter((t) => !state.trackHistory.includes(t.id));
  }, [playableTracks, state]);

  async function handleLoadPlaylist() {
    setPlaylistError(null);
    const id = extractPlaylistId(playlistInput);
    if (!id) {
      setPlaylistError("Ogiltig spellist-URL eller id");
      return;
    }
    if (!token) return;
    setLoadingTracks(true);
    try {
      const [meta, items] = await Promise.all([
        fetchPlaylistMeta(id, token),
        fetchPlaylistTracks(id, token),
      ]);
      setPlaylistMeta(meta);
      setTracks(items);
      send({ type: "reset" });
    } catch (e) {
      setPlaylistError((e as Error).message);
    } finally {
      setLoadingTracks(false);
    }
  }

  function pickRandomTrack(): SpotifyTrackInfo | null {
    if (remainingTracks.length === 0) return null;
    return remainingTracks[Math.floor(Math.random() * remainingTracks.length)];
  }

  async function handlePlayNext() {
    if (!deviceId || !token) return;
    const track = pickRandomTrack();
    if (!track) return;
    send({ type: "start_round", track });
    const player = (window as unknown as {
      __spotifyQuizPlayer?: { play: (uri: string, ms?: number) => Promise<void>; pause: () => Promise<void> };
    }).__spotifyQuizPlayer;
    await player?.play(track.uri, 30000);
    // Auto-paus efter snutt-tid.
    setTimeout(() => {
      player?.pause();
    }, SNIPPET_MS);
  }

  function handleReveal() {
    send({ type: "reveal" });
    const player = (window as unknown as { __spotifyQuizPlayer?: { pause: () => Promise<void> } }).__spotifyQuizPlayer;
    player?.pause();
  }

  function handleNextRound() {
    send({ type: "next_round" });
  }

  function handleAward(targetPlayerId: string, points: number) {
    send({ type: "award", playerId: targetPlayerId, points });
  }

  function handleResetScores() {
    if (!confirm("Nollställa alla poäng och historik?")) return;
    send({ type: "reset" });
  }

  const handleReady = useCallback((id: string) => setDeviceId(id), []);
  const handlePremiumError = useCallback(() => setPremiumError(true), []);

  // -------- Render --------

  if (!tokenChecked) {
    return <p className="text-white/60">Initierar…</p>;
  }

  if (!token) {
    return (
      <div className="card mx-auto max-w-lg text-center">
        <h2 className="text-2xl font-bold">Logga in med Spotify</h2>
        <p className="mt-2 text-white/70">
          Som värd behöver du ett Spotify Premium-konto. Snuttarna spelas på
          den enhet du sitter vid nu.
        </p>
        <button
          onClick={() => startSpotifyLogin(`/host/${code}`)}
          className="btn-primary mt-6"
        >
          Logga in med Spotify
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <RoomHeader code={code} connected={connected} state={state} />

      {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">{error}</div>}
      {premiumError && (
        <div className="rounded-xl border border-yellow-500/40 bg-yellow-500/10 p-3 text-sm text-yellow-300">
          Spotify Web Playback SDK kräver Premium. Logga in med ett Premium-konto för att spela full uppspelning.
        </div>
      )}

      <SpotifyPlayer
        accessToken={token}
        onReady={handleReady}
        onPremiumError={handlePremiumError}
      />

      {!playlistMeta ? (
        <section className="card space-y-3">
          <h2 className="text-xl font-bold">Välj spellista</h2>
          <p className="text-sm text-white/60">
            Klistra in en Spotify playlist-URL eller låt det vara fyllt med standard-spellistan.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              value={playlistInput}
              onChange={(e) => setPlaylistInput(e.target.value)}
              placeholder="https://open.spotify.com/playlist/..."
              className="input flex-1"
            />
            <button
              onClick={handleLoadPlaylist}
              disabled={loadingTracks}
              className="btn-primary"
            >
              {loadingTracks ? "Laddar…" : "Ladda spellista"}
            </button>
          </div>
          {playlistError && <p className="text-sm text-red-400">{playlistError}</p>}
          <button
            onClick={() => {
              clearAuth();
              setToken(null);
            }}
            className="btn-ghost text-xs"
          >
            Logga ut Spotify
          </button>
        </section>
      ) : (
        <PlaylistSummary
          meta={playlistMeta}
          remaining={remainingTracks.length}
          total={playableTracks.length}
          onChange={() => {
            setPlaylistMeta(null);
            setTracks(null);
          }}
        />
      )}

      {state && (
        <PlayersPanel
          state={state}
          onKick={(id) => send({ type: "kick", playerId: id })}
        />
      )}

      {state && playlistMeta && (
        <GameControls
          state={state}
          remaining={remainingTracks.length}
          deviceReady={Boolean(deviceId)}
          onPlayNext={handlePlayNext}
          onReveal={handleReveal}
          onNextRound={handleNextRound}
          onReset={handleResetScores}
        />
      )}

      {state && state.phase !== "idle" && state.currentTrack && (
        <RoundPanel state={state} onAward={handleAward} />
      )}

      {state && <Leaderboard state={state} />}
    </div>
  );
}

function RoomHeader({
  code,
  connected,
  state,
}: {
  code: string;
  connected: boolean;
  state: ReturnType<typeof useRoom>["state"];
}) {
  return (
    <div className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-widest text-white/40">Rumkod</p>
        <p className="text-5xl font-black tracking-widest text-spotify-green">{code}</p>
        <p className="mt-1 text-sm text-white/60">
          Be spelarna att gå till{" "}
          <code className="rounded bg-white/10 px-1">/play/{code}</code> på sin
          enhet.
        </p>
      </div>
      <div className="flex flex-col items-end gap-1 text-xs">
        <span className={`pill ${connected ? "" : "opacity-50"}`}>
          <span className={`h-2 w-2 rounded-full ${connected ? "bg-spotify-green" : "bg-red-500"}`} />
          {connected ? "Ansluten" : "Frånkopplad"}
        </span>
        {state && (
          <span className="text-white/50">
            {state.players.filter((p) => !p.isHost).length} spelare ·{" "}
            {state.teams.length} lag
          </span>
        )}
      </div>
    </div>
  );
}

function PlaylistSummary({
  meta,
  remaining,
  total,
  onChange,
}: {
  meta: { name: string; image: string | null; owner: string; total: number };
  remaining: number;
  total: number;
  onChange: () => void;
}) {
  return (
    <section className="card flex items-center gap-4">
      {meta.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={meta.image} alt="" className="h-20 w-20 rounded-lg" />
      )}
      <div className="flex-1">
        <h3 className="font-bold">{meta.name}</h3>
        <p className="text-sm text-white/60">av {meta.owner}</p>
        <p className="text-xs text-white/40">
          {remaining} spelbara kvar av {total} ({meta.total} i spellistan totalt)
        </p>
      </div>
      <button onClick={onChange} className="btn-ghost text-xs">
        Byt spellista
      </button>
    </section>
  );
}

function PlayersPanel({
  state,
  onKick,
}: {
  state: NonNullable<ReturnType<typeof useRoom>["state"]>;
  onKick: (id: string) => void;
}) {
  const players = state.players.filter((p) => !p.isHost);
  if (players.length === 0) {
    return (
      <section className="card">
        <h3 className="font-bold">Väntar på spelare…</h3>
        <p className="text-sm text-white/60">
          Spelarna går till <code>/play/{state.code}</code> och anger sitt namn.
        </p>
      </section>
    );
  }
  return (
    <section className="card">
      <h3 className="font-bold">Spelare ({players.length})</h3>
      <ul className="mt-3 grid gap-2 sm:grid-cols-2">
        {players.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2 text-sm"
          >
            <span className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${p.connected ? "bg-spotify-green" : "bg-white/30"}`} />
              <span className="font-semibold">{p.name}</span>
              {p.team && <span className="pill">{p.team}</span>}
            </span>
            <button onClick={() => onKick(p.id)} className="text-xs text-white/40 hover:text-red-400">
              Ta bort
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function GameControls({
  state,
  remaining,
  deviceReady,
  onPlayNext,
  onReveal,
  onNextRound,
  onReset,
}: {
  state: NonNullable<ReturnType<typeof useRoom>["state"]>;
  remaining: number;
  deviceReady: boolean;
  onPlayNext: () => void;
  onReveal: () => void;
  onNextRound: () => void;
  onReset: () => void;
}) {
  return (
    <section className="card flex flex-wrap items-center justify-between gap-3">
      <div>
        <p className="text-xs uppercase text-white/40">Runda</p>
        <p className="text-2xl font-bold">{state.round}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {state.phase === "idle" && (
          <button
            onClick={onPlayNext}
            disabled={!deviceReady || remaining === 0}
            className="btn-primary"
          >
            ▶ Spela nästa låt ({remaining} kvar)
          </button>
        )}
        {state.phase === "playing" && (
          <button onClick={onReveal} className="btn-primary">
            Visa svar
          </button>
        )}
        {state.phase === "reveal" && (
          <button onClick={onNextRound} className="btn-primary">
            Nästa runda
          </button>
        )}
        <button onClick={onReset} className="btn-ghost text-xs">
          Nollställ allt
        </button>
      </div>
    </section>
  );
}

function RoundPanel({
  state,
  onAward,
}: {
  state: NonNullable<ReturnType<typeof useRoom>["state"]>;
  onAward: (id: string, points: number) => void;
}) {
  const track = state.currentTrack;
  if (!track) return null;
  const revealed = state.phase === "reveal";

  return (
    <section className="card space-y-4">
      <div className="flex items-center gap-4">
        {track.albumArt && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={track.albumArt}
            alt=""
            className={`h-24 w-24 rounded-lg transition ${revealed ? "" : "blur-2xl saturate-150"}`}
          />
        )}
        <div className="flex-1">
          <p className="text-xs uppercase tracking-widest text-white/40">
            {revealed ? "Rätt svar" : "Spelar nu"}
          </p>
          <p className={`text-2xl font-bold ${revealed ? "" : "blur-md select-none"}`}>{track.name}</p>
          <p className={`text-sm text-white/60 ${revealed ? "" : "blur-md select-none"}`}>
            {track.artists.join(", ")}
          </p>
        </div>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold uppercase text-white/40">
          Gissningar ({state.guesses.length})
        </h4>
        {state.guesses.length === 0 ? (
          <p className="text-sm text-white/50">Inga gissningar än…</p>
        ) : (
          <ul className="space-y-2">
            {[...state.guesses]
              .sort((a, b) => a.submittedAt - b.submittedAt)
              .map((g) => (
                <li
                  key={g.playerId}
                  className="flex flex-wrap items-center gap-2 rounded-lg bg-black/40 px-3 py-2"
                >
                  <span className="font-semibold">{g.playerName}</span>
                  {g.team && <span className="pill">{g.team}</span>}
                  <span className="flex-1 italic text-white/80">"{g.text}"</span>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((pts) => (
                      <button
                        key={pts}
                        onClick={() => onAward(g.playerId, pts)}
                        className={`h-8 w-8 rounded-full text-sm font-bold transition ${
                          g.awarded === pts
                            ? "bg-spotify-green text-black"
                            : "bg-white/10 hover:bg-white/20"
                        }`}
                        title={pts === 0 ? "Fel" : pts === 1 ? "1 poäng" : "2 poäng"}
                      >
                        {pts}
                      </button>
                    ))}
                  </div>
                </li>
              ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function Leaderboard({
  state,
}: {
  state: NonNullable<ReturnType<typeof useRoom>["state"]>;
}) {
  const players = [...state.players]
    .filter((p) => !p.isHost)
    .sort((a, b) => b.score - a.score);
  if (players.length === 0) return null;

  // Aggregera per lag.
  const teamScores = new Map<string, number>();
  for (const p of players) {
    if (!p.team) continue;
    if (!teamScores.has(p.team)) teamScores.set(p.team, p.score);
  }
  const teams = [...teamScores.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <section className="card">
      <h3 className="font-bold">Poängtavla</h3>
      {teams.length > 0 && (
        <div className="mt-3">
          <p className="text-xs uppercase text-white/40">Lag</p>
          <ul className="mt-1 space-y-1">
            {teams.map(([name, score], idx) => (
              <li
                key={name}
                className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2"
              >
                <span className="font-semibold">
                  {idx + 1}. {name}
                </span>
                <span className="text-spotify-green">{score} p</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="mt-3">
        <p className="text-xs uppercase text-white/40">Spelare</p>
        <ul className="mt-1 space-y-1">
          {players.map((p, idx) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-lg bg-black/40 px-3 py-2 text-sm"
            >
              <span>
                {idx + 1}. {p.name}
                {p.team && <span className="ml-2 text-white/40">({p.team})</span>}
              </span>
              <span className="font-bold text-spotify-green">{p.score}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
