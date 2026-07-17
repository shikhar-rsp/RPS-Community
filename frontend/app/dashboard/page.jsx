import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

const ASSIGNMENT = "Design handoff that sticks";

// SERVER component: all authenticated reads happen here, on the server. The raw
// Supabase user object is never sent to the browser — only the minimal fields
// below are passed to the client shell (and embedded in the server-rendered
// HTML). This is why `/auth/v1/user` no longer shows up in the network tab.
export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Middleware already guards this route; this is a defensive fallback.
  if (!user) redirect("/signin?next=/dashboard");

  // Source of truth for profile data is the `profiles` table (server-controlled),
  // NOT user_metadata (which the user can edit).
  const { data: profile } = await supabase
    .from("profiles")
    .select("name")
    .eq("id", user.id)
    .single();

  const fullName = profile?.name || "";
  const firstName = fullName ? fullName.split(" ")[0] : "there";

  const { data: existing } = await supabase
    .from("submissions")
    .select("link, note")
    .eq("user_id", user.id)
    .eq("assignment", ASSIGNMENT)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <DashboardClient
      firstName={firstName}
      initialLink={existing?.link || ""}
      initialNote={existing?.note || ""}
      initialSubmitted={!!existing}
    />
  );
}
