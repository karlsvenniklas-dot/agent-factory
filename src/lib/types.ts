// Databastyper som speglar Supabase-schemat.
// Uppdatera dessa när schemat förändras, eller generera om med: npx supabase gen types typescript

export type UserRole = "participant" | "editor" | "owner";

export interface Profile {
  id: string;
  display_name: string | null;
  role: UserRole;
  created_at: string;
}

export interface Round {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  created_by: string;
}

export interface Station {
  id: string;
  round_id: string;
  position: number; // 1-10
  name: string;
  qr_token: string;
  created_at: string;
}

// Svarsalternativ sparas som JSONB - array med 4 textsträngar
export type QuestionOptions = [string, string, string, string];

export interface Question {
  id: string;
  station_id: string;
  text: string;
  options: QuestionOptions;
  correct_index: number; // 0-3, visas INTE för deltagare
  points: number;
  created_at: string;
  updated_at: string;
}

// Vad deltagare ser - correct_index filtreras bort via DB-view/RPC
export type QuestionForParticipant = Omit<Question, "correct_index" | "points">;

export interface ParticipantAnswer {
  id: string;
  user_id: string;
  round_id: string;
  station_id: string;
  selected_index: number;
  is_correct: boolean;
  answered_at: string;
}

// Return-typ från get_ranking() RPC
export interface RankingEntry {
  user_id: string;
  display_name: string | null;
  total_points: number;
  correct_answers: number;
  answered_stations: number;
  rank: number;
}

// Return-typ från get_my_progress() RPC
export interface MyProgress {
  round_id: string;
  answered_stations: number;
  total_stations: number;
  total_points: number;
  correct_answers: number;
}

// Join-typ för att visa stationer med tillhörande fråga
export interface StationWithQuestion extends Station {
  question: QuestionForParticipant | null;
}

// Join-typ för admin-vyn
export interface StationWithQuestionAdmin extends Station {
  question: Question | null;
}

export interface RoundWithStations extends Round {
  stations: StationWithQuestion[];
}

// Supabase Database-typ för autocomplete i supabase-js
// Expanderas när vi kör: npx supabase gen types typescript --project-id <id>
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, "created_at"> & { created_at?: string };
        Update: Partial<Omit<Profile, "id">>;
      };
      rounds: {
        Row: Round;
        Insert: Omit<Round, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Round, "id" | "created_at">>;
      };
      stations: {
        Row: Station;
        Insert: Omit<Station, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Station, "id" | "created_at">>;
      };
      questions: {
        Row: Question;
        Insert: Omit<Question, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Question, "id" | "created_at">>;
      };
      participant_answers: {
        Row: ParticipantAnswer;
        Insert: Omit<ParticipantAnswer, "id"> & { id?: string };
        Update: Partial<Omit<ParticipantAnswer, "id">>;
      };
    };
    Views: {
      questions_public: {
        Row: QuestionForParticipant;
      };
    };
    Functions: {
      get_ranking: {
        Args: { round_uuid: string };
        Returns: RankingEntry[];
      };
      get_my_progress: {
        Args: { round_uuid: string };
        Returns: MyProgress;
      };
    };
    Enums: {
      user_role: UserRole;
    };
  };
};
