import { useState, useEffect } from "react";
import { Sparkles, Plus, Play, Trash2, ChevronDown, ChevronUp, Star } from "lucide-react";
import { api } from "../api/client";
import type { Action } from "../types";

const PRESET_PROMPTS = [
  { name: "Sammanfattning", prompt: "Sammanfatta detta möte kort och koncist. Lyft fram de viktigaste besluten och diskussionspunkterna." },
  { name: "Åtgärdslista", prompt: "Lista alla åtgärdspunkter och uppgifter som nämndes i mötet. Inkludera ansvarig person om det framgår." },
  { name: "Mötesprotokoll", prompt: "Skriv ett formellt mötesprotokoll med rubrikerna: Deltagare, Dagordning, Diskussioner, Beslut, Åtgärdspunkter." },
  { name: "Nyckelord", prompt: "Extrahera de 10 viktigaste nyckelorden och begreppen från mötet." },
];

interface Props {
  meetingId: string;
}

export function SmartActions({ meetingId }: Props) {
  const [actions, setActions] = useState<Action[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [running, setRunning] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api.actions.list(meetingId).then(setActions);
  }, [meetingId]);

  const addAction = async () => {
    if (!name.trim() || !prompt.trim()) return;
    const a = await api.actions.create(meetingId, { name: name.trim(), prompt: prompt.trim() });
    setActions((prev) => [...prev, a]);
    setName("");
    setPrompt("");
    setShowNew(false);
  };

  const runAction = async (actionId: string) => {
    setRunning(actionId);
    try {
      const run = await api.actions.run(meetingId, actionId);
      setActions((prev) =>
        prev.map((a) =>
          a.id === actionId ? { ...a, runs: [run, ...a.runs] } : a
        )
      );
      setExpanded(actionId);
    } finally {
      setRunning(null);
    }
  };

  const deleteAction = async (actionId: string) => {
    await api.actions.delete(meetingId, actionId);
    setActions((prev) => prev.filter((a) => a.id !== actionId));
  };

  return (
    <div className="border-t border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <h3 className="font-medium text-sm">Smarta åtgärder</h3>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
        >
          <Plus className="w-3.5 h-3.5" />
          Ny åtgärd
        </button>
      </div>

      {/* Preset prompts */}
      {actions.length === 0 && !showNew && (
        <div className="space-y-1 mb-3">
          <p className="text-xs text-gray-500 mb-2">Snabbstart:</p>
          {PRESET_PROMPTS.map((p) => (
            <button
              key={p.name}
              onClick={async () => {
                const a = await api.actions.create(meetingId, { name: p.name, prompt: p.prompt, is_favorite: true });
                setActions((prev) => [...prev, a]);
                runAction(a.id);
              }}
              className="w-full text-left text-xs p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      )}

      {showNew && (
        <div className="mb-3 space-y-2 bg-gray-700/50 rounded-lg p-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Namn"
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
          />
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Prompt till AI:n..."
            rows={3}
            className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500 resize-none"
          />
          <div className="flex gap-2">
            <button
              onClick={addAction}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-xs py-1.5 rounded transition-colors"
            >
              Spara
            </button>
            <button
              onClick={() => setShowNew(false)}
              className="flex-1 bg-gray-600 hover:bg-gray-500 text-xs py-1.5 rounded transition-colors"
            >
              Avbryt
            </button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {actions.map((action) => (
          <div key={action.id} className="bg-gray-700/50 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 p-2">
              {action.is_favorite && <Star className="w-3 h-3 text-yellow-400 shrink-0" />}
              <span className="flex-1 text-xs font-medium truncate">{action.name}</span>
              <button
                onClick={() => runAction(action.id)}
                disabled={running === action.id}
                className="p-1 text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setExpanded(expanded === action.id ? null : action.id)}
                className="p-1 text-gray-400 hover:text-white"
              >
                {expanded === action.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => deleteAction(action.id)}
                className="p-1 text-gray-500 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {expanded === action.id && action.runs.length > 0 && (
              <div className="border-t border-gray-600 p-3">
                <p className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {action.runs[0].result}
                </p>
              </div>
            )}
            {running === action.id && (
              <div className="border-t border-gray-600 p-3">
                <p className="text-xs text-gray-500 animate-pulse">Analyserar transkript...</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
