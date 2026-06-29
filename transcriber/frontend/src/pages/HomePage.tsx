import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Mic, Radio, Settings, Mic2 } from "lucide-react";
import { api } from "../api/client";
import type { Meeting } from "../types";
import { MeetingCard } from "../components/MeetingCard";
import { UploadModal } from "../components/UploadModal";
import { RecordModal } from "../components/RecordModal";

export function HomePage() {
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<"upload" | "record" | null>(null);

  useEffect(() => {
    api.meetings.list().then((m) => {
      setMeetings(m);
      setLoading(false);
    });
    // Refresh every 5s to pick up processing updates
    const interval = setInterval(() => {
      api.meetings.list().then(setMeetings);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const onCreated = (m: Meeting) => {
    setMeetings((prev) => [m, ...prev]);
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Mic2 className="w-4 h-4" />
          </div>
          <h1 className="text-lg font-bold tracking-tight">Transcriber</h1>
          <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">lokal AI</span>
        </div>
        <button className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-800 transition-colors">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <button
            onClick={() => setModal("upload")}
            className="flex flex-col items-center gap-2 p-5 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-indigo-500 rounded-xl transition-all group"
          >
            <div className="w-10 h-10 bg-indigo-900/50 rounded-lg flex items-center justify-center group-hover:bg-indigo-900">
              <Upload className="w-5 h-5 text-indigo-400" />
            </div>
            <span className="text-sm font-medium">Ladda upp</span>
            <span className="text-xs text-gray-500 text-center">MP3, MP4, WAV...</span>
          </button>

          <button
            onClick={() => setModal("record")}
            className="flex flex-col items-center gap-2 p-5 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-red-500 rounded-xl transition-all group"
          >
            <div className="w-10 h-10 bg-red-900/30 rounded-lg flex items-center justify-center group-hover:bg-red-900/50">
              <Mic className="w-5 h-5 text-red-400" />
            </div>
            <span className="text-sm font-medium">Spela in</span>
            <span className="text-xs text-gray-500 text-center">Direkt i webbläsaren</span>
          </button>

          <button
            className="flex flex-col items-center gap-2 p-5 bg-gray-800 hover:bg-gray-750 border border-gray-700 hover:border-green-500 rounded-xl transition-all group opacity-75"
            title="Live-läge - kommer snart"
          >
            <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center group-hover:bg-green-900/50">
              <Radio className="w-5 h-5 text-green-400" />
            </div>
            <span className="text-sm font-medium">Live</span>
            <span className="text-xs text-gray-500 text-center">Realtidstext</span>
          </button>
        </div>

        {/* Meeting list */}
        <div>
          <h2 className="text-sm font-medium text-gray-400 mb-3">
            {loading ? "Laddar..." : `${meetings.length} möten`}
          </h2>
          {meetings.length === 0 && !loading ? (
            <div className="text-center py-16 text-gray-500">
              <Mic2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Inga möten ännu</p>
              <p className="text-sm mt-1">Ladda upp en fil eller spela in ett möte</p>
            </div>
          ) : (
            <div className="space-y-2">
              {meetings.map((m) => (
                <MeetingCard
                  key={m.id}
                  meeting={m}
                  onClick={() => navigate(`/meeting/${m.id}`)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {modal === "upload" && (
        <UploadModal onClose={() => setModal(null)} onCreated={onCreated} />
      )}
      {modal === "record" && (
        <RecordModal onClose={() => setModal(null)} onCreated={onCreated} />
      )}
    </div>
  );
}
