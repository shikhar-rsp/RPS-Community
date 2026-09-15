/* =============================================================================
   Mirror registrations into the Google Sheet the team works from.

   Supabase stays the source of truth. This is a copy for people who need to
   read the list without a database login — pull the Meet link together, message
   the WhatsApp numbers, count who is coming.

   It goes through an Apps Script web app bound to the sheet rather than the
   Sheets API, deliberately: the API route needs a Google Cloud project, a
   service account, a JSON key in the environment and a client library. A bound
   script needs a paste and a Deploy button, and the sheet's own owner can do it
   without anybody provisioning anything.

   Same rule as the confirmation email: this can never fail a registration. The
   seat is already saved by the time this runs, nothing here throws, and a
   failure is logged rather than returned. A row missing from a spreadsheet is
   something a human can fix; a seat that appeared to fail is not.
   ============================================================================= */

// A spreadsheet write should not hold the response open. Apps Script is slower
// than a normal API — it cold-starts — so this is more generous than the mail
// timeout, but still bounded.
const TIMEOUT_MS = 10000;

export function sheetConfigured() {
  return !!process.env.SHEETS_WEBHOOK_URL;
}

/* Send one registration to the sheet. Resolves to { ok } or
   { ok: false, error, skipped? }. Never throws, never rejects. */
export async function recordRegistration(row) {
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) {
    console.warn(`[sheet] SHEETS_WEBHOOK_URL not set — not logging ${row?.email} for ${row?.slug}`);
    return { ok: false, skipped: true, error: "Sheet sync is not configured." };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // The deployed script URL is reachable by anyone who has it, so the token
      // is what stops a stranger writing rows into the team's sheet. It travels
      // in the body because Apps Script drops most custom request headers.
      body: JSON.stringify({ token: process.env.SHEETS_WEBHOOK_SECRET || "", ...row }),
      // Apps Script answers a POST with a 302 to script.googleusercontent.com.
      // Following it is required to see whether the write actually succeeded.
      redirect: "follow",
      signal: controller.signal,
    });

    const text = await res.text().catch(() => "");
    if (!res.ok) {
      console.error(`[sheet] Rejected (${res.status}) for ${row?.email}: ${text.slice(0, 300)}`);
      return { ok: false, error: `Sheet returned ${res.status}.` };
    }

    // Apps Script returns 200 for a thrown error as readily as for a success,
    // so the body is the only thing that actually says which happened.
    let body = {};
    try {
      body = JSON.parse(text);
    } catch {
      console.error(`[sheet] Unparseable reply for ${row?.email}: ${text.slice(0, 300)}`);
      return { ok: false, error: "Sheet replied with something unexpected." };
    }

    if (!body.ok) {
      console.error(`[sheet] Refused for ${row?.email}: ${body.error || "no reason given"}`);
      return { ok: false, error: body.error || "Sheet refused the row." };
    }

    return { ok: true, action: body.action || "written" };
  } catch (err) {
    const reason = err?.name === "AbortError" ? `timed out after ${TIMEOUT_MS}ms` : err?.message;
    console.error(`[sheet] Could not reach the sheet for ${row?.email}: ${reason}`);
    return { ok: false, error: "Could not reach the sheet." };
  } finally {
    clearTimeout(timer);
  }
}
