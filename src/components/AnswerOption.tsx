"use client";

import { CheckCircle2, XCircle } from "lucide-react";

type AnswerState = "default" | "selected" | "correct" | "incorrect" | "correct-highlight";

interface AnswerOptionProps {
  letter: string; // "A", "B", "C", "D"
  text: string;
  state: AnswerState;
  hasAnswered: boolean;
  onClick?: () => void;
}

function prefixClasses(state: AnswerState, hasAnswered: boolean) {
  if (!hasAnswered) {
    return "bg-linen-dark text-bark";
  }
  if (state === "correct") return "bg-forest-600 text-white";
  if (state === "incorrect") return "bg-brick-600 text-white";
  return "bg-linen-dark text-bark";
}

export function AnswerOption({
  letter,
  text,
  state,
  hasAnswered,
  onClick,
}: AnswerOptionProps) {
  const base = [
    "w-full min-h-[64px] px-5 py-4 rounded-2xl",
    "border-2 text-soil text-lg font-medium",
    "text-left flex items-center gap-3",
    "shadow-answer",
    "transition-all duration-200",
    "focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:ring-offset-2 focus-visible:outline-none",
  ];

  let stateClasses = "bg-white border-linen-dark hover:border-forest-400 hover:bg-forest-pale active:scale-[0.98] cursor-pointer";

  if (!hasAnswered && state === "selected") {
    stateClasses =
      "bg-forest-pale border-forest-600 shadow-answer-selected ring-2 ring-forest-400 cursor-pointer active:scale-[0.98]";
  } else if (hasAnswered) {
    if (state === "correct") {
      stateClasses = "bg-forest-pale border-forest-600 animate-pop cursor-not-allowed";
    } else if (state === "incorrect") {
      stateClasses = "bg-brick-pale border-brick-600 animate-shake cursor-not-allowed";
    } else if (state === "correct-highlight") {
      stateClasses = "bg-forest-pale/50 border-forest-400 cursor-not-allowed opacity-70";
    } else {
      stateClasses = "bg-white border-linen-dark cursor-not-allowed opacity-60";
    }
  }

  const classes = [...base, stateClasses].join(" ");

  function renderPrefix() {
    if (hasAnswered && state === "correct") {
      return <CheckCircle2 className="w-5 h-5" aria-hidden="true" />;
    }
    if (hasAnswered && state === "incorrect") {
      return <XCircle className="w-5 h-5" aria-hidden="true" />;
    }
    return letter;
  }

  return (
    <button
      role="radio"
      aria-checked={state === "selected"}
      onClick={hasAnswered ? undefined : onClick}
      disabled={hasAnswered}
      className={classes}
    >
      <span
        className={[
          "w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center",
          "text-sm font-semibold",
          prefixClasses(state, hasAnswered),
        ].join(" ")}
      >
        {renderPrefix()}
      </span>
      <span>{text}</span>
    </button>
  );
}
