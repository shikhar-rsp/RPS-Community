import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./DashboardClient";

function initialsFrom(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "U";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// SERVER component: all authenticated reads happen here, on the server. The raw
// Supabase user object is never sent to the browser — only the minimal identity
// fields below are passed to the client shell. Middleware already guards this
// route; the getUser() check is a defensive fallback.
export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin?next=/dashboard");

  // Source of truth for profile data is the `profiles` table (server-controlled),
  // NOT user_metadata (which the user can edit).
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, avatar_url")
    .eq("id", user.id)
    .single();

  const fullName = profile?.name || user.user_metadata?.name || "";
  const firstName = fullName ? fullName.split(" ")[0] : "there";

  // NOTE: the latest-submission read is dropped while the submit form is
  // disabled. Re-add it here (and pass initial props) when the form returns.

  return (
    <DashboardClient
      name={fullName || "Your profile"}
      email={user.email || ""}
      avatarUrl={profile?.avatar_url || ""}
      initials={initialsFrom(fullName)}
      firstName={firstName}
    />
  );
}
