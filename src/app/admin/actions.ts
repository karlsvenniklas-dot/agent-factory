"use server";

// Server Actions för admin-operationer.
// Alla mutations går via dessa - inte API routes.

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// Skapa ny omgång och redirecta till redigeringssidan
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createRound(_formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: round, error } = await supabase
    .from("rounds")
    .insert({
      name: "Ny omgång",
      description: null,
      is_active: false,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error || !round) {
    // Felet visas på admin-sidan
    redirect("/admin?error=create_failed");
  }

  redirect(`/admin/rounds/${round.id}`);
}

// Uppdatera omgång (namn, beskrivning, aktiv-status)
export async function updateRound(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const roundId = formData.get("round_id") as string;
  const name = (formData.get("name") as string).trim();
  const description = (formData.get("description") as string).trim() || null;
  const isActive = formData.get("is_active") === "true";

  // Om vi aktiverar denna omgång, inaktivera andra först
  // Partial unique index i DB skyddar mot två aktiva, men för bättre UX
  // deactiveras gamla omgångar explicit här
  if (isActive) {
    await supabase
      .from("rounds")
      .update({ is_active: false })
      .neq("id", roundId)
      .eq("is_active", true);
  }

  const { error } = await supabase
    .from("rounds")
    .update({ name, description, is_active: isActive })
    .eq("id", roundId);

  if (error) {
    redirect(`/admin/rounds/${roundId}?error=update_failed`);
  }

  revalidatePath(`/admin/rounds/${roundId}`);
  revalidatePath("/admin");
}

// Lägg till ny station till omgång
export async function addStation(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const roundId = formData.get("round_id") as string;

  // Räkna befintliga stationer för att bestämma position
  const { count } = await supabase
    .from("stations")
    .select("id", { count: "exact", head: true })
    .eq("round_id", roundId);

  const nextPosition = (count ?? 0) + 1;

  if (nextPosition > 10) {
    redirect(`/admin/rounds/${roundId}?error=max_stations`);
  }

  // Generera unik QR-token
  const token = crypto.randomUUID().replace(/-/g, "").substring(0, 16);

  const { data: station, error } = await supabase
    .from("stations")
    .insert({
      round_id: roundId,
      position: nextPosition,
      name: `Station ${nextPosition}`,
      qr_token: token,
    })
    .select("id")
    .single();

  if (error || !station) {
    redirect(`/admin/rounds/${roundId}?error=add_station_failed`);
  }

  redirect(`/admin/rounds/${roundId}/stations/${station.id}`);
}

// Ta bort station (och dess fråga via CASCADE)
export async function deleteStation(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const stationId = formData.get("station_id") as string;
  const roundId = formData.get("round_id") as string;

  await supabase.from("stations").delete().eq("id", stationId);

  revalidatePath(`/admin/rounds/${roundId}`);
  redirect(`/admin/rounds/${roundId}`);
}

// Spara station + fråga
export async function saveStation(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const stationId = formData.get("station_id") as string;
  const roundId = formData.get("round_id") as string;
  const stationName = (formData.get("station_name") as string).trim();
  const questionText = (formData.get("question_text") as string).trim();
  const option0 = (formData.get("option_0") as string).trim();
  const option1 = (formData.get("option_1") as string).trim();
  const option2 = (formData.get("option_2") as string).trim();
  const option3 = (formData.get("option_3") as string).trim();
  const correctIndex = parseInt(formData.get("correct_index") as string, 10);
  const points = parseInt(formData.get("points") as string, 10) || 1;

  // Uppdatera stationsnamn
  const { error: stationError } = await supabase
    .from("stations")
    .update({ name: stationName })
    .eq("id", stationId);

  if (stationError) {
    redirect(`/admin/rounds/${roundId}/stations/${stationId}?error=save_failed`);
  }

  const options = [option0, option1, option2, option3];

  // Upsert fråga - ON CONFLICT (station_id) DO UPDATE
  const { error: questionError } = await supabase
    .from("questions")
    .upsert(
      {
        station_id: stationId,
        text: questionText,
        options,
        correct_index: correctIndex,
        points,
      },
      { onConflict: "station_id" }
    );

  if (questionError) {
    redirect(`/admin/rounds/${roundId}/stations/${stationId}?error=save_failed`);
  }

  revalidatePath(`/admin/rounds/${roundId}`);
  redirect(`/admin/rounds/${roundId}?saved=true`);
}
