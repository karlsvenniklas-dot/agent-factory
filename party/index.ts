import type * as Party from "partykit/server";
import type {
  ClientMessage,
  Guess,
  Player,
  RoomState,
  ServerMessage,
} from "../types/game";

// PartyKit-rum för Spotify Quiz. Ett rum per quiz-session, identifierat
// av rumkoden i URL:en (party.id).
export default class QuizRoom implements Party.Server {
  state: RoomState;

  constructor(readonly party: Party.Party) {
    this.state = {
      code: party.id.toUpperCase(),
      hostId: null,
      players: [],
      teams: [],
      phase: "idle",
      round: 0,
      currentTrack: null,
      guesses: [],
      trackHistory: [],
    };
  }

  onConnect(conn: Party.Connection) {
    this.send(conn, { type: "state", state: this.state });
  }

  onClose(conn: Party.Connection) {
    const player = this.state.players.find((p) => p.id === conn.id);
    if (player) {
      player.connected = false;
      this.broadcastState();
    }
  }

  onMessage(raw: string, sender: Party.Connection) {
    let msg: ClientMessage;
    try {
      msg = JSON.parse(raw) as ClientMessage;
    } catch {
      this.send(sender, { type: "error", message: "Invalid JSON" });
      return;
    }

    switch (msg.type) {
      case "host_claim":
        this.handleHostClaim(sender, msg.playerId, msg.name);
        break;
      case "join":
        this.handleJoin(sender, msg.playerId, msg.name, msg.team ?? null);
        break;
      case "rename":
        this.handleRename(msg.playerId, msg.name);
        break;
      case "set_team":
        this.handleSetTeam(msg.playerId, msg.team);
        break;
      case "start_round":
        this.handleStartRound(sender, msg.track);
        break;
      case "submit_guess":
        this.handleGuess(msg.playerId, msg.text);
        break;
      case "award":
        this.handleAward(sender, msg.playerId, msg.points);
        break;
      case "reveal":
        this.handleReveal(sender);
        break;
      case "next_round":
        this.handleNextRound(sender);
        break;
      case "kick":
        this.handleKick(sender, msg.playerId);
        break;
      case "reset":
        this.handleReset(sender);
        break;
      default:
        this.send(sender, { type: "error", message: "Unknown message type" });
    }
  }

  // ---------- Handlers ----------

  private handleHostClaim(conn: Party.Connection, playerId: string, name: string) {
    if (this.state.hostId && this.state.hostId !== playerId) {
      this.send(conn, { type: "error", message: "Rummet har redan en värd" });
      return;
    }
    this.state.hostId = playerId;
    const existing = this.state.players.find((p) => p.id === playerId);
    if (existing) {
      existing.name = name || existing.name;
      existing.connected = true;
      existing.isHost = true;
    } else {
      this.state.players.push({
        id: playerId,
        name: name || "Värd",
        team: null,
        score: 0,
        connected: true,
        isHost: true,
      });
    }
    // Bind connection-id till playerId så vi kan hitta dem vid disconnect.
    (conn as { id: string }).id = playerId;
    this.broadcastState();
  }

  private handleJoin(
    conn: Party.Connection,
    playerId: string,
    name: string,
    team: string | null,
  ) {
    const cleanName = (name || "").trim().slice(0, 24) || "Spelare";
    const existing = this.state.players.find((p) => p.id === playerId);
    if (existing) {
      existing.name = cleanName;
      existing.connected = true;
      if (team !== undefined) existing.team = team;
    } else {
      this.state.players.push({
        id: playerId,
        name: cleanName,
        team,
        score: 0,
        connected: true,
        isHost: false,
      });
    }
    if (team && !this.state.teams.includes(team)) this.state.teams.push(team);
    (conn as { id: string }).id = playerId;
    this.broadcastState();
  }

  private handleRename(playerId: string, name: string) {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return;
    player.name = (name || "").trim().slice(0, 24) || player.name;
    this.broadcastState();
  }

  private handleSetTeam(playerId: string, team: string | null) {
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player) return;
    const cleanTeam = team ? team.trim().slice(0, 24) : null;
    player.team = cleanTeam;
    if (cleanTeam && !this.state.teams.includes(cleanTeam)) {
      this.state.teams.push(cleanTeam);
    }
    this.broadcastState();
  }

  private handleStartRound(conn: Party.Connection, track: RoomState["currentTrack"]) {
    if (!this.isHost(conn)) return;
    if (!track) return;
    this.state.phase = "playing";
    this.state.round += 1;
    this.state.currentTrack = track;
    this.state.guesses = [];
    if (!this.state.trackHistory.includes(track.id)) {
      this.state.trackHistory.push(track.id);
    }
    this.broadcastState();
  }

  private handleGuess(playerId: string, text: string) {
    if (this.state.phase !== "playing") return;
    const player = this.state.players.find((p) => p.id === playerId);
    if (!player || player.isHost) return;
    const cleanText = (text || "").trim().slice(0, 120);
    if (!cleanText) return;

    const existing = this.state.guesses.find((g) => g.playerId === playerId);
    const guess: Guess = {
      playerId,
      playerName: player.name,
      team: player.team,
      text: cleanText,
      submittedAt: Date.now(),
      awarded: 0,
    };
    if (existing) Object.assign(existing, guess);
    else this.state.guesses.push(guess);
    this.broadcastState();
  }

  private handleAward(conn: Party.Connection, playerId: string, points: number) {
    if (!this.isHost(conn)) return;
    const guess = this.state.guesses.find((g) => g.playerId === playerId);
    const player = this.state.players.find((p) => p.id === playerId);
    if (!guess || !player) return;
    const delta = points - guess.awarded;
    guess.awarded = points;
    player.score += delta;
    // Lagläge: ge poängen till hela laget när någon gissar rätt.
    if (player.team) {
      for (const teammate of this.state.players) {
        if (teammate.team === player.team && teammate.id !== player.id) {
          teammate.score += delta;
        }
      }
    }
    this.broadcastState();
  }

  private handleReveal(conn: Party.Connection) {
    if (!this.isHost(conn)) return;
    this.state.phase = "reveal";
    this.broadcastState();
  }

  private handleNextRound(conn: Party.Connection) {
    if (!this.isHost(conn)) return;
    this.state.phase = "idle";
    this.state.currentTrack = null;
    this.state.guesses = [];
    this.broadcastState();
  }

  private handleKick(conn: Party.Connection, playerId: string) {
    if (!this.isHost(conn)) return;
    this.state.players = this.state.players.filter((p) => p.id !== playerId);
    this.broadcastState();
  }

  private handleReset(conn: Party.Connection) {
    if (!this.isHost(conn)) return;
    for (const player of this.state.players) player.score = 0;
    this.state.phase = "idle";
    this.state.round = 0;
    this.state.currentTrack = null;
    this.state.guesses = [];
    this.state.trackHistory = [];
    this.broadcastState();
  }

  // ---------- Helpers ----------

  private isHost(conn: Party.Connection): boolean {
    return Boolean(this.state.hostId && conn.id === this.state.hostId);
  }

  private send(conn: Party.Connection, msg: ServerMessage) {
    conn.send(JSON.stringify(msg));
  }

  private broadcastState() {
    const msg: ServerMessage = { type: "state", state: this.state };
    this.party.broadcast(JSON.stringify(msg));
  }
}

QuizRoom satisfies Party.Worker;
