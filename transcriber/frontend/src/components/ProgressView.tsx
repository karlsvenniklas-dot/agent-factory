import { useEffect, useState } from "react";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { useWebSocket } from "../hooks/useWebSocket";
import type { Meeting, ProgressEvent } from "../types";

interface Props {
  meeting: Meeting;
  onDone: () => void;
}

const STEP_LABELS: Record<string, string> = {
  pending: "Väntar på bearbetning...",
  converting: "Konverterar ljud...",
  transcribing: "Transkriberar med Whisper...",
  diarizing: "Talaruppdelning med pyannote...",
  identifying: "Identifierar deltagare med AI...",
  done: "Transkribering klar!",
  error: "Ett fel uppstod",
};

export function ProgressView({ meeting, onDone }: Props) {
  const [progress, setProgress] = useState<ProgressEvent>({
    meeting_id: meeting.id,
    status: meeting.status as ProgressEvent["status"],
    percent: meeting.progress_percent,
    message: meeting.progress_message ?? "",
  });

  const wsUrl = meeting.status !== "done" && meeting.status !== "error"
    ? `ws://localhost:8000/ws/meetings/${meeting.id}/progress`
    : null;

  useWebSocket(wsUrl, (data) => {
    const ev = data as ProgressEvent;
    setProgress(ev);
    if (ev.status === "done" || ev.status === "error") {
      setTimeout(onDone, 1000);
    }
  });

  const isDone = progress.status === "done";
  const isError = progress.status === "error";

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
      {isDone ? (
        <CheckCircle className="w-16 h-16 text-green-400 mb-4" />
      ) : isError ? (
        <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
      ) : (
        <Loader2 className="w-16 h-16 text-indigo-400 animate-spin mb-4" />
      )}

      <h2 className="text-xl font-semibold mb-2">{meeting.title}</h2>
      <p className="text-gray-400 mb-6">{STEP_LABELS[progress.status] ?? progress.status}</p>

      {!isDone && !isError && (
        <div className="w-full max-w-sm">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">{progress.message}</p>
        </div>
      )}

      {isError && (
        <p className="text-sm text-red-400 max-w-sm">{progress.message}</p>
      )}
    </div>
  );
}
