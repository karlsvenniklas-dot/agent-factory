import { useState } from "react";
import { Users, Merge, Edit2, Check, X } from "lucide-react";
import type { Speaker } from "../types";
import { api } from "../api/client";

const COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#3b82f6",
  "#8b5cf6", "#ef4444", "#14b8a6", "#f97316", "#84cc16",
];

interface Props {
  meetingId: string;
  speakers: Speaker[];
  onChange: (speakers: Speaker[]) => void;
}

function SpeakerRow({ meetingId, speaker, onUpdate, onMergeSelect, mergeSource }: {
  meetingId: string;
  speaker: Speaker;
  onUpdate: (s: Speaker) => void;
  onMergeSelect: (id: string) => void;
  mergeSource: string | null;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(speaker.name);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    const updated = await api.speakers.update(meetingId, speaker.id, { name });
    onUpdate(updated);
    setEditing(false);
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-700/50">
      <div
        className="w-3 h-3 rounded-full shrink-0"
        style={{ backgroundColor: speaker.color }}
      />
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              autoFocus
              className="flex-1 bg-gray-700 border border-indigo-500 rounded px-2 py-0.5 text-sm focus:outline-none"
            />
            <button onClick={save} disabled={loading} className="text-green-400 hover:text-green-300">
              <Check className="w-4 h-4" />
            </button>
            <button onClick={() => { setEditing(false); setName(speaker.name); }} className="text-gray-400 hover:text-gray-200">
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{speaker.name}</span>
            {!speaker.is_identified && (
              <span className="text-xs text-gray-500 bg-gray-700 px-1.5 py-0.5 rounded">auto</span>
            )}
          </div>
        )}
        <p className="text-xs text-gray-500">{speaker.label}</p>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setEditing(true)}
          className="p-1 text-gray-400 hover:text-white rounded"
          title="Byt namn"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onMergeSelect(speaker.id)}
          className={`p-1 rounded ${mergeSource === speaker.id ? "text-yellow-400" : "text-gray-400 hover:text-white"}`}
          title="Välj för sammanslagning"
        >
          <Merge className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export function SpeakerPanel({ meetingId, speakers, onChange }: Props) {
  const [mergeSource, setMergeSource] = useState<string | null>(null);

  const handleUpdate = (updated: Speaker) => {
    onChange(speakers.map((s) => s.id === updated.id ? updated : s));
  };

  const handleMergeSelect = async (id: string) => {
    if (!mergeSource) {
      setMergeSource(id);
      return;
    }
    if (mergeSource === id) {
      setMergeSource(null);
      return;
    }
    const updated = await api.speakers.merge(meetingId, mergeSource, id);
    onChange(updated);
    setMergeSource(null);
  };

  return (
    <div className="w-64 bg-gray-800 border-l border-gray-700 flex flex-col">
      <div className="p-4 border-b border-gray-700 flex items-center gap-2">
        <Users className="w-4 h-4 text-indigo-400" />
        <h3 className="font-medium text-sm">Talare</h3>
      </div>
      {mergeSource && (
        <div className="mx-3 mt-3 p-2 bg-yellow-900/30 border border-yellow-700 rounded-lg text-xs text-yellow-400">
          Klicka på en annan talare för att slå ihop med{" "}
          <strong>{speakers.find((s) => s.id === mergeSource)?.name}</strong>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {speakers.map((spk) => (
          <SpeakerRow
            key={spk.id}
            meetingId={meetingId}
            speaker={spk}
            onUpdate={handleUpdate}
            onMergeSelect={handleMergeSelect}
            mergeSource={mergeSource}
          />
        ))}
      </div>
    </div>
  );
}
