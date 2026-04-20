-- ============================================================
-- Migration 001: Initial schema för Tipspromenaden Kinnared
-- Körs mot Supabase Cloud via Dashboard > SQL Editor eller
-- Supabase CLI: supabase db push
-- ============================================================

-- ---------------------------------------------------------------
-- ENUM: användarroller
-- ---------------------------------------------------------------
CREATE TYPE user_role AS ENUM ('participant', 'editor', 'owner');

-- ---------------------------------------------------------------
-- TABELL: profiles
-- Utökar auth.users med applikationsspecifik data.
-- Skapas automatiskt via trigger vid ny auth-användare.
-- ---------------------------------------------------------------
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  role          user_role NOT NULL DEFAULT 'participant',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: skapa profil automatiskt vid ny auth-användare
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, role)
  VALUES (
    NEW.id,
    -- Använd e-post-prefix som defaultnamn om inget annat finns
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
    'participant'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ---------------------------------------------------------------
-- TABELL: rounds
-- En omgång av tipspromenaden. Bara en bör vara aktiv åt gången.
-- ---------------------------------------------------------------
CREATE TABLE rounds (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  description  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT false,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by   UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT
);

-- Partiellt index: max en aktiv omgång åt gången
CREATE UNIQUE INDEX one_active_round ON rounds (is_active) WHERE is_active = true;

-- ---------------------------------------------------------------
-- TABELL: stations
-- Fysiska stationer i en omgång. Varje station har en unik QR-token.
-- ---------------------------------------------------------------
CREATE TABLE stations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id    UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  position    INT NOT NULL CHECK (position BETWEEN 1 AND 10),
  name        TEXT NOT NULL,
  qr_token    TEXT NOT NULL UNIQUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (round_id, position)  -- En position per omgång
);

-- ---------------------------------------------------------------
-- TABELL: questions
-- Varje station har exakt en fråga med 4 svarsalternativ.
-- ---------------------------------------------------------------
CREATE TABLE questions (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id     UUID NOT NULL UNIQUE REFERENCES stations(id) ON DELETE CASCADE,
  text           TEXT NOT NULL,
  options        JSONB NOT NULL,  -- ["Alt A", "Alt B", "Alt C", "Alt D"]
  correct_index  INT NOT NULL CHECK (correct_index BETWEEN 0 AND 3),
  points         INT NOT NULL DEFAULT 1 CHECK (points > 0),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Constraint: options måste vara en array med exakt 4 element
ALTER TABLE questions ADD CONSTRAINT options_has_four_elements
  CHECK (jsonb_array_length(options) = 4);

-- Trigger: uppdatera updated_at automatiskt
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ---------------------------------------------------------------
-- VIEW: questions_public
-- Döljer correct_index och points för deltagare.
-- Deltagare ska aldrig se rätt svar via API.
-- ---------------------------------------------------------------
CREATE OR REPLACE VIEW questions_public AS
  SELECT
    id,
    station_id,
    text,
    options,
    created_at,
    updated_at
  FROM questions;

-- ---------------------------------------------------------------
-- TABELL: participant_answers
-- Sparar deltagarens svar. En post per station per omgång.
-- is_correct räknas ut vid INSERT för att undvika att correct_index
-- behöver exponeras till klienten.
-- ---------------------------------------------------------------
CREATE TABLE participant_answers (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  round_id        UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  station_id      UUID NOT NULL REFERENCES stations(id) ON DELETE CASCADE,
  selected_index  INT NOT NULL CHECK (selected_index BETWEEN 0 AND 3),
  is_correct      BOOLEAN NOT NULL,
  answered_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- Ett försök per station per omgång och användare
  UNIQUE (user_id, round_id, station_id)
);

-- Index för ranking-queries
CREATE INDEX participant_answers_round_idx ON participant_answers(round_id);
CREATE INDEX participant_answers_user_round_idx ON participant_answers(user_id, round_id);

-- ---------------------------------------------------------------
-- RPC: get_ranking(round_uuid)
-- Returnerar poängställning för en omgång, sorterat efter poäng.
-- Kallas från klienten: supabase.rpc('get_ranking', { round_uuid: '...' })
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_ranking(round_uuid UUID)
RETURNS TABLE (
  user_id           UUID,
  display_name      TEXT,
  total_points      BIGINT,
  correct_answers   BIGINT,
  answered_stations BIGINT,
  rank              BIGINT
)
LANGUAGE sql
SECURITY DEFINER  -- Kör som funktion-owner för att läsa correct_index
STABLE
AS $$
  SELECT
    pa.user_id,
    p.display_name,
    SUM(CASE WHEN pa.is_correct THEN q.points ELSE 0 END) AS total_points,
    COUNT(*) FILTER (WHERE pa.is_correct)                  AS correct_answers,
    COUNT(*)                                               AS answered_stations,
    RANK() OVER (
      ORDER BY SUM(CASE WHEN pa.is_correct THEN q.points ELSE 0 END) DESC,
               COUNT(*) FILTER (WHERE pa.is_correct) DESC
    )                                                      AS rank
  FROM participant_answers pa
  JOIN profiles p ON p.id = pa.user_id
  JOIN questions q ON q.station_id = pa.station_id
  WHERE pa.round_id = round_uuid
  GROUP BY pa.user_id, p.display_name
  ORDER BY total_points DESC, correct_answers DESC;
$$;

-- ---------------------------------------------------------------
-- RPC: get_my_progress(round_uuid)
-- Returnerar den inloggade användarens progress i en omgång.
-- ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_my_progress(round_uuid UUID)
RETURNS TABLE (
  round_id          UUID,
  answered_stations BIGINT,
  total_stations    BIGINT,
  total_points      BIGINT,
  correct_answers   BIGINT
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT
    round_uuid                                              AS round_id,
    COUNT(pa.id)                                           AS answered_stations,
    (SELECT COUNT(*) FROM stations s WHERE s.round_id = round_uuid) AS total_stations,
    SUM(CASE WHEN pa.is_correct THEN q.points ELSE 0 END) AS total_points,
    COUNT(*) FILTER (WHERE pa.is_correct)                  AS correct_answers
  FROM participant_answers pa
  JOIN questions q ON q.station_id = pa.station_id
  WHERE pa.round_id = round_uuid
    AND pa.user_id = auth.uid();
$$;

-- ---------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------

ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds              ENABLE ROW LEVEL SECURITY;
ALTER TABLE stations            ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions           ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_answers ENABLE ROW LEVEL SECURITY;

-- profiles: läsa/uppdatera sin egen profil
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- rounds: alla autentiserade kan läsa aktiva omgångar
CREATE POLICY "rounds_select_active"
  ON rounds FOR SELECT
  USING (auth.role() = 'authenticated' AND is_active = true);

-- rounds: editors och owners kan läsa alla omgångar
CREATE POLICY "rounds_select_all_editors"
  ON rounds FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'owner')
    )
  );

