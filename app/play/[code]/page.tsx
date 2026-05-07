"use client";

import { useEffect, useMemo, useState } from "react";
import { useRoom } from "@/lib/useRoom";
import { getPlayerId } from "@/lib/playerId";

interface PageProps {
  params: { code: string };
}

const NAME_KEY = "spotify_quiz_name";
const TEAM_KEY = "spotify_quiz_team";

export default function PlayPage({ params }: PageProps) {
  const code = params.code.toUpperCase();
  const { state, send, connected, error } = useRoom(code);

  const [playerId, setPlayerId] = useState("");
  const [name, setName] = useState("");
  const [team, setTeam] = useState("");
  const [joined, setJoined] = useState(false);
  const [guess, setGuess] = useState("");

  useEffect(() => {
    setPlayerId(getPlayerId());
    if (typeof window !== "undefined") {
      setName(window.localStorage.getItem(NAME_KEY) ?? "");
      setTeam(window.localStorage.getItem(TEAM_KEY) ?? "");
    }
  }, []);

  // Återanslut automatiskt om vi redan är registrerade i state.
  useEffect(() => {
    if (!state || !playerId || joined) return;
    const me = state.players.find((p) => p.id === playerId);
    if (me) {
      setJoined(true);
      setName(me.name);
      setTeam(me.team ?? "");
    }
  }, [state, playerId, joined]);

  const me = useMemo(() => {
    if (!state || !playerId) return null;
    return state.players.find((p) => p.id === playerId) ?? null;
  }, [state, playerId]);

  const myGuess = useMemo(() => {
    if (!state || !playerId) return null;
    return state.guesses.find((g) => g.playerId === playerId) ?? null;
  }, [state, playerId]);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const cleanName = name.trim().slice(0, 24);
    const cleanTeam = team.trim().slice(0, 24) || null;
    if (!cleanName) return;
    window.localStorage.setItem(NAME_KEY, cleanName);
    if (cleanTeam) window.localStorage.setItem(TEAM_KEY, cleanTeam);
    else window.localStorage.removeItem(TEAM_KEY);
    send({ type: "join", playerId, name: cleanName, team: cleanTeam });
    setJoined(true);
  }

  function handleSubmitGuess(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = guess.trim();
    if (!cleaned) return;
    send({ type: "submit_guess", playerId, text: cleaned });
  }

  if (!connected) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <p className="text-white/70">Ansluter till rum {code}…</p>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </div>
    );
  }

  if (!joined) {
    return (
      <div className="card mx-auto max-w-md">
        <h2 className="text-2xl font-bold">Gå med i rum {code}</h2>
        <form onSubmit={handleJoin} className="mt-4 space-y-3">
          <div>
            <label className="text-xs uppercase text-white/40">Ditt namn</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input mt-1"
              placeholder="Vad heter du?"
              maxLength={24}
              required
              autoFocus
            />
          </div>
          <div>
            <label className="text-xs uppercase text-white/40">Lag (frivilligt)</label>
            <input
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="input mt-1"
              placeholder="t.ex. Bananerna"
              maxLength={24}
            />
            {state && state.teams.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {state.teams.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTeam(t)}
                    className="pill hover:border-spotify-green"
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button type="submit" className="btn-primary w-full">
            Hoppa in
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <header className="card flex items-center justify-between">
        <div>
          <p className="text-xs uppercase text-white/40">Rum</p>
          <p className="text-3xl font-black tracking-widest text-spotify-green">{code}</p>
        </div>
        <div className="text-right text-sm">
          <p className="font-semibold">{me?.name}</p>
          {me?.team && <p className="text-white/50">Lag: {me.team}</p>}
          <p className="text-spotify-green">{me?.score ?? 0} p</p>
        </div>
      </header>

      {state && state.phase === "idle" && (
        <section className="card text-center">
          <p className="text-white/70">Väntar på värden…</p>
          <p className="mt-2 text-xs text-white/40">
            När musiken börjar kommer ett gissningsfält upp här.
          </p>
        </section>
      )}

      {state && state.phase === "playing" && (
        <section className="card space-y-4">
          <div className="text-center">
            <div className="mx-auto h-32 w-32 animate-pulse rounded-full bg-gradient-to-br from-spotify-green to-emerald-700" />
            <p className="mt-4 font-bold">Lyssna och gissa!</p>
            <p className="text-sm text-white/50">Vad är låten?</p>
          </div>
          <form onSubmit={handleSubmitGuess} className="flex gap-2">
            <input
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              className="input flex-1"
              placeholder="Skriv låttitel…"
              maxLength={120}
              autoFocus
            />
            <button type="submit" className="btn-primary">
              Skicka
            </button>
          </form>
          {myGuess && (
            <p className="text-sm text-white/60">
              Din gissning: <span className="italic">"{myGuess.text}"</span>{" "}
              {myGuess.awarded > 0 && (
                <span className="text-spotify-green">+{myGuess.awarded} p</span>
              )}
            </p>
          )}
        </section>
      )}

      {state && state.phase === "reveal" && state.currentTrack && (
        <section className="card space-y-3 text-center">
          {state.currentTrack.albumArt && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={state.currentTrack.albumArt}
              alt=""
              className="mx-auto h-32 w-32 rounded-lg"
            />
          )}
          <p className="text-xs uppercase text-white/40">Rätt svar</p>
          <p className="text-2xl font-bold">{state.currentTrack.name}</p>
          <p className="text-white/60">{state.currentTrack.artists.join(", ")}</p>
          {myGuess && (
            <p className="text-sm">
              Du gissade: <span className="italic">"{myGuess.text}"</span>{" "}
              {myGuess.awarded > 0 ? (
                <span className="text-spotify-green">+{myGuess.awarded} p</span>
              ) : (
                <span className="text-white/40">(0 p)</span>
              )}
            </p>
          )}
        </section>
      )}

      {state && (
        <PlayerLeaderboard state={state} myId={playerId} />
      )}
    </div>
  );
}

function PlayerLeaderboard({
  state,
  myId,
}: {
  state: NonNullable<ReturnType<typeof useRoom>["state"]>;
  myId: string;
}) {
  const players = [...state.players]
    .filter((p) => !p.isHost)
    .sort((a, b) => b.score - a.score);

  return (
    <section className="card">
      <h3 className="font-bold">Poängtavla</h3>
      <ul className="mt-2 space-y-1 text-sm">
        {players.map((p, idx) => (
          <li
            key={p.id}
            className={`flex items-center justify-between rounded-lg px-3 py-2 ${
              p.id === myId ? "bg-spotify-green/20" : "bg-black/40"
            }`}
          >
            <span>
              {idx + 1}. {p.name}
              {p.team && <span className="ml-2 text-white/40">({p.team})</span>}
            </span>
            <span className="font-bold text-spotify-green">{p.score}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
