"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

/* Approving or waitlisting someone by hand.

   The gate is checked here and not only on the page: a Server Action is a POST
   endpoint that anybody can call once they know its name, so rendering the
   buttons behind an admin check protects the buttons, not the data.

   Writes go through the service-role client because `enrollments` has no
   update policy at all — every normal change is made by the SECURITY DEFINER
   functions in supabase/enrollments.sql. This is the deliberate exception: a
   human overriding what capacity decided. */

const ALLOWED = ["REGISTERED", "WAITLISTED"];

export async function setEnrollmentStatus(id, status) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return { ok: false, error: "Not allowed." };
  }

  // Only the two a person is moved between by hand. ATTENDED is a record of
  // what happened and CANCELLED is the registrant's own decision — neither is
  // something to set from a list of names.
  if (!ALLOWED.includes(status)) {
    return { ok: false, error: "That is not a status you can set here." };
  }
  if (!/^[0-9a-f-]{36}$/i.test(String(id || ""))) {
    return { ok: false, error: "Missing registration." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("enrollments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, status")
    .maybeSingle();

  if (error) {
    console.error(`[admin] Could not set ${id} to ${status}: ${error.message}`);
    return { ok: false, error: "Could not save that. Please try again." };
  }
  if (!data) {
    return { ok: false, error: "That registration is no longer there." };
  }

  revalidatePath("/admin/registrations");
  return { ok: true, status: data.status };
}

/* Take someone off the list.

   Marks the row CANCELLED rather than deleting it. Three reasons, in order of
   how much they matter:

   - It is recoverable. Removing the wrong person from a registration list is
     an easy mistake and an unrecoverable one if the row is gone — the name,
     the number and when they signed up would all have to be asked for again.
   - It frees the seat. Capacity counts REGISTERED and ATTENDED only, so a
     cancelled row lets the next person on the waitlist through, which is what
     removing somebody should mean.
   - It matches what the site already does when a registrant releases a seat
     themselves, so there is one meaning of "not coming" rather than two.

   The list filters CANCELLED out, so the effect is what it says: gone from the
   page. To bring someone back, set their status in Supabase or have them
   register again. */
export async function removeEnrollment(id) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isAdminEmail(user.email)) {
    return { ok: false, error: "Not allowed." };
  }
  if (!/^[0-9a-f-]{36}$/i.test(String(id || ""))) {
    return { ok: false, error: "Missing registration." };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("enrollments")
    .update({ status: "CANCELLED", updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("id, name")
    .maybeSingle();

  if (error) {
    console.error(`[admin] Could not remove ${id}: ${error.message}`);
    return { ok: false, error: "Could not remove that. Please try again." };
  }
  if (!data) {
    return { ok: false, error: "That registration is no longer there." };
  }

  console.warn(`[admin] ${user.email} removed registration ${id} (${data.name}).`);
  revalidatePath("/admin/registrations");
  return { ok: true, name: data.name };
}
