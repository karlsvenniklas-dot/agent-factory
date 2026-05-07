"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { isValidRoomCode } from "@/lib/room";

export default function PlayJoinPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = code.trim().toUpperCase();
    if (!isValidRoomCode(cleaned)) {
      setError("Rumkoder är 4 bokstäver/siffror");
      return;
    }
    router.push(`/play/${cleaned}`);
  }

  return (
    <div className="card mx-auto max-w-md">
      <h2 className="text-2xl font-bold">Gå med i ett quiz</h2>
      <form onSubmit={handleJoin} className="mt-4 space-y-3">
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
          autoFocus
        />
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button type="submit" className="btn-primary w-full">
          Gå med
        </button>
      </form>
    </div>
  );
}
