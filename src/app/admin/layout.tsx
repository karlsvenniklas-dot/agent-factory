// Admin-layout med rollskydd. Bara 'editor' och 'owner' får tillgång.
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminHeader } from "@/components/Header";
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
    redirect("/login?next=/admin");
  }

  const { data: profileData } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single() as { data: { role: UserRole } | null; error: unknown };

  const role = profileData?.role;

  if (!role || role === "participant") {
    redirect("/play");
  }

  return (
    <div className="min-h-screen bg-linen">
      <AdminHeader />
      <main className="mx-auto max-w-4xl px-4 py-6">{children}</main>
    </div>
  );
}
