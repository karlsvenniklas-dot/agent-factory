import { formatDistanceToNow } from "date-fns";
import { sv } from "date-fns/locale";
import { Lock, Mic, Users, Clock, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import type { Meeting } from "../types";
import { clsx } from "clsx";

const STATUS_COLORS: Record<string, string> = {
  done: "text-green-400",
  error: "text-red-400",
  pending: "text-gray-400",
  converting: "text-blue-400",
  transcribing: "text-blue-400",
  diarizing: "text-indigo-400",
  identifying: "text-purple-400",
};

const STATUS_LABELS: Record<string, string> = {
  done: "Klar",
  error: "Fel",
  pending: "Väntar",
  converting: "Konverterar",
  transcribing: "Transkriberar",
  diarizing: "Talaruppdelning",
  identifying: "Identifierar",
};

function StatusIcon({ status }: { status: string }) {
  if (status === "done") return <CheckCircle className="w-4 h-4 text-green-400" />;
  if (status === "error") return <AlertCircle className="w-4 h-4 text-red-400" />;
  if (status === "pending") return <Clock className="w-4 h-4 text-gray-400" />;
  return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
}

function formatDuration(s: number | null): string {
  if (!s) return "—";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

interface Props {
  meeting: Meeting;
  onClick: () => void;
}

export function MeetingCard({ meeting, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-indigo-500 rounded-xl p-4 transition-all duration-150 group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-100 truncate group-hover:text-white">{meeting.title}</h3>
            {meeting.is_encrypted && <Lock className="w-3.5 h-3.5 text-yellow-400 shrink-0" />}
            {meeting.is_live && <Mic className="w-3.5 h-3.5 text-red-400 shrink-0" />}
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <div className={clsx("flex items-center gap-1", STATUS_COLORS[meeting.status])}>
              <StatusIcon status={meeting.status} />
              <span>{STATUS_LABELS[meeting.status] ?? meeting.status}</span>
            </div>
            {meeting.duration_seconds && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(meeting.duration_seconds)}</span>
              </div>
            )}
            {meeting.num_speakers && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{meeting.num_speakers}</span>
              </div>
            )}
          </div>
          {meeting.status !== "done" && meeting.status !== "error" && meeting.progress_message && (
            <div className="mt-2">
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                  style={{ width: `${meeting.progress_percent}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">{meeting.progress_message}</p>
            </div>
          )}
          {meeting.status === "error" && (
            <p className="text-xs text-red-400 mt-1 truncate">{meeting.error_message}</p>
          )}
        </div>
        <time className="text-xs text-gray-500 shrink-0">
          {formatDistanceToNow(new Date(meeting.created_at), { addSuffix: true, locale: sv })}
        </time>
      </div>
    </button>
  );
}
