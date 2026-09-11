'use client';

/* =============================================================================
   Client-side state that belongs to whoever is signed in.

   Two jobs:

   1. WIPE IT on sign-out and on sign-in. Everything this app keeps in the
      browser is keyed under `rps.` — seats, the pending-auth flag, the
      mid-enrolment seat snapshot. If it survives a sign-out, the next person to
      log in on that machine sees the previous user's workshop registrations.
      Supabase clears its own session cookie; it knows nothing about ours.

   2. REMEMBER THAT SOMEONE HAS AN ACCOUNT, so that after signing out the entry
      screen is the login form rather than the signup form. That has to be a
      cookie, not localStorage, because the middleware makes the decision on the
      server before any JavaScript runs.
   ============================================================================= */

// Everything under this prefix is per-user and must not outlive a session.
const APP_PREFIX = 'rps.';

// Kept deliberately: the cookie-consent choice is per-device, not per-user, and
// re-asking on every sign-out would be obnoxious.
const KEEP = new Set(['rps.cookies']);

export const RETURNING_COOKIE = 'rps.returning';

export function clearClientState() {
  for (const store of [
    typeof localStorage !== 'undefined' ? localStorage : null,
    typeof sessionStorage !== 'undefined' ? sessionStorage : null,
  ]) {
    if (!store) continue;
    try {
      const doomed = [];
      for (let i = 0; i < store.length; i++) {
        const k = store.key(i);
        if (k && k.startsWith(APP_PREFIX) && !KEEP.has(k)) doomed.push(k);
      }
      doomed.forEach((k) => store.removeItem(k));
    } catch {
      /* private mode — nothing was stored to begin with */
    }
  }
}

/* Set once someone proves they have an account. Read by the middleware to pick
   the signed-out entry screen. Not a security boundary — it only chooses which
   of two public pages to show, so a forged value costs nothing. */
export function markReturningVisitor() {
  try {
    const oneYear = 60 * 60 * 24 * 365;
    const secure = window.location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${RETURNING_COOKIE}=1; Path=/; Max-Age=${oneYear}; SameSite=Lax${secure}`;
  } catch {
    /* cookies blocked — the visitor just gets the signup screen */
  }
}
