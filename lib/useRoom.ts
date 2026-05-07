"use client";

import PartySocket from "partysocket";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ClientMessage, RoomState, ServerMessage } from "@/types/game";

export function useRoom(roomCode: string) {
  const [state, setState] = useState<RoomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<PartySocket | null>(null);

  useEffect(() => {
    if (!roomCode) return;
    const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST ?? "127.0.0.1:1999";

    const socket = new PartySocket({
      host,
      room: roomCode.toLowerCase(),
    });
    socketRef.current = socket;

    socket.addEventListener("open", () => setConnected(true));
    socket.addEventListener("close", () => setConnected(false));
    socket.addEventListener("error", () => setError("Anslutningsfel"));
    socket.addEventListener("message", (e) => {
      try {
        const msg = JSON.parse(e.data as string) as ServerMessage;
        if (msg.type === "state") {
          setState(msg.state);
          setError(null);
        } else if (msg.type === "error") {
          setError(msg.message);
        }
      } catch {
        // ignorera
      }
    });

    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [roomCode]);

  const send = useMemo(
    () => (message: ClientMessage) => {
      socketRef.current?.send(JSON.stringify(message));
    },
    [],
  );

  return { state, error, connected, send };
}
