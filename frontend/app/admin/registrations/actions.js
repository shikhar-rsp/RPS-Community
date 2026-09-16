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
