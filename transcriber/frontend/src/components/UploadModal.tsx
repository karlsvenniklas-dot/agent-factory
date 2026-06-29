import { useRef, useState, useCallback } from "react";
import { Upload, X, FileAudio } from "lucide-react";
import { api } from "../api/client";
import type { Meeting } from "../types";

interface Props {
  onClose: () => void;
  onCreated: (m: Meeting) => void;
}

export function UploadModal({ onClose, onCreated }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [language, setLanguage] = useState("sv");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, ""));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const submit = async () => {
    if (!file || !title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const meeting = await api.meetings.upload(file, title.trim(), language);
      onCreated(meeting);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Uppladdning misslyckades");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Ladda upp möte</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
            dragging ? "border-indigo-400 bg-indigo-900/20" : "border-gray-600 hover:border-gray-400"
          }`}
        >
          {file ? (
            <div className="flex items-center justify-center gap-3 text-green-400">
              <FileAudio className="w-8 h-8" />
              <span className="font-medium truncate max-w-[200px]">{file.name}</span>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-gray-500 mx-auto mb-3" />
              <p className="text-gray-300 font-medium">Dra hit eller klicka för att välja</p>
              <p className="text-gray-500 text-sm mt-1">MP3, MP4, WAV, WebM, M4A</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="audio/*,video/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-sm text-gray-400 block mb-1">Titel</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Mötetitel"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 block mb-1">Språk</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="sv">Svenska</option>
              <option value="en">Engelska</option>
              <option value="da">Danska</option>
              <option value="no">Norska</option>
              <option value="fi">Finska</option>
            </select>
          </div>
        </div>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-6 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-sm py-2 rounded-lg transition-colors"
          >
            Avbryt
          </button>
          <button
            onClick={submit}
            disabled={!file || !title.trim() || loading}
            className="flex-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm py-2 rounded-lg transition-colors font-medium"
          >
            {loading ? "Laddar upp..." : "Transkribera"}
          </button>
        </div>
      </div>
    </div>
  );
}
