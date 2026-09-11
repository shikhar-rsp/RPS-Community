'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import {
  hasOnboarded, onboardingUrl, peekAuthPending, takeAuthPending,
} from '@/lib/community/authLanding';

/* The backstop for "a Google login must go through onboarding".

   /auth/callback handles this when it runs. It doesn't run if the project's
   Redirect URLs allow-list is missing `${origin}/auth/callback` — Supabase then
   returns to the Site URL and the browser client establishes the session on its
   own, landing the user on a public page with role still NULL.

   This fires only when THIS tab started a login (the flag set just before
   leaving for the provider), so it can't pull a signed-in visitor off a page
   they're simply reading. One redirect, then the flag is spent. */
export default function PostAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    let alive = true;

    const run = async () => {
      if (!alive) return;
      const path = window.location.pathname;

      // Already where we'd send them, or still mid-flow: spend the flag and stop.
      if (path.startsWith('/onboarding')) {
        takeAuthPending();
        return;
      }
      if (path.startsWith('/signin') || path.startsWith('/auth')) return;
      if (!peekAuthPending()) return;

      const done = await hasOnboarded(supabase);
      // null = the session hasn't materialised yet; keep the flag and wait for
      // the auth event rather than deciding on missing information.
      if (!alive || done === null) return;

      takeAuthPending();
      if (!done) {
        router.replace(onboardingUrl(path + window.location.search));
      }
    };

    run();
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') run();
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
  }, [pathname, router]);

  return null;
}
