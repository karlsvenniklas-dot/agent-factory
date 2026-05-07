// Delade typer mellan PartyKit-server, Next.js-routes och React-komponenter.

export interface SpotifyTrackInfo {
  id: string;
  name: string;
  artists: string[];
  albumArt: string | null;
  uri: string;
  previewUrl: string | null;
}

export interface Player {
  id: string;
  name: string;
  team: string | null;
  score: number;
  connected: boolean;
  isHost: boolean;
}

export type RoundPhase = "idle" | "playing" | "reveal";

export interface Guess {
  playerId: string;
  playerName: string;
  team: string | null;
  text: string;
  submittedAt: number;
  awarded: number; // 0 = inte bedömd, 1+ = poäng tilldelade
}

export interface RoomState {
  code: string;
  hostId: string | null;
  players: Player[];
  teams: string[]; // namn på lag som finns i rummet
  phase: RoundPhase;
  round: number;
  currentTrack: SpotifyTrackInfo | null;
  guesses: Guess[];
  trackHistory: string[]; // ids på låtar som redan spelats
}

// ===== Klient → server =====
export type ClientMessage =
  | { type: "host_claim"; playerId: string; name: string }
  | { type: "join"; playerId: string; name: string; team?: string | null }
  | { type: "rename"; playerId: string; name: string }
  | { type: "set_team"; playerId: string; team: string | null }
  | { type: "start_round"; track: SpotifyTrackInfo }
  | { type: "submit_guess"; playerId: string; text: string }
  | { type: "award"; playerId: string; points: number }
  | { type: "reveal" }
  | { type: "next_round" }
  | { type: "kick"; playerId: string }
  | { type: "reset" };

// ===== Server → klient =====
export type ServerMessage =
  | { type: "state"; state: RoomState }
  | { type: "error"; message: string };
