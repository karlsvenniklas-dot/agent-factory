import type { Meeting, Speaker, Segment, Action, ActionRun, AppSettings } from "../types";

const BASE = "/api";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...init?.headers },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail ?? res.statusText);
  }
  return res.json();
}

export const api = {
  meetings: {
    list: () => request<Meeting[]>("/meetings"),
    get: (id: string) => request<Meeting>(`/meetings/${id}`),
    upload: (file: File, title: string, language = "sv") => {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", title);
      fd.append("language", language);
      return fetch(`${BASE}/meetings`, { method: "POST", body: fd }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).detail);
        return r.json() as Promise<Meeting>;
      });
    },
    update: (id: string, body: Partial<Meeting>) =>
      request<Meeting>(`/meetings/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    delete: (id: string) => fetch(`${BASE}/meetings/${id}`, { method: "DELETE" }),
    reprocess: (id: string) => request<Meeting>(`/meetings/${id}/reprocess`, { method: "POST" }),
  },

  speakers: {
    list: (meetingId: string) => request<Speaker[]>(`/meetings/${meetingId}/speakers`),
    update: (meetingId: string, speakerId: string, body: { name?: string; color?: string }) =>
      request<Speaker>(`/meetings/${meetingId}/speakers/${speakerId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
    merge: (meetingId: string, sourceId: string, targetId: string) =>
      request<Speaker[]>(`/meetings/${meetingId}/speakers/merge`, {
        method: "POST",
        body: JSON.stringify({ source_speaker_id: sourceId, target_speaker_id: targetId }),
      }),
  },

  segments: {
    list: (meetingId: string) => request<Segment[]>(`/meetings/${meetingId}/segments`),
    update: (meetingId: string, segId: string, body: { text?: string; speaker_id?: string }) =>
      request<Segment>(`/meetings/${meetingId}/segments/${segId}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      }),
  },

  actions: {
    list: (meetingId: string) => request<Action[]>(`/meetings/${meetingId}/actions`),
    create: (meetingId: string, body: { name: string; prompt: string; is_favorite?: boolean }) =>
      request<Action>(`/meetings/${meetingId}/actions`, { method: "POST", body: JSON.stringify(body) }),
    run: (meetingId: string, actionId: string) =>
      request<ActionRun>(`/meetings/${meetingId}/actions/${actionId}/run`, { method: "POST" }),
    delete: (meetingId: string, actionId: string) =>
      fetch(`${BASE}/meetings/${meetingId}/actions/${actionId}`, { method: "DELETE" }),
  },

  export: {
    url: (meetingId: string, format: string, password?: string) => {
      const q = password ? `?password=${encodeURIComponent(password)}` : "";
      return `${BASE}/meetings/${meetingId}/export/${format}${q}`;
    },
  },

  audio: {
    url: (meetingId: string) => `${BASE}/meetings/${meetingId}/audio`,
  },

  settings: {
    get: () => request<AppSettings>("/settings"),
  },
};
