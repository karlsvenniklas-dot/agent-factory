import { useRef, useEffect, useState } from "react";
import { Edit2, Check, X } from "lucide-react";
import type { Segment, Speaker } from "../types";
import { api } from "../api/client";
import { clsx } from "clsx";

interface Props {
  meetingId: string;
  segments: Segment[];
  speakers: Speaker[];
  currentTime: number;
  onSeek: (t: number) => void;
  onSegmentsChange: (segs: Segment[]) => void;
}

function SegmentRow({
  seg,
  speaker,
  isActive,
  onSeek,
  onUpdate,
  speakers,
  meetingId,
}: {
  seg: Segment;
  speaker: Speaker | undefined;
  isActive: boolean;
  onSeek: (t: number) => void;
  onUpdate: (s: Segment) => void;
  speakers: Speaker[];
  meetingId: string;
}) {
  const [editing, setEditing] = useState(false);
  const [text, setText] = useState(seg.text);
  const [loading, setLoading] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive) rowRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [isActive]);

  const formatTs = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const save = async () => {
    setLoading(true);
    try {
      const updated = await api.segments.update(meetingId, seg.id, { text });
      onUpdate(updated);
      setEditing(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={rowRef}
      className={clsx(
        "group flex gap-3 px-4 py-3 rounded-lg transition-colors",
        isActive ? "bg-indigo-900/30" : "hover:bg-gray-700/30"
      )}
    >
      <button
        onClick={() => onSeek(seg.start_time)}
        className="shrink-0 text-xs text-gray-500 hover:text-indigo-400 font-mono pt-0.5 w-10 text-right"
      >
        {formatTs(seg.start_time)}
      </button>

      <div
        className="w-2 shrink-0 mt-1.5 rounded-full self-stretch"
        style={{ backgroundColor: speaker?.color ?? "#6b7280", minHeight: "1rem" }}
      />

      <div className="flex-1 min-w-0">
        <span
          className="text-xs font-medium mb-1 block"
          style={{ color: speaker?.color ?? "#9ca3af" }}
        >
          {speaker?.name ?? "Okänd"}
        </span>
        {editing ? (
          <div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={2}
              autoFocus
              className="w-full bg-gray-700 border border-indigo-500 rounded px-2 py-1 text-sm focus:outline-none resize-none"
            />
            <div className="flex gap-2 mt-1">
              <button onClick={save} disabled={loading} className="flex items-center gap-1 text-xs text-green-400 hover:text-green-300">
                <Check className="w-3 h-3" /> Spara
              </button>
              <button onClick={() => { setEditing(false); setText(seg.text); }} className="flex items-center gap-1 text-xs text-gray-400">
                <X className="w-3 h-3" /> Avbryt
              </button>
            </div>
          </div>
        ) : (
          <p
            className={clsx("text-sm leading-relaxed cursor-pointer", isActive ? "text-white" : "text-gray-300")}
            onClick={() => onSeek(seg.start_time)}
          >
            {seg.text}
            {seg.is_edited && <span className="ml-1 text-xs text-gray-500">(redigerad)</span>}
          </p>
        )}
      </div>

      <button
        onClick={() => setEditing(true)}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-opacity p-1"
      >
        <Edit2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function TranscriptViewer({ meetingId, segments, speakers, currentTime, onSeek, onSegmentsChange }: Props) {
  const speakerMap = Object.fromEntries(speakers.map((s) => [s.id, s]));

  const activeIdx = segments.findIndex(
    (s, i) =>
      currentTime >= s.start_time &&
      (i === segments.length - 1 || currentTime < segments[i + 1].start_time)
  );

  const handleUpdate = (updated: Segment) => {
    onSegmentsChange(segments.map((s) => (s.id === updated.id ? updated : s)));
  };

  if (segments.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Inga segment hittade
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto py-4 space-y-1">
      {segments.map((seg, i) => (
        <SegmentRow
          key={seg.id}
          seg={seg}
          speaker={speakerMap[seg.speaker_id ?? ""] ?? undefined}
          isActive={i === activeIdx}
          onSeek={onSeek}
          onUpdate={handleUpdate}
          speakers={speakers}
          meetingId={meetingId}
        />
      ))}
    </div>
  );
}
