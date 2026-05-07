// Persistent klient-id i localStorage så att en spelare kan ladda om sidan
// och fortfarande räknas som samma spelare i rummet.

const KEY = "spotify_quiz_player_id";

export function getPlayerId(): string {
  if (typeof window === "undefined") return "";
  let id = window.localStorage.getItem(KEY);
  if (!id) {
    const bytes = new Uint8Array(8);
    crypto.getRandomValues(bytes);
    id = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
    window.localStorage.setItem(KEY, id);
  }
  return id;
}
