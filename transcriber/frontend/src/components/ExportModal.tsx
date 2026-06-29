import { useState } from "react";
import { X, Download } from "lucide-react";
import { api } from "../api/client";

const FORMATS = [
  { key: "srt", label: "SRT", desc: "Undertextformat för videospelare" },
  { key: "vtt", label: "WebVTT", desc: "Webbundertextformat" },
  { key: "txt", label: "Text", desc: "Ren text med talarnamn" },
  { key: "md", label: "Markdown", desc: "Formaterad text med tidsstämplar" },
  { key: "json", label: "JSON", desc: "Strukturerad data för vidarebearbetning" },
  { key: "docx", label: "Word", desc: "Microsoft Word-dokument" },
  { key: "pdf", label: "PDF", desc: "Portabelt PDF-dokument" },
];

interface Props {
  meetingId: string;
  isEncrypted: boolean;
  onClose: () => void;
}

export function ExportModal({ meetingId, isEncrypted, onClose }: Props) {
  const [password, setPassword] = useState("");

  const download = (format: string) => {
    const url = api.export.url(meetingId, format, isEncrypted && password ? password : undefined);
    const a = document.createElement("a");
    a.href = url;
    a.download = "";
    a.click();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 border border-gray-700 rounded-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Exportera transkript</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isEncrypted && (
          <div className="mb-4">
            <label className="text-sm text-gray-400 block mb-1">Lösenord för dekryptering</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Ange lösenord"
              className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        )}

        <div className="space-y-2">
          {FORMATS.map((f) => (
            <button
              key={f.key}
              onClick={() => download(f.key)}
              className="w-full flex items-center gap-3 p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-left"
            >
              <Download className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <p className="text-sm font-medium">{f.label}</p>
                <p className="text-xs text-gray-400">{f.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
