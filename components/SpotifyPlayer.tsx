"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { pausePlayback, playTrack, transferPlaybackToDevice } from "@/lib/spotify";

interface Props {
  accessToken: string;
  onReady: (deviceId: string) => void;
  onPremiumError: () => void;
}

// Spotify Web Playback SDK kräver Premium och initieras i webbläsaren.
// Komponenten exponerar inte SDK-instansen direkt — uppspelning sker
// via Web API mot device_id som SDK:n levererat.
export default function SpotifyPlayer({ accessToken, onReady, onPremiumError }: Props) {
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const playerRef = useRef<Spotify.Player | null>(null);

  useEffect(() => {
    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Spotify Quiz Host",
        getOAuthToken: (cb) => cb(accessToken),
        volume: 0.6,
      });
      playerRef.current = player;

      player.addListener("ready", ({ device_id }) => {
        setDeviceId(device_id);
        setStatus("ready");
        onReady(device_id);
        // Försök transferera uppspelning till denna device automatiskt.
        transferPlaybackToDevice(accessToken, device_id).catch(() => {
          // Inte kritiskt; värden kan starta manuellt.
        });
      });

      player.addListener("not_ready", () => {
        setStatus("loading");
      });

      player.addListener("authentication_error", ({ message }) => {
        setStatus("error");
        setErrorMsg(`Auth-fel: ${message}`);
      });
      player.addListener("account_error", ({ message }) => {
        setStatus("error");
        setErrorMsg(`Premium krävs: ${message}`);
        onPremiumError();
      });
      player.addListener("playback_error", ({ message }) => {
        setErrorMsg(`Uppspelningsfel: ${message}`);
      });
      player.addListener("initialization_error", ({ message }) => {
        setStatus("error");
        setErrorMsg(`Init-fel: ${message}`);
      });

      player.connect();
    };

    return () => {
      playerRef.current?.disconnect();
      playerRef.current = null;
    };
  }, [accessToken, onReady, onPremiumError]);

  async function play(uri: string, positionMs = 0) {
    if (!deviceId) return;
    try {
      await playTrack(accessToken, deviceId, uri, positionMs);
    } catch (e) {
      setErrorMsg((e as Error).message);
    }
  }

  async function pause() {
    try {
      await pausePlayback(accessToken);
    } catch (e) {
      setErrorMsg((e as Error).message);
    }
  }

  // Exponera play/pause genom global ref så host-page kan trigga dem.
  useEffect(() => {
    (window as unknown as { __spotifyQuizPlayer?: { play: typeof play; pause: typeof pause } }).__spotifyQuizPlayer = { play, pause };
    return () => {
      delete (window as unknown as { __spotifyQuizPlayer?: unknown }).__spotifyQuizPlayer;
    };
  });

  return (
    <>
      <Script src="https://sdk.scdn.co/spotify-player.js" strategy="afterInteractive" />
      <div className="flex items-center gap-2 text-xs text-white/60">
        <span
          className={`h-2 w-2 rounded-full ${
            status === "ready"
              ? "bg-spotify-green"
              : status === "loading"
                ? "bg-yellow-400"
                : "bg-red-500"
          }`}
        />
        {status === "loading" && "Spotify Player laddar…"}
        {status === "ready" && "Player redo · Premium"}
        {status === "error" && (errorMsg ?? "Player-fel")}
      </div>
    </>
  );
}
