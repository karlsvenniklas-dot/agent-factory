// Redigera station + fråga
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { saveStation } from "../../../../actions";

interface PageProps {
  params: Promise<{ id: string; stationId: string }>;
  searchParams: Promise<{ error?: string }>;
}

const LETTERS = ["A", "B", "C", "D"];

export default async function StationEditPage({
  params,
  searchParams,
}: PageProps) {
  const { id: roundId, stationId } = await params;
  const { error: errorParam } = await searchParams;

  const supabase = await createClient();

  const { data: station } = await supabase
    .from("stations")
    .select("id, name, position, round_id")
    .eq("id", stationId)
    .eq("round_id", roundId)
    .single();

  if (!station) notFound();

  const { data: question } = await supabase
    .from("questions")
    .select("id, text, options, correct_index, points")
    .eq("station_id", stationId)
    .single();

  const options = (question?.options ?? ["", "", "", ""]) as string[];

  return (
    <div className="animate-fade-in">
      {/* Tillbaka */}
      <Link
        href={`/admin/rounds/${roundId}`}
        className="inline-flex items-center gap-1 text-sm text-bark hover:text-soil mb-6 min-h-[44px] rounded-lg px-2 focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        Tillbaka till omgången
      </Link>

      {errorParam && (
        <div className="mb-4 rounded-xl bg-brick-pale border border-brick-300 px-4 py-3 text-sm text-brick-700 font-medium">
          Något gick fel. Kontrollera att alla fält är ifyllda.
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card border border-linen-dark p-6">
        <h1 className="text-xl font-display font-bold text-soil mb-6">
          Station {station.position}: {station.name}
        </h1>

        <form action={saveStation} className="flex flex-col gap-6">
          <input type="hidden" name="station_id" value={stationId} />
          <input type="hidden" name="round_id" value={roundId} />

          {/* Stationsnamn */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="station-name"
              className="text-sm font-semibold text-soil"
            >
              Stationsnamn
            </label>
            <input
              id="station-name"
              name="station_name"
              type="text"
              defaultValue={station.name}
              required
              placeholder="t.ex. Kyrkan"
              className="w-full min-h-[48px] px-4 rounded-xl bg-white border-2 border-sand text-soil text-base hover:border-forest-300 focus:outline-none focus:border-forest-600 focus:ring-4 focus:ring-forest-200 transition-colors"
            />
          </div>

          {/* Frågetext */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="question-text"
              className="text-sm font-semibold text-soil"
            >
              Frågetext
            </label>
            <textarea
              id="question-text"
              name="question_text"
              rows={3}
              defaultValue={question?.text ?? ""}
              required
              placeholder="t.ex. Vilket år byggdes Kinnareds kyrka?"
              className="w-full px-4 py-3 rounded-xl bg-white border-2 border-sand text-soil text-base hover:border-forest-300 focus:outline-none focus:border-forest-600 focus:ring-4 focus:ring-forest-200 transition-colors resize-none"
            />
          </div>

          {/* Svarsalternativ */}
          <fieldset>
            <legend className="text-sm font-semibold text-soil mb-3">
              Svarsalternativ{" "}
              <span className="text-bark font-normal">
                (markera rätt svar)
              </span>
            </legend>
            <div className="flex flex-col gap-3">
              {LETTERS.map((letter, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-4 rounded-xl border-2 border-sand bg-linen has-[:checked]:border-forest-600 has-[:checked]:bg-forest-pale transition-colors"
                >
                  <input
                    type="radio"
                    name="correct_index"
                    value={index}
                    id={`correct-${index}`}
                    defaultChecked={question?.correct_index === index}
                    required
                    className="w-5 h-5 text-forest-600 border-2 border-sand focus:ring-4 focus:ring-forest-200 focus:outline-none accent-forest-600"
                  />
                  <span className="w-7 h-7 rounded-full bg-linen-dark text-bark text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {letter}
                  </span>
                  <input
                    type="text"
                    name={`option_${index}`}
                    defaultValue={options[index] ?? ""}
                    required
                    placeholder={`Alternativ ${letter}`}
                    className="flex-1 min-h-[40px] px-3 rounded-lg bg-white border border-sand text-soil text-base hover:border-forest-300 focus:outline-none focus:border-forest-600 focus:ring-2 focus:ring-forest-200 transition-colors"
                    aria-label={`Alternativ ${letter}`}
                  />
                  <label
                    htmlFor={`correct-${index}`}
                    className="text-xs text-forest-600 font-semibold hidden"
                  >
                    Rätt svar
                  </label>
                </div>
              ))}
            </div>
            <p className="text-xs text-bark mt-2">
              Klicka på radioknappen vid det korrekta alternativet.
            </p>
          </fieldset>

          {/* Poäng */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="points"
              className="text-sm font-semibold text-soil"
            >
              Poäng per rätt svar
            </label>
            <input
              id="points"
              name="points"
              type="number"
              min="1"
              max="10"
              defaultValue={question?.points ?? 1}
              className="w-24 min-h-[48px] px-4 rounded-xl bg-white border-2 border-sand text-soil text-base hover:border-forest-300 focus:outline-none focus:border-forest-600 focus:ring-4 focus:ring-forest-200 transition-colors"
            />
          </div>

          {/* Knappar */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-forest-600 text-white text-base font-semibold shadow-button hover:bg-forest-700 active:scale-95 transition-all focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none"
            >
              Spara station
            </button>
            <Link
              href={`/admin/rounds/${roundId}`}
              className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-linen border-2 border-forest-600 text-forest-600 text-base font-semibold hover:bg-forest-pale transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none"
            >
              Avbryt
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
