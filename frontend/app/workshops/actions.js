"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { enrollmentSchema } from "@/lib/validation";
import { sendEnrollmentEmail } from "@/lib/emails/enrollment";
import { recordRegistration } from "@/lib/sheets";
import { bySlug, isPast } from "@/lib/community/workshops";

// Server Actions for workshop seats. Same shape as app/dashboard/actions.js:
// the client can only influence the form fields, and identity comes from the
// verified server session — never from the browser.
//
// The capacity check and the REGISTERED/WAITLISTED decision happen inside
// public.enroll_in_workshop() (supabase/enrollments.sql), which locks the
// workshop's capacity row for the transaction. That's deliberate: deciding it
// here would leave a window where two people confirming at the same moment
// both read the same last seat.

/* Insert the capacity row for a workshop the content module knows about and
   the database does not. Only for real, still-upcoming workshops, so a made-up
   slug from the browser can never create a row. `ignoreDuplicates` makes it
   `on conflict do nothing`: a row someone has since edited by hand is left
   alone, exactly as supabase/enrollments.sql treats it. Never throws. */
async function ensureSeatRow(slug) {
  const w = bySlug(slug);
  if (!w || isPast(w)) return false;
  try {
    const { error } = await createAdminClient()
      .from("workshop_seats")
      .upsert(
        { slug: w.slug, capacity: w.capacity || 45, seeded_enrollments: w.seededEnrollments || 0 },
        { onConflict: "slug", ignoreDuplicates: true }
      );
    if (error) {
      console.error(`[enroll] Could not add the seat row for ${slug}: ${error.message}`);
      return false;
    }
    return true;
  } catch (e) {
    console.error(`[enroll] Could not add the seat row for ${slug}: ${e?.message || e}`);
    return false;
  }
}

/* Everything that follows a seat being taken, the same for both ways in.

   Tell them it worked. Awaited rather than left running, because a serverless
   function stops executing the moment it returns a response — a floating
   promise here would be cancelled about as often as it completed. It cannot
   fail the enrolment: the seat is already saved, sendEnrollmentEmail never
   throws, and its result is logged rather than returned. Someone who is in
   and never got the mail is a support question; someone told their seat
   failed when it did not would try again and take a second one.

   The sheet, unlike the email, is written on every successful enrol, not
   only a new one: it keys on workshop + email and updates in place, so a
   repeat is a no-op that also repairs a row which failed to write. */
async function afterSeat({ slug, row, isNew, typed }) {
  const name = row?.name || typed.name;
  const email = row?.email || typed.email;
  const whatsapp = row?.whatsapp || typed.whatsapp;
  const status = row?.status || "REGISTERED";

  if (isNew) {
    const sent = await sendEnrollmentEmail({ to: email, name, slug, status });
    if (!sent.ok && !sent.skipped) {
      console.error(`[enroll] Seat saved for ${slug}, but the confirmation did not send.`);
    }
  }

  await recordRegistration({
    slug,
    workshopTitle: bySlug(slug)?.title || slug,
    name,
    email,
    whatsapp,
    status,
  });

  return {
    ok: true,
    status,
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

/* The account an email belongs to, or null. Profiles first — one indexed
   read — then the auth list for an account whose profile row never got
   written. Matched case-insensitively, and exactly: the address is escaped
   so `_` and `%` in it are not read as wildcards. */
async function accountIdForEmail(admin, email) {
  const e = String(email || "").trim().toLowerCase();
  if (!e) return null;

  const escaped = e.replace(/[\\%_]/g, (c) => "\\" + c);
  const { data: profile } = await admin
    .from("profiles")
    .select("id")
    .ilike("email", escaped)
    .limit(1)
    .maybeSingle();
  if (profile?.id) return profile.id;

  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) return null;
    const hit = (data?.users || []).find((u) => String(u.email || "").toLowerCase() === e);
    if (hit) return hit.id;
    if (!data?.users || data.users.length < 1000) break;
  }
  return null;
}

