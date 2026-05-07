"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { generateRoomCode } from "@/lib/room";

export default function HostRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(`/host/${generateRoomCode()}`);
  }, [router]);
  return <p className="text-white/60">Skapar rum…</p>;
}
