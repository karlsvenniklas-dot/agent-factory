// Admin-layout med rollskydd. Bara 'editor' och 'owner' får tillgång.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/lib/types";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Hämta profil för rollkontroll.
  // Typen castas explicit tills vi har genererade Supabase-typer från riktig DB.
  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single() as { data: { role: UserRole } | null; error: unknown };

  const role = profileData?.role;

  if (!role || role === "participant") {
    // Vanliga deltagare har ingen admin-access
    redirect("/play");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-4 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <div>
            <span className="font-semibold text-forest-700">Admin</span>
            <span className="ml-2 text-sm text-gray-500">
              Tipspromenaden Kinnared
            </span>
          </div>
          <span className="rounded-full bg-forest-100 px-2 py-0.5 text-xs font-medium text-forest-700 capitalize">
            {role}
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
