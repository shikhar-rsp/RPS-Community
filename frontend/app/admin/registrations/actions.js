"use server";

import { revalidatePath } from "next/cache";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/admin";

/* Approving, rejecting, removing and restoring a registration.

   The admin check runs in here, not only around the buttons. A Server Action is
   a POST endpoint anybody can call once they know its name, so rendering a
   control behind a check protects the control and not the data.

   Writes go through the service-role client because `enrollments` has no update
   policy at all — every ordinary change is made by the SECURITY DEFINER
   functions in supabase/enrollments.sql. Admin overrides are the exception. */

/* supabase/admin-moderation.sql adds REJECTED to the status constraint, plus
   removed_by / removed_at. None of this requires it: if the migration has not
   been run, the audit columns are dropped from the write and REJECTED falls
   back to CANCELLED, which is the closest thing the schema already has. The
   page keeps working either way — nobody should lose the ability to remove a
   registration because a SQL file went unrun. */
const MISSING_COLUMN = /column .* does not exist|could not find the .* column/i;
const BAD_STATUS = /violates check constraint .*status/i;

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !isAdminEmail(user.email)) return null;
  return user;
}

function validId(id) {
  return /^[0-9a-f-]{36}$/i.test(String(id || ""));
}

/* One update, retried without whatever the schema turned out not to have.
   Returns { data, error, degraded } — `degraded` naming what was dropped, so
   the page can say so rather than quietly doing something else. */
async function writeStatus(id, patch, fallbackStatus) {
  const admin = createAdminClient();

  let res = await admin
    .from("enrollments")
    .update(patch)
    .eq("id", id)
    .select("id, name, status")
    .maybeSingle();

  if (res.error && MISSING_COLUMN.test(res.error.message)) {
    const { removed_by, removed_at, ...rest } = patch;
    res = await admin
      .from("enrollments")
      .update(rest)
      .eq("id", id)
      .select("id, name, status")
      .maybeSingle();
    if (!res.error) return { ...res, degraded: "audit" };
  }

  if (res.error && fallbackStatus && BAD_STATUS.test(res.error.message)) {
    const { removed_by, removed_at, ...rest } = patch;
    res = await admin
      .from("enrollments")
      .update({ ...rest, status: fallbackStatus })
      .eq("id", id)
      .select("id, name, status")
      .maybeSingle();
    if (!res.error) return { ...res, degraded: "status" };
  }

  return res;
}

/* ------------------------------------------------------- approve / reject */

export async function setEnrollmentStatus(id, status) {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "Not allowed." };
  if (!validId(id)) return { ok: false, error: "Missing registration." };

  // The three an admin decides. ATTENDED is a record of what happened, and
  // CANCELLED belongs to the registrant — neither is set from a list of names.
  if (!["REGISTERED", "WAITLISTED", "REJECTED"].includes(status)) {
    return { ok: false, error: "That is not a status you can set here." };
  }

  const rejecting = status === "REJECTED";
  const patch = rejecting
    ? { status, updated_at: new Date().toISOString(), removed_by: user.email, removed_at: new Date().toISOString() }
    : { status, updated_at: new Date().toISOString(), removed_by: null, removed_at: null };

  const { data, error, degraded } = await writeStatus(id, patch, rejecting ? "CANCELLED" : null);

  if (error) {
    console.error(`[admin] Could not set ${id} to ${status}: ${error.message}`);
    return { ok: false, error: "Could not save that. Please try again." };
  }
  if (!data) return { ok: false, error: "That registration is no longer there." };

  revalidatePath("/admin/registrations");
  return {
    ok: true,
    status: data.status,
    name: data.name,
    // Told, not hidden: the page says what happened instead of what was asked.
    degraded:
      degraded === "status"
        ? "Recorded as removed rather than rejected — run supabase/admin-moderation.sql to tell the two apart."
        : degraded === "audit"
          ? "Saved, but without a name against it — run supabase/admin-moderation.sql to record who."
          : null,
  };
}

/* -------------------------------------------------------------- remove */

/* Marks the row CANCELLED rather than deleting it. Removing the wrong person
   from a list of names is an easy mistake and an unrecoverable one if the row
   is gone. It also frees the seat — capacity counts REGISTERED and ATTENDED
   only — which is what removing somebody ought to mean. */
export async function removeEnrollment(id) {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "Not allowed." };
  if (!validId(id)) return { ok: false, error: "Missing registration." };

  const now = new Date().toISOString();
  const { data, error, degraded } = await writeStatus(id, {
    status: "CANCELLED",
    updated_at: now,
    removed_by: user.email,
    removed_at: now,
  });

  if (error) {
    console.error(`[admin] Could not remove ${id}: ${error.message}`);
    return { ok: false, error: "Could not remove that. Please try again." };
  }
  if (!data) return { ok: false, error: "That registration is no longer there." };

  console.warn(`[admin] ${user.email} removed registration ${id} (${data.name}).`);
  revalidatePath("/admin/registrations");
  return {
    ok: true,
    name: data.name,
    degraded: degraded === "audit"
      ? "Removed, but without a name against it — run supabase/admin-moderation.sql to record who."
      : null,
  };
}

/* ------------------------------------------------------------- restore */

/* Back onto the list, as waitlisted rather than approved. The seat it had may
   well have gone to somebody else in the meantime, and handing it back
   automatically would quietly overbook the room. */
export async function restoreEnrollment(id) {
  const user = await requireAdmin();
  if (!user) return { ok: false, error: "Not allowed." };
  if (!validId(id)) return { ok: false, error: "Missing registration." };

  const { data, error } = await writeStatus(id, {
    status: "WAITLISTED",
    updated_at: new Date().toISOString(),
    removed_by: null,
    removed_at: null,
  });

  if (error) {
    console.error(`[admin] Could not restore ${id}: ${error.message}`);
    return { ok: false, error: "Could not restore that. Please try again." };
  }
  if (!data) return { ok: false, error: "That registration is no longer there." };

  console.warn(`[admin] ${user.email} restored registration ${id} (${data.name}).`);
  revalidatePath("/admin/registrations");
  return { ok: true, name: data.name };
}
