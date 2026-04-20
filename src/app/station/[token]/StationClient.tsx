"use client";

// Client Component för interaktiv svarslogik.
// Anropar submit_answer RPC via Supabase och visar feedback inline.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AnswerOption } from "@/components/AnswerOption";
import { ProgressBar } from "@/components/ProgressBar";
import { MapPin } from "lucide-react";
import type { QuestionOptions } from "@/lib/types";

const LETTERS = ["A", "B", "C", "D"] as const;

interface Props {
  stationId: string;
  stationName: string;
  stationPosition: number;
  questionText: string;
  questionOptions: QuestionOptions;
  totalStations: number;
  answeredSoFar: number;
}

type FeedbackState = {
  isCorrect: boolean;
  correctIndex: number;
  selectedIndex: number;
} | null;

export function StationClient({
  stationId,
  stationName,
  stationPosition,
  questionText,
  questionOptions,
  totalStations,
  answeredSoFar,
}: Props) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const hasAnswered = feedback !== null;

  async function handleSubmit() {
    if (selectedIndex === null || isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("submit_answer", {
        p_station_id: stationId,
        p_selected_index: selectedIndex,
      });

      if (error) {
        setSubmitError("Kunde inte skicka svaret. Försök igen.");
        return;
      }

      // RPC returnerar array med ett element
      const result = Array.isArray(data) ? data[0] : data;
      setFeedback({
        isCorrect: result.is_correct,
        correctIndex: result.correct_index,
        selectedIndex,
      });
    } catch {
      setSubmitError("Något gick fel. Försök igen.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function getAnswerState(index: number) {
    if (!hasAnswered) {
      return selectedIndex === index ? "selected" : "default";
    }
    // Efter svar
    const isCorrectAnswer = index === feedback.correctIndex;
    const isMyAnswer = index === feedback.selectedIndex;

    if (isCorrectAnswer && feedback.isCorrect && isMyAnswer) return "correct";
    if (!feedback.isCorrect && isMyAnswer) return "incorrect";
    if (isCorrectAnswer) return "correct-highlight";
    return "default";
  }

  // Feedback-skärm efter svar
  if (hasAnswered) {
    const isCorrect = feedback.isCorrect;
    const correctText = questionOptions[feedback.correctIndex];
    const isLastStation = answeredSoFar + 1 >= totalStations;

    return (
      <div className="max-w-md mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Progress */}
        <ProgressBar answered={answeredSoFar + 1} total={totalStations} />

        {/* Feedback card */}
        <div
          className={[
            "rounded-2xl shadow-card p-6 text-center",
            isCorrect
              ? "bg-forest-pale border-2 border-forest-400 animate-pop"
              : "bg-brick-pale border-2 border-brick-400 animate-shake",
          ].join(" ")}
        >
          <div className="text-5xl mb-4 animate-fade-in" aria-hidden="true">
            {isCorrect ? "🎉" : "🍂"}
          </div>
          <h2
            className={[
              "text-2xl font-display font-bold mb-3 animate-slide-up",
              isCorrect ? "text-forest-700" : "text-brick-700",
            ].join(" ")}
          >
            {isCorrect ? "Bra jobbat!" : "Nära - men inte riktigt!"}
          </h2>

          <p className="text-base text-soil mb-2 animate-slide-up">
            Rätt svar:{" "}
            <strong className={isCorrect ? "text-forest-700" : "text-brick-700"}>
              {correctText}
            </strong>
          </p>

          {!isCorrect && (
            <p className="text-sm text-bark animate-slide-up">
              Du svarade: {questionOptions[feedback.selectedIndex]}
            </p>
          )}
        </div>

        {/* Svarsalternativ med feedback-states */}
        <div className="flex flex-col gap-3" role="radiogroup" aria-label="Ditt svar">
          {questionOptions.map((option, index) => (
            <AnswerOption
              key={index}
              letter={LETTERS[index]}
              text={option}
              state={getAnswerState(index)}
              hasAnswered={true}
            />
          ))}
        </div>

        {/* Fortsätt-knapp */}
        <button
          onClick={() =>
            isLastStation
              ? router.push("/leaderboard")
              : router.push("/play")
          }
          className="inline-flex items-center justify-center gap-2 w-full min-h-[56px] px-8 rounded-xl bg-forest-600 text-white text-lg font-semibold shadow-button transition-all duration-150 hover:bg-forest-700 hover:shadow-button-hover active:scale-95 active:shadow-none focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2 focus-visible:outline-none animate-slide-up"
        >
          {isLastStation ? "Se resultatet" : "Fortsätt promenaden"}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 18 6-6-6-6" />
          </svg>
        </button>
      </div>
    );
  }

  // Frågeskärm
  return (
    <div className="max-w-md mx-auto px-4 py-8 flex flex-col gap-6">
      {/* Progress */}
      <ProgressBar answered={answeredSoFar} total={totalStations} />

      {/* Station-etikett */}
      <div className="flex items-center gap-2 text-bark">
        <MapPin className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
        <span className="text-sm font-medium">
          Station {stationPosition} av {totalStations} &mdash; {stationName}
        </span>
      </div>

      {/* Frågekort */}
      <div className="bg-white rounded-2xl shadow-card p-6 border border-linen-dark">
        <h1 className="text-xl font-display font-bold text-soil leading-snug">
          {questionText}
        </h1>
      </div>

      {/* Svarsalternativ */}
      <div
        className="flex flex-col gap-3"
        role="radiogroup"
        aria-label="Välj ett svar"
      >
        {questionOptions.map((option, index) => (
          <AnswerOption
            key={index}
            letter={LETTERS[index]}
            text={option}
            state={selectedIndex === index ? "selected" : "default"}
            hasAnswered={false}
            onClick={() => setSelectedIndex(index)}
          />
        ))}
      </div>

      {submitError && (
        <div
          role="alert"
          className="rounded-xl bg-brick-pale border border-brick-300 px-4 py-3 text-sm text-brick-700 font-medium"
        >
          {submitError}
        </div>
      )}

      {/* Svara-knapp */}
      <button
        onClick={handleSubmit}
        disabled={selectedIndex === null || isSubmitting}
        aria-busy={isSubmitting}
        className="inline-flex items-center justify-center gap-2 w-full min-h-[56px] px-8 rounded-xl bg-forest-600 text-white text-lg font-semibold shadow-button transition-all duration-150 hover:bg-forest-700 hover:shadow-button-hover active:scale-95 active:shadow-none focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2 focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {isSubmitting ? (
          <>
            <svg
              className="w-5 h-5 animate-spin"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span>Skickar...</span>
          </>
        ) : (
          "Svara"
        )}
      </button>
    </div>
  );
}