/* Take a seat without signing in — for someone who already has an account.

   The workshop page lets a signed-out visitor fill in the same three fields as
   everyone else. If the email belongs to an account, the seat goes on that
   account and they never see a password box: people who registered for an
   earlier cohort come back months later, and making them dig up a password
   to sit in a free session is where most of them used to stop. An email with
   no account behind it gets { needsAccount: true }, and the page sends them
   to sign up, which brings them back to finish here.

   What this does NOT do is sign anyone in, or hand anything back about the
   account: the reply is the seat that was just taken, built from what was
   typed. The confirmation goes to the address on the account (the one that
   was matched), so a seat taken in someone's name always tells them so.

   The capacity decision mirrors enroll_in_workshop(): taken seats are the
   seeded number plus every REGISTERED/ATTENDED row. It runs here rather than
   in the database function because that function reads auth.uid(), which a
   signed-out request does not have. The unique (user_id, workshop_slug)
   constraint still guarantees one row per person. */
export async function enrollWithEmail(input) {
  const parsed = enrollmentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message || "Invalid input." };
  }
  const { slug, name, email, whatsapp } = parsed.data;

  const w = bySlug(slug);
  if (!w || isPast(w)) return { ok: false, error: "That workshop isn’t taking seats." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { ok: false, error: "Could not save your seat. Please try again." };
  }

  const userId = await accountIdForEmail(admin, email);
  if (!userId) return { ok: false, needsAccount: true };

  // Already on the list? Hand back what they have; no second email.
  const { data: existing } = await admin
    .from("enrollments")
    .select("*")
    .eq("user_id", userId)
    .eq("workshop_slug", slug)
    .maybeSingle();
  if (existing) {
    return afterSeat({ slug, row: existing, isNew: false, typed: { name, email, whatsapp } });
  }

  let { data: seatRow } = await admin
    .from("workshop_seats")
    .select("capacity, seeded_enrollments")
    .eq("slug", slug)
    .maybeSingle();
  if (!seatRow && (await ensureSeatRow(slug))) {
    seatRow = { capacity: w.capacity || 45, seeded_enrollments: w.seededEnrollments || 0 };
  }
  if (!seatRow) return { ok: false, error: "Could not save your seat. Please try again." };

  const { count } = await admin
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("workshop_slug", slug)
    .in("status", ["REGISTERED", "ATTENDED"]);
  const taken = (seatRow.seeded_enrollments || 0) + (count || 0);
  const status = taken >= seatRow.capacity ? "WAITLISTED" : "REGISTERED";

  const { data: accountUser } = await admin.auth.admin.getUserById(userId);

  const { data: row, error } = await admin
    .from("enrollments")
    .insert({
      user_id: userId,
      workshop_slug: slug,
      status,
      name: name.trim(),
      email,
      whatsapp: whatsapp.trim(),
      user_email: accountUser?.user?.email || email,
    })
    .select("*")
    .single();

  if (error) {
    // Two submits at once: the other one won, so hand back its row.
    if (error.code === "23505") {
      const { data: again } = await admin
        .from("enrollments")
        .select("*")
        .eq("user_id", userId)
        .eq("workshop_slug", slug)
        .maybeSingle();
      if (again) return afterSeat({ slug, row: again, isNew: false, typed: { name, email, whatsapp } });
    }
    console.error(`[enroll] Signed-out seat for ${slug} failed: ${error.message}`);
    return { ok: false, error: "Could not save your seat. Please try again." };
  }

  return afterSeat({ slug, row, isNew: true, typed: { name, email, whatsapp } });
}

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

  const enrol = () =>
    supabase.rpc("enroll_in_workshop", {
      p_slug: slug,
      p_name: name,
      p_email: email,
      p_whatsapp: whatsapp,
    });

  let { data, error } = await enrol();

  // A workshop added to the content file but not yet to workshop_seats: give
  // it its row from the content's own numbers and try once more, so opening a
  // new session never also depends on someone running SQL first.
  if (error && /unknown workshop/i.test(error.message || "") && (await ensureSeatRow(slug))) {
    ({ data, error } = await enrol());
  }

  if (error) {
    return { ok: false, error: "Could not save your seat. Please try again." };
  }

  // The function returns the row it settled on — including the case where the
  // person was already enrolled, in which case nothing new was written.
  const row = Array.isArray(data) ? data[0] : data;

  return afterSeat({ slug, row, isNew: !existing, typed: { name, email, whatsapp } });
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
