"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { generateRoomCode, isValidRoomCode } from "@/lib/room";

export default function HomePage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function startNewGame() {
    const newCode = generateRoomCode();
    router.push(`/host/${newCode}`);
  }

  function joinGame(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (!isValidRoomCode(cleaned)) {
      setError("Rumkoder är 4 bokstäver/siffror");
      return;
    }
    router.push(`/play/${cleaned}`);
  }

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <section className="card flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Värd ett quiz</h1>
        <p className="text-white/70">
          Logga in med Spotify, välj en spellista och spela snuttar — dina
          spelare gissar låten från sin egen mobil.
        </p>
        <ul className="space-y-1 text-sm text-white/60">
          <li>· Kräver Spotify Premium på värdens enhet</li>
          <li>· Stöder lag eller individuella spelare</li>
          <li>· Värden styr poäng och tempo</li>
        </ul>
        <button onClick={startNewGame} className="btn-primary mt-2 self-start">
          Starta nytt rum
        </button>
      </section>

      <section className="card flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Gå med i ett quiz</h1>
        <p className="text-white/70">
          Be värden om rumkoden och skriv in den nedan. Du behöver inget
          Spotify-konto för att spela.
        </p>
        <form onSubmit={joinGame} className="flex flex-col gap-3">
          <input
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError(null);
            }}
            placeholder="ABCD"
            maxLength={6}
            className="input text-center text-3xl font-bold tracking-widest"
            autoCapitalize="characters"
            autoComplete="off"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button type="submit" className="btn-secondary self-start">
            Gå med
          </button>
        </form>
        <p className="text-xs text-white/40">
          Tips: håll telefonen redo —{" "}
          <Link href="/host" className="underline">
            är du värd istället?
          </Link>
        </p>
      </section>
    </div>
  );
}