-- rounds: editors och owners kan skapa och uppdatera
CREATE POLICY "rounds_insert_editors"
  ON rounds FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'owner')
    )
  );

CREATE POLICY "rounds_update_editors"
  ON rounds FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'owner')
    )
  );

-- stations: alla autentiserade kan läsa stationer i aktiva omgångar
CREATE POLICY "stations_select_active"
  ON stations FOR SELECT
  USING (
    auth.role() = 'authenticated' AND
    EXISTS (
      SELECT 1 FROM rounds
      WHERE rounds.id = stations.round_id AND rounds.is_active = true
    )
  );

-- stations: editors och owners kan läsa alla
CREATE POLICY "stations_select_all_editors"
  ON stations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'owner')
    )
  );

-- stations: editors och owners kan skapa och uppdatera
CREATE POLICY "stations_insert_editors"
  ON stations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'owner')
    )
  );

CREATE POLICY "stations_update_editors"
  ON stations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'owner')
    )
  );

-- questions: deltagare använder questions_public-vyn (ingen RLS behövs på vyn)
-- Full questions-tabell (inkl correct_index) bara för editors/owners
CREATE POLICY "questions_select_editors"
  ON questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'owner')
    )
  );

CREATE POLICY "questions_insert_editors"
  ON questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'owner')
    )
  );

CREATE POLICY "questions_update_editors"
  ON questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('editor', 'owner')
    )
  );

-- participant_answers: användare kan läsa och skapa sina egna svar
CREATE POLICY "answers_select_own"
  ON participant_answers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "answers_insert_own"
  ON participant_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- participant_answers: owners kan läsa allas svar
CREATE POLICY "answers_select_owners"
  ON participant_answers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'owner'
    )
  );

-- ---------------------------------------------------------------
-- Grant VIEW access till autentiserade användare
-- (vyn är read-only, RLS på base tables skyddar fortfarande)
-- ---------------------------------------------------------------
GRANT SELECT ON questions_public TO authenticated;
