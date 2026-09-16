import { notFound, redirect } from "next/navigation";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";
import { WORKSHOPS } from "@/lib/community/content";
import { allWorkshops, isPast, dateFull } from "@/lib/community/workshops";
import RegistrationsClient from "./RegistrationsClient";

/* Everything before this is test data from building the thing, so the list
   starts here. Filtered in the query rather than deleted from the database:
   the old rows are somebody's record of what was tried, and a date is
   reversible in a way a DELETE is not.

   An ISO instant with the offset on it, because "15 September" in IST starts
   five and a half hours before it does in UTC, and a registration taken on the
   evening of the 14th UTC belongs to the 15th here. */
const REGISTRATIONS_FROM =
  process.env.REGISTRATIONS_FROM || "2026-09-15T00:00:00+05:30";

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

  /* This is the workshop registration list and nothing else.

     Every row is somebody who filled in the form on a workshop page. Creating
     an account does not put anyone here — `enrollments` is only written when a
     seat is taken — and the account an address signed in with is deliberately
     not read, because it is not what this list is about. */
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("enrollments")
    .select("id, workshop_slug, name, email, whatsapp, status, created_at")
    .neq("status", "CANCELLED")
    .gte("created_at", REGISTRATIONS_FROM)
    .order("created_at", { ascending: false });

  // Titles come from the content module rather than the database, which only
  // ever stores the slug.
  const titles = Object.fromEntries(WORKSHOPS.map((w) => [w.slug, w.title]));

  /* Newest first, so the session everyone is currently asking about is the one
     the page opens on. Built from the content module rather than from the rows,
     so a workshop nobody has registered for yet can still be selected — its
     empty list is an answer, and a missing option looks like a bug. */
  const workshops = allWorkshops()
    .slice()
    .sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
    .map((w) => ({
      slug: w.slug,
      title: w.title,
      cohort: w.cohortLabel || "",
      date: dateFull(w.dateTime),
      past: isPast(w),
    }));

  // The upcoming session, not merely the newest row — once 19 Sep has been and
  // gone this should follow on to whatever is next rather than staying put.
  const nextUp = workshops.filter((w) => !w.past).pop() || workshops[0];

  const rows = (data || []).map((r) => ({
    id: r.id,
    slug: r.workshop_slug,
    workshop: titles[r.workshop_slug] || r.workshop_slug,
    name: r.name || "",
    email: r.email || "",
    whatsapp: r.whatsapp || "",
    status: r.status || "",
    createdAt: r.created_at,
  }));

  return (
    <RegistrationsClient
      rows={rows}
      failed={!!error}
      viewer={user.email}
      workshops={workshops}
      initialSlug={nextUp?.slug || "all"}
      since={dateFull(REGISTRATIONS_FROM)}
    />
  );
}
