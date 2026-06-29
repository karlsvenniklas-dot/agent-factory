import { useState, useEffect } from "react";
import { Mic, Square, X, Radio } from "lucide-react";
import { useAudioRecorder } from "../hooks/useAudioRecorder";
import { api } from "../api/client";
import type { Meeting } from "../types";

interface Props {
  onClose: () => void;
  onCreated: (m: Meeting) => void;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

export function RecordModal({ onClose, onCreated }: Props) {
  const { state, startRecording, stopRecording } = useAudioRecorder();
  const [title, setTitle] = useState(`Inspelning ${new Date().toLocaleDateString("sv")}`);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    navigator.mediaDevices.enumerateDevices().then((d) =>
      setDevices(d.filter((d) => d.kind === "audioinput"))
    );
  }, []);

  const handleStop = async () => {
    const blob = await stopRecording();
    setLoading(true);
    try {
      const file = new File([blob], `${title}.webm`, { type: "audio/webm" });
      const meeting = await api.meetings.upload(file, title);
      onCreated(meeting);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Fel vid uppladdning");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Spela in möte</h2>
          <button onClick={onClose} disabled={state.isRecording} className="text-gray-400 hover:text-white disabled:opacity-40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          {state.isRecording ? (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-red-400">
                <Radio className="w-5 h-5 animate-pulse" />
                <span className="font-mono text-2xl font-bold">{formatTime(state.duration)}</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-red-500 rounded-full transition-all duration-75"
                  style={{ width: `${Math.min(state.level * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">Spelar in...</p>
            </div>
          ) : (
            <div className="w-20 h-20 bg-red-900/30 border-2 border-red-500 rounded-full flex items-center justify-center mx-auto">
              <Mic className="w-8 h-8 text-red-400" />
            </div>
          )}
        </div>

        <div className="space-y-3 mb-6">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Titel</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={state.isRecording}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
            />
          </div>
          {devices.length > 1 && (
            <div>
              <label className="text-sm text-gray-400 block mb-1">Mikrofon</label>
              <select
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                disabled={state.isRecording}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500 disabled:opacity-50"
              >
                <option value="">Standardmikrofon</option>
                {devices.map((d) => (
                  <option key={d.deviceId} value={d.deviceId}>{d.label || `Mikrofon ${d.deviceId.slice(0, 8)}`}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

        <div className="flex gap-3">
          {!state.isRecording ? (
            <button
              onClick={() => startRecording(selectedDevice || undefined)}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-sm py-2.5 rounded-lg transition-colors font-medium"
            >
              <Mic className="w-4 h-4" />
              Starta inspelning
            </button>
          ) : (
            <button
              onClick={handleStop}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-sm py-2.5 rounded-lg transition-colors font-medium"
            >
              <Square className="w-4 h-4" />
              {loading ? "Bearbetar..." : "Stoppa & transkribera"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
