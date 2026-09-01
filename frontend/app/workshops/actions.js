"use server";

import { createClient } from "@/lib/supabase/server";
import { enrollmentSchema } from "@/lib/validation";

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

  // A seat is a real action, so onboarding has to be done first. The workshop
  // page redirects before it ever gets here; this is the backstop, because the
  // client's copy of that answer lives in user_metadata, which users can write.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile?.role) {
    return {
      ok: false,
      needsOnboarding: true,
      error: "Finish setting up your account first.",
    };
  }

  const { slug, name, email, whatsapp } = parsed.data;

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

  const { error } = await supabase.rpc("cancel_enrollment", { p_slug: clean });
  if (error) {
    return { ok: false, error: "Could not release your seat. Please try again." };
  }
  return { ok: true };
}
