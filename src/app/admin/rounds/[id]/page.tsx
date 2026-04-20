// Admin-vy för en enskild omgång: redigera namn, hantera stationer.
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Plus, Pencil, Printer } from "lucide-react";
import { updateRound, addStation, deleteStation } from "../../actions";
import { ActiveToggleClient } from "./ActiveToggleClient";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}

export default async function RoundPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { error: errorParam, saved } = await searchParams;

  const supabase = await createClient();

  const { data: round } = await supabase
    .from("rounds")
    .select("id, name, description, is_active")
    .eq("id", id)
    .single();

  if (!round) notFound();

  const { data: stations } = await supabase
    .from("stations")
    .select("id, name, position, questions(text)")
    .eq("round_id", id)
    .order("position", { ascending: true });

  const stationCount = stations?.length ?? 0;

  return (
    <div className="animate-fade-in">
      {/* Tillbaka-länk */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1 text-sm text-bark hover:text-soil mb-6 min-h-[44px] rounded-lg px-2 focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        Alla omgångar
      </Link>

      {/* Feedback-notiser */}
      {saved && (
        <div className="mb-4 rounded-xl bg-forest-pale border border-forest-300 px-4 py-3 text-sm text-forest-700 font-medium">
          Stationen sparades!
        </div>
      )}
      {errorParam && (
        <div className="mb-4 rounded-xl bg-brick-pale border border-brick-300 px-4 py-3 text-sm text-brick-700 font-medium">
          {errorParam === "max_stations"
            ? "Max 10 stationer per omgång."
            : "Något gick fel. Försök igen."}
        </div>
      )}

      {/* Omgång-formulär */}
      <section className="bg-white rounded-2xl shadow-card border border-linen-dark p-6 mb-6">
        <h1 className="text-xl font-display font-bold text-soil mb-5">
          Redigera omgång
        </h1>

        <form action={updateRound} className="flex flex-col gap-5">
          <input type="hidden" name="round_id" value={id} />

          <div className="flex flex-col gap-2">
            <label htmlFor="round-name" className="text-sm font-semibold text-soil">
              Namn
            </label>
            <input
              id="round-name"
              name="name"
              type="text"
              defaultValue={round.name}
              required
              className="w-full min-h-[48px] px-4 rounded-xl bg-white border-2 border-sand text-soil text-base hover:border-forest-300 focus:outline-none focus:border-forest-600 focus:ring-4 focus:ring-forest-200 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="round-desc"
              className="text-sm font-semibold text-soil"
            >
              Beskrivning{" "}
              <span className="text-bark font-normal">(valfri)</span>
            </label>
            <textarea
              id="round-desc"
              name="description"
              rows={2}
              defaultValue={round.description ?? ""}
              className="w-full px-4 py-3 rounded-xl bg-white border-2 border-sand text-soil text-base hover:border-forest-300 focus:outline-none focus:border-forest-600 focus:ring-4 focus:ring-forest-200 transition-colors resize-none"
            />
          </div>

          {/* Aktiv-toggle via Client Component */}
          <ActiveToggleClient
            roundId={id}
            initialActive={round.is_active}
          />

          <button
            type="submit"
            className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-xl bg-forest-600 text-white text-base font-semibold shadow-button hover:bg-forest-700 active:scale-95 transition-all focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none self-start"
          >
            Spara ändringar
          </button>
        </form>
      </section>

      {/* Stationer */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-soil">
            Stationer ({stationCount})
          </h2>
          {stationCount > 0 && (
            <Link
              href={`/admin/rounds/${id}/qr`}
              className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl border-2 border-sand text-bark text-sm font-semibold hover:bg-linen-dark hover:border-bark transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none"
            >
              <Printer className="w-4 h-4" aria-hidden="true" />
              Skriv ut QR-koder
            </Link>
          )}
        </div>

        {stations && stations.length > 0 ? (
          <ul className="flex flex-col gap-3 mb-4">
            {stations.map((station) => {
              // questions är en join - kan vara array eller objekt beroende på Supabase
              const questions = Array.isArray(station.questions)
                ? station.questions
                : [];
              const question = questions[0] as { text?: string } | undefined;

              return (
                <li
                  key={station.id}
                  className="bg-white rounded-2xl shadow-card border border-linen-dark p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-7 h-7 rounded-full bg-forest-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                          {station.position}
                        </span>
                        <h3 className="text-base font-semibold text-soil truncate">
                          {station.name}
                        </h3>
                      </div>
                      {question?.text ? (
                        <p className="text-sm text-bark line-clamp-2 ml-9">
                          {question.text}
                        </p>
                      ) : (
                        <p className="text-sm text-brick-600 ml-9">
                          Ingen fråga tillagd
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 flex-shrink-0">
                      <Link
                        href={`/admin/rounds/${id}/stations/${station.id}`}
                        className="inline-flex items-center gap-1.5 min-h-[40px] px-3 rounded-lg border-2 border-forest-600 text-forest-600 text-sm font-medium hover:bg-forest-pale transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none"
                        aria-label={`Redigera ${station.name}`}
                      >
                        <Pencil className="w-4 h-4" aria-hidden="true" />
                        <span className="hidden sm:block">Redigera</span>
                      </Link>

                      <form action={deleteStation}>
                        <input type="hidden" name="station_id" value={station.id} />
                        <input type="hidden" name="round_id" value={id} />
                        <DeleteStationButton name={station.name} />
                      </form>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="bg-white rounded-2xl shadow-card border border-linen-dark p-8 text-center mb-4">
            <p className="text-bark text-base">Inga stationer ännu.</p>
            <p className="text-sm text-bark/60 mt-1">
              Lägg till den första stationen nedan.
            </p>
          </div>
        )}

        {/* Lägg till station - max 10 */}
        {stationCount < 10 && (
          <form action={addStation}>
            <input type="hidden" name="round_id" value={id} />
            <button
              type="submit"
              className="inline-flex items-center gap-2 min-h-[48px] px-5 rounded-xl border-2 border-dashed border-forest-400 text-forest-600 text-base font-semibold hover:bg-forest-pale hover:border-forest-600 transition-all active:scale-95 focus-visible:ring-4 focus-visible:ring-forest-300 focus-visible:outline-none w-full justify-center"
            >
              <Plus className="w-5 h-5" aria-hidden="true" />
              Lägg till station
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

// Liten inline Client Component för confirm-dialog vid ta bort
import { DeleteStationButton } from "./DeleteStationButton";
