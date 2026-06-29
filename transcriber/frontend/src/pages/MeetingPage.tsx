import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, RefreshCw, Trash2, Mic2 } from "lucide-react";
import { api } from "../api/client";
import type { Meeting, Speaker, Segment } from "../types";
import { ProgressView } from "../components/ProgressView";
import { TranscriptViewer } from "../components/TranscriptViewer";
import { SpeakerPanel } from "../components/SpeakerPanel";
import { AudioPlayer } from "../components/AudioPlayer";
import { ExportModal } from "../components/ExportModal";
import { SmartActions } from "../components/SmartActions";

export function MeetingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [seekTo, setSeekTo] = useState<number | undefined>(undefined);
  const [currentTime, setCurrentTime] = useState(0);
  const [showExport, setShowExport] = useState(false);
  const [activePanel, setActivePanel] = useState<"speakers" | "actions">("speakers");

  useEffect(() => {
    if (!id) return;
    Promise.all([api.meetings.get(id), api.speakers.list(id), api.segments.list(id)])
      .then(([m, spk, seg]) => {
        setMeeting(m);
        setSpeakers(spk);
        setSegments(seg);
        setLoading(false);
      })
      .catch(() => navigate("/"));
  }, [id, navigate]);

  const onDone = useCallback(() => {
    if (!id) return;
    Promise.all([api.meetings.get(id), api.speakers.list(id), api.segments.list(id)])
      .then(([m, spk, seg]) => {
        setMeeting(m);
        setSpeakers(spk);
        setSegments(seg);
      });
  }, [id]);

  const handleDelete = async () => {
    if (!id || !confirm("Ta bort detta möte?")) return;
    await api.meetings.delete(id);
    navigate("/");
  };

  const handleReprocess = async () => {
    if (!id) return;
    const updated = await api.meetings.reprocess(id);
    setMeeting(updated);
    setSpeakers([]);
    setSegments([]);
  };

  if (loading || !meeting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-gray-400">Laddar...</div>
      </div>
    );
  }

  const isDone = meeting.status === "done";
  const isProcessing = !isDone && meeting.status !== "error";

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => navigate("/")}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
          <Mic2 className="w-3.5 h-3.5" />
        </div>
        <h1 className="flex-1 font-semibold truncate">{meeting.title}</h1>

        <div className="flex items-center gap-1">
          {isDone && (
            <button
              onClick={() => setShowExport(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-sm rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportera
            </button>
          )}
          <button
            onClick={handleReprocess}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            title="Bearbeta om"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDelete}
            className="p-2 text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
            title="Ta bort"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {isProcessing || meeting.status === "error" ? (
        <ProgressView meeting={meeting} onDone={onDone} />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Transcript */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <TranscriptViewer
              meetingId={meeting.id}
              segments={segments}
              speakers={speakers}
              currentTime={currentTime}
              onSeek={setSeekTo}
              onSegmentsChange={setSegments}
            />
            <AudioPlayer
              src={api.audio.url(meeting.id)}
              currentTime={seekTo}
              onTimeUpdate={setCurrentTime}
            />
          </div>

          {/* Right panel */}
          <div className="w-64 flex flex-col border-l border-gray-700">
            <div className="flex border-b border-gray-700">
              <button
                onClick={() => setActivePanel("speakers")}
                className={`flex-1 text-xs py-2 transition-colors ${activePanel === "speakers" ? "text-indigo-400 border-b-2 border-indigo-500" : "text-gray-400 hover:text-white"}`}
              >
                Talare
              </button>
              <button
                onClick={() => setActivePanel("actions")}
                className={`flex-1 text-xs py-2 transition-colors ${activePanel === "actions" ? "text-indigo-400 border-b-2 border-indigo-500" : "text-gray-400 hover:text-white"}`}
              >
                AI-åtgärder
              </button>
            </div>

            {activePanel === "speakers" ? (
              <SpeakerPanel
                meetingId={meeting.id}
                speakers={speakers}
                onChange={setSpeakers}
              />
            ) : (
              <div className="flex-1 overflow-y-auto">
                <SmartActions meetingId={meeting.id} />
              </div>
            )}
          </div>
        </div>
      )}

      {showExport && (
        <ExportModal
          meetingId={meeting.id}
          isEncrypted={meeting.is_encrypted}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}
