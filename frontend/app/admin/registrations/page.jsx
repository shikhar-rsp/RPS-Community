import { notFound, redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { WORKSHOPS } from "@/lib/community/content";
import RegistrationsClient from "./RegistrationsClient";

export const metadata = {
  title: "Registrations — RPS Cohorts",
  // This page lists real people's contact details. Keep it out of every index
  // that will honour the ask.
  robots: { index: false, follow: false, nocache: true },
};

/* SERVER component. Every decision that matters happens here:

   - The gate is the session's verified email, read server-side. Nothing about
     who is an admin reaches the browser, and there is no client-side check to
     bypass — a non-admin gets a 404 before any data is fetched.
   - 404 rather than "not allowed", so the page's existence is not advertised to
     an account that cannot open it.
   - The read uses the service-role client, because RLS on `enrollments` limits
     every normal session to its own row. That key never leaves the server, and
     only the rows rendered below are serialised to the client. */
export default async function RegistrationsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signin?next=/admin/registrations");
  if (!isAdminEmail(user.email)) notFound();

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("enrollments")
    .select("workshop_slug, name, email, user_email, whatsapp, status, created_at")
    .order("created_at", { ascending: false });

  // Titles come from the content module rather than the database, which only
  // ever stores the slug.
  const titles = Object.fromEntries(WORKSHOPS.map((w) => [w.slug, w.title]));

  const rows = (data || []).map((r) => ({
    slug: r.workshop_slug,
    workshop: titles[r.workshop_slug] || r.workshop_slug,
    name: r.name || "",
    email: r.email || "",
    // Only worth showing when it differs from what they typed on the form.
    accountEmail:
      r.user_email && r.user_email.toLowerCase() !== String(r.email || "").toLowerCase()
        ? r.user_email
        : null,
    whatsapp: r.whatsapp || "",
    status: r.status || "",
    createdAt: r.created_at,
  }));

  return (
    <RegistrationsClient
      rows={rows}
      failed={!!error}
      viewer={user.email}
      workshops={Array.from(new Set(rows.map((r) => r.workshop)))}
    />
  );
}
