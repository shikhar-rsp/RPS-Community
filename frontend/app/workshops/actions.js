"use server";

import { createClient } from "@/lib/supabase/server";
import { enrollmentSchema } from "@/lib/validation";
import { sendEnrollmentEmail } from "@/lib/emails/enrollment";
import { recordRegistration } from "@/lib/sheets";
import { bySlug } from "@/lib/community/workshops";

// Server Actions for workshop seats. Same shape as app/dashboard/actions.js:
// the client can only influence the form fields, and identity comes from the
// verified server session — never from the browser.
//
// The capacity check and the REGISTERED/WAITLISTED decision happen inside
// public.enroll_in_workshop() (supabase/enrollments.sql), which locks the
// workshop's capacity row for the transaction. That's deliberate: deciding it
// here would leave a window where two people confirming at the same moment
// both read the same last seat.

export async function enrollInWorkshop(input) {
  const parsed = enrollmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid input." };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: "You must be signed in to take a seat." };
  }

  // Taking a seat no longer waits on onboarding. The form on the workshop page
  // asks for the three things a registration actually needs — name, email and
  // WhatsApp number — and they're validated here and again in the database, so
  // there's nothing a profile row would add. The role/goals/tools answers are
  // still collected, just not as a toll gate on the way in.

  const { slug, name, email, whatsapp } = parsed.data;

  // Was this person already on the list before we touched anything?
  //
  // enroll_in_workshop() is idempotent: ask twice and it hands back the row it
  // already has rather than making a second one. That is the right behaviour
  // for a seat and the wrong one for a confirmation email, because the return
  // value looks identical either way — so re-registering would send the mail
  // again every time. Asking first is the only way to tell the two apart
  // without changing the function's signature.
  //
  // RLS limits this to the caller's own rows, so it can only ever answer for
  // them. The window between this read and the write below is a fraction of a
  // second and the worst it can produce is a duplicate confirmation, never a
  // lost seat.
  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("workshop_slug", slug)
    .maybeSingle();

  const { data, error } = await supabase.rpc("enroll_in_workshop", {
    p_slug: slug,
    p_name: name,
    p_email: email,
    p_whatsapp: whatsapp,
  });

  if (error) {
    return { ok: false, error: "Could not save your seat. Please try again." };
  }

  // The function returns the row it settled on — including the case where the
  // person was already enrolled, in which case nothing new was written.
  const row = Array.isArray(data) ? data[0] : data;

  // Tell them it worked. Awaited rather than left running, because a serverless
  // function stops executing the moment it returns a response — a floating
  // promise here would be cancelled about as often as it completed. It cannot
  // fail the enrolment: the seat is already saved, sendEnrollmentEmail never
  // throws, and its result is logged rather than returned. Someone who is in
  // and never got the mail is a support question; someone told their seat
  // failed when it did not would try again and take a second one.
  if (!existing) {
    const sent = await sendEnrollmentEmail({
      to: row?.email || email,
      name: row?.name || name,
      slug,
      status: row?.status || "REGISTERED",
    });
    if (!sent.ok && !sent.skipped) {
      console.error(`[enroll] Seat saved for ${slug}, but the confirmation did not send.`);
    }
  }

  // Mirror into the team's sheet. Unlike the email this runs on every
  // successful enrol, not only a new one: the sheet keys on workshop + email
  // and updates in place, so a repeat is a no-op that also repairs a row which
  // failed to write the first time.
  await recordRegistration({
    slug,
    workshopTitle: bySlug(slug)?.title || slug,
    name: row?.name || name,
    email: row?.email || email,
    whatsapp: row?.whatsapp || whatsapp,
    status: row?.status || "REGISTERED",
  });

  return {
    ok: true,
    status: row?.status || "REGISTERED",
    enrollment: row
      ? {
          slug: row.workshop_slug,
          status: row.status,
          name: row.name,
          email: row.email,
          whatsapp: row.whatsapp,
          enrolledAt: row.created_at,
        }
      : null,
  };
}

export async function cancelEnrollment(slug) {
  const clean = String(slug || "").trim();
  if (!/^[a-z0-9-]+$/.test(clean)) {
    return { ok: false, error: "Missing workshop." };
  }

  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { ok: false, error: "You must be signed in to do that." };
  }

  // Read the row before it goes: cancel_enrollment() deletes it outright, so
  // after this call there is nothing left to name in the sheet.
  const { data: leaving } = await supabase
    .from("enrollments")
    .select("name, email, whatsapp")
    .eq("workshop_slug", clean)
    .maybeSingle();

  const { error } = await supabase.rpc("cancel_enrollment", { p_slug: clean });
  if (error) {
    return { ok: false, error: "Could not release your seat. Please try again." };
  }

  // Mark them CANCELLED rather than deleting the row. Someone reading the sheet
  // to send out Meet links needs to see that a name came off the list, not find
  // it silently absent — and a row that merely vanished looks like a bug.
  if (leaving?.email) {
    await recordRegistration({
      slug: clean,
      workshopTitle: bySlug(clean)?.title || clean,
      name: leaving.name,
      email: leaving.email,
      whatsapp: leaving.whatsapp,
      status: "CANCELLED",
    });
  }

  return { ok: true };
}
