'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

/* ---------------------------------------------------------------- session
   The one source of truth for "is anyone signed in" on the public pages.
   It reads the SAME Supabase session the server components and middleware
   read — nothing here mints, stores or shortcuts auth. */
export function useSession() {
  const [state, setState] = useState({ user: null, loading: true });

  useEffect(() => {
    const supabase = createClient();
    let alive = true;

    supabase.auth.getUser().then(({ data }) => {
      if (alive) setState({ user: data?.user || null, loading: false });
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (alive) setState({ user: session?.user || null, loading: false });
    });

    return () => {
      alive = false;
      sub?.subscription?.unsubscribe();
    };
  }, []);

  return state;
}

/* Identity fields the chrome needs, derived from the Supabase user. The
   profiles table is the source of truth on the server; in the browser we only
   ever show what the session already carries. */
export function identityFrom(user) {
  if (!user) return null;
  const name =
    user.user_metadata?.name ||
    user.user_metadata?.full_name ||
    (user.email ? user.email.split('@')[0] : 'You');
  return {
    name,
    email: user.email || '',
    phone: user.phone || null,
    avatarUrl: user.user_metadata?.avatar_url || '',
    // Onboarding stamps `role` into user_metadata as well as the profiles row.
    // Good enough to decide whether to show the form; every gate that matters
    // re-checks it against `profiles` on the server.
    onboarded: !!user.user_metadata?.role,
  };
}

/* --------------------------------------------------------------- reveal
   Marks every `.reveal` with `data-in` as it scrolls into view.

   It has to be an attribute, not a class. React owns `className` on these
   elements, so any re-render that changes it — opening a different FAQ answer
   is the obvious one — rewrites the attribute wholesale and takes a class we
   added by hand out with it. The element then snaps back to opacity:0 and the
   observer has already stopped watching it, so it never comes back. React
   doesn't manage `data-in`, so it survives.

   A MutationObserver picks up anything mounted later (a tab switch, a list
   that grows), which also means the effect doesn't have to be re-run by hand
   through `deps` — that argument is kept so existing callers still work. */
export function useReveal(deps = []) {
  useEffect(() => {
    const reduced =
      !('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const show = (el) => el.setAttribute('data-in', '');

    if (reduced) {
      document.querySelectorAll('.reveal:not([data-in])').forEach(show);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            show(en.target);
            io.unobserve(en.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.06 }
    );

    const scan = () =>
      document.querySelectorAll('.reveal:not([data-in])').forEach((el) => io.observe(el));

    scan();

    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/* ---------------------------------------------------------------- toasts
   Same behaviour as the vanilla build: a live region at the bottom of the
   page, three and a half seconds, then it fades. */
export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);

  const toast = useCallback((msg, kind) => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, msg, kind: kind || '' }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);

  return { toasts, toast };
}

/* Sticky header: past 90px the full-width bar collapses into a centred pill.
   Well clear of 0 so a nudge of the wheel doesn't flip it back and forth. */
export function useStuck() {
  const [stuck, setStuck] = useState(false);
  useEffect(() => {
    const sync = () => setStuck(window.scrollY > 90);
    sync();
    window.addEventListener('scroll', sync, { passive: true });
    return () => window.removeEventListener('scroll', sync);
  }, []);
  return stuck;
}
