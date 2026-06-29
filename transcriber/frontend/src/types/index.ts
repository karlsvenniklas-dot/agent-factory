export type MeetingStatus =
  | "pending"
  | "converting"
  | "transcribing"
  | "diarizing"
  | "identifying"
  | "done"
  | "error";

export interface Meeting {
  id: string;
  title: string;
  status: MeetingStatus;
  duration_seconds: number | null;
  num_speakers: number | null;
  is_encrypted: boolean;
  is_live: boolean;
  created_at: string;
  progress_message: string | null;
  progress_percent: number;
  error_message: string | null;
  language: string;
  original_filename: string | null;
  completed_at: string | null;
  updated_at: string;
}

export interface Speaker {
  id: string;
  meeting_id: string;
  label: string;
  name: string;
  color: string;
  is_identified: boolean;
}

export interface Segment {
  id: string;
  meeting_id: string;
  speaker_id: string | null;
  start_time: number;
  end_time: number;
  text: string;
  original_text: string | null;
  confidence: number | null;
  is_edited: boolean;
}

export interface Action {
  id: string;
  meeting_id: string;
  name: string;
  prompt: string;
  is_favorite: boolean;
  created_at: string;
  runs: ActionRun[];
}

export interface ActionRun {
  id: string;
  action_id: string;
  result: string;
  created_at: string;
}

export interface ProgressEvent {
  meeting_id: string;
  status: MeetingStatus;
  percent: number;
  message: string;
}

export interface AppSettings {
  llm_backend: string;
  ollama_model: string;
  openrouter_model: string;
  whisper_model: string;
  use_kb_lab_model: boolean;
  has_kb_lab_model: boolean;
  has_whisper_cpp: boolean;
}
