/* =============================================================================
   Outbound transactional email.

   One provider (Resend), called over plain HTTPS rather than through its SDK —
   the REST surface we need is a single POST, and a dependency that ships its
   own fetch polyfill is not worth adding for it.

   Two rules hold everywhere this is used:

   1. Sending is never allowed to fail the thing it reports on. A seat that was
      saved is saved whether or not the confirmation goes out, so every function
      here resolves to a result object and none of them throw.
   2. With no API key configured, sending is a logged no-op rather than an
      error. Local dev and preview deployments run without one, and enrolling
      has to keep working there.
   ============================================================================= */

const ENDPOINT = "https://api.resend.com/emails";

// Resend won't accept a From on a domain that hasn't been verified in the
// dashboard, so this has to match one that has been. Overridable because the
// sending domain is an ops decision, not a code one.
const FROM = process.env.MAIL_FROM || "RPS Cohorts <cohorts@rockpaperscissors.studio>";

// Replies to a transactional mail are real mail from a real person — they go
// to a mailbox someone reads, not to the sending address.
const REPLY_TO = process.env.MAIL_REPLY_TO || "cohorts@rockpaperscissors.studio";

// A seat confirmation is not worth holding the response open for. If the API
// hasn't answered by now, stop waiting and let the caller return.
const TIMEOUT_MS = 8000;

export function mailConfigured() {
  return !!process.env.RESEND_API_KEY;
}

/* Send one email. Resolves to { ok, id } or { ok: false, error, skipped? }.
   Never throws, never rejects. */
export async function sendEmail({ to, subject, html, text, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Loud enough to find in a production log, quiet enough not to be noise in
    // dev, where running without a key is the normal case.
    console.warn(`[mail] RESEND_API_KEY not set — skipped "${subject}" to ${to}`);
    return { ok: false, skipped: true, error: "Mail is not configured." };
  }
  if (!to || !subject || (!html && !text)) {
    return { ok: false, error: "Missing recipient, subject or body." };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject,
        html,
        // Every client that can show HTML will, but a text part is what spam
        // filters look for and what a screen reader or a watch falls back to.
        text,
        reply_to: replyTo || REPLY_TO,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      // Resend puts the reason in the body; the status alone rarely says which
      // of "unverified domain" / "bad key" / "invalid address" it was.
      const detail = await res.text().catch(() => "");
      console.error(`[mail] Resend rejected "${subject}" (${res.status}): ${detail.slice(0, 500)}`);
      return { ok: false, error: `Mail provider returned ${res.status}.` };
    }

    const data = await res.json().catch(() => ({}));
    return { ok: true, id: data?.id || null };
  } catch (err) {
    const reason = err?.name === "AbortError" ? `timed out after ${TIMEOUT_MS}ms` : err?.message;
    console.error(`[mail] Could not send "${subject}" to ${to}: ${reason}`);
    return { ok: false, error: "Could not reach the mail provider." };
  } finally {
    clearTimeout(timer);
  }
}
