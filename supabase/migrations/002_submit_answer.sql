-- ============================================================
-- Migration 002: RPC för att skicka in svar säkert server-side
-- Hämtar correct_index från questions-tabellen (som deltagare
-- inte har direkt access till) och sparar svaret.
-- ============================================================

CREATE OR REPLACE FUNCTION submit_answer(
  p_station_id  UUID,
  p_selected_index INT
)
RETURNS TABLE (
  is_correct    BOOLEAN,
  correct_index INT
)
LANGUAGE plpgsql
SECURITY DEFINER  -- Kör som funktion-owner, kan läsa correct_index
AS $$
DECLARE
  v_question        RECORD;
  v_round_id        UUID;
  v_is_correct      BOOLEAN;
BEGIN
  -- Hämta frågan för stationen
  SELECT q.correct_index, q.points, s.round_id
  INTO v_question
  FROM questions q
  JOIN stations s ON s.id = q.station_id
  WHERE q.station_id = p_station_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Station eller fråga hittades inte: %', p_station_id;
  END IF;

  v_round_id := v_question.round_id;
  v_is_correct := (p_selected_index = v_question.correct_index);

  -- Spara svaret - UNIQUE constraint (user_id, round_id, station_id) förhindrar dubbelsvar
  -- ON CONFLICT DO NOTHING gör att vi returnerar NULL om svaret redan finns
  INSERT INTO participant_answers (
    user_id,
    round_id,
    station_id,
    selected_index,
    is_correct
  )
  VALUES (
    auth.uid(),
    v_round_id,
    p_station_id,
    p_selected_index,
    v_is_correct
  )
  ON CONFLICT (user_id, round_id, station_id) DO NOTHING;

  -- Returnera alltid rätt index och om svaret var korrekt
  RETURN QUERY SELECT v_is_correct, v_question.correct_index::INT;
END;
$$;

-- Uppdatera Database-typen (dokumenteras här för generering)
-- RPC: submit_answer(p_station_id, p_selected_index)
-- Returns: (is_correct boolean, correct_index int)
