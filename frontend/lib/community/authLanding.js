'use client';
import { createClient } from '@/lib/supabase/client';

/* =============================================================================
   Where someone goes the moment they finish authenticating.

   /auth/callback already does this check for the OAuth code flow. But a Google
   sign-in only reaches that route if `${origin}/auth/callback` is in the
   project's Redirect URLs allow-list — otherwise Supabase falls back to the
   Site URL, the browser client picks the session up itself, and the callback's
   check never runs. That is the shape of the bug we're seeing: every account
   sitting at role = NULL arrived through Google, and none through email.

   So the decision lives here instead, and is applied at every landing point:
   the callback, the password and OTP forms, and PostAuthGuard for the case
   where the session appears without any of them running.
   ============================================================================= */

const PENDING_KEY = 'rps.pendingAuth';

/* Set immediately before leaving for an OAuth provider, so the guard can tell
   "a login just completed in this tab" from "someone is browsing while signed
   in". Without it the guard would drag an un-onboarded visitor off every public
   page they opened. */
export function markAuthPending() {
  try {
    sessionStorage.setItem(PENDING_KEY, '1');
  } catch {
    /* private mode — the callback path still covers the common case */
  }
}

export function peekAuthPending() {
  try {
    return sessionStorage.getItem(PENDING_KEY) === '1';
  } catch {
    return false;
  }
}

export function takeAuthPending() {
  const v = peekAuthPending();
  try {
    sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* nothing to clear */
  }
  return v;
}

export function onboardingUrl(next) {
  return '/onboarding?mode=complete&next=' + encodeURIComponent(next || '/dashboard');
}

/* true / false, or null when there's no session to judge yet.
   `profiles.role` is the source of truth; user_metadata is only a fast path,
   and is never used to conclude someone has NOT onboarded. */
export async function hasOnboarded(supabase) {
  const client = supabase || createClient();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;
  if (user.user_metadata?.role) return true;
  const { data } = await client
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  return !!data?.role;
}

/* The one call every sign-in form makes instead of pushing `next` blindly. */
export async function landingAfterAuth(supabase, next) {
  const done = await hasOnboarded(supabase);
  return done ? next || '/dashboard' : onboardingUrl(next);
}
