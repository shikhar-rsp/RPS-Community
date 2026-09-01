'use client';
import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { enrollInWorkshop, cancelEnrollment } from '@/app/workshops/actions';

/* =============================================================================
   Seat state.

   Reads come straight from the `enrollments` table through the browser client;
   RLS ("own enrollments read") means a session can only ever see its own rows,
   so there is nothing to filter here. Writes go through the two Server Actions
   in app/workshops/actions.js, which hand off to the SECURITY DEFINER functions
   that own the capacity check.

   Nothing about a seat is decided in the browser any more: the client sends
   three form fields and is told what it got back.
   ============================================================================= */

/* Returns a {field: message} object, or null when everything's fine.
   The same rules run again in lib/validation.js on the server and once more as
   NOT NULL / check constraints in the database — this copy exists only so the
   form can mark a field red without a round trip. */
export function validateDetails(d) {
  const errors = {};
  if (!String(d.name || '').trim() || String(d.name).trim().length < 2) {
    errors.name = 'We need a name to put on the list.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(d.email || '').trim())) {
    errors.email = 'That email doesn’t look right.';
  }
  const raw = String(d.whatsapp || '').trim();
  const digits = raw.replace(/\D/g, '');
  if (!digits) errors.whatsapp = 'We need a number for the reminder.';
  else if (!raw.startsWith('+')) errors.whatsapp = 'Add your country code, like +91.';
  else if (digits.length < 9 || digits.length > 15) errors.whatsapp = 'That’s not a whole number.';
  return Object.keys(errors).length ? errors : null;
}

/* Tidy, not canonical — spacing is kept because a human reads this off a
   registration list. */
export function normalisePhone(p) {
  return String(p || '').trim().replace(/\s+/g, ' ');
}

function rowToSeat(r) {
  return {
    slug: r.workshop_slug,
    status: r.status,
    name: r.name,
    email: r.email,
    whatsapp: r.whatsapp,
    enrolledAt: r.created_at,
  };
}

/* ------------------------------------------------------------------ my seats
   Keyed by slug, the shape every card and panel already expects. */
export function useSeats(userId) {
  const [seats, setSeats] = useState({});
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setSeats({});
      setLoading(false);
      return;
    }
    const supabase = createClient();
    const { data, error } = await supabase
      .from('enrollments')
      .select('workshop_slug, status, name, email, whatsapp, created_at')
      .neq('status', 'CANCELLED');

    if (!error && data) {
      setSeats(Object.fromEntries(data.map((r) => [r.workshop_slug, rowToSeat(r)])));
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    refresh().finally(() => {
      if (!alive) return;
    });
    return () => {
      alive = false;
    };
  }, [refresh]);

  /* Take a seat. Returns { ok, status } — `status` is whatever the database
     decided, which is why the caller must not assume REGISTERED. */
  const enroll = useCallback(
    async (slug, details) => {
      const res = await enrollInWorkshop({
        slug,
        name: String(details.name || '').trim(),
        email: String(details.email || '').trim(),
        whatsapp: normalisePhone(details.whatsapp),
      });
      if (res.ok && res.enrollment) {
        setSeats((s) => ({ ...s, [slug]: res.enrollment }));
      }
      return res;
    },
    []
  );

  const cancel = useCallback(async (slug) => {
    const res = await cancelEnrollment(slug);
    if (res.ok) {
      setSeats((s) => {
        const next = { ...s };
        delete next[slug];
        return next;
      });
    }
    return res;
  }, []);

  return { seats, loading, enroll, cancel, refresh };
}

/* -------------------------------------------------------------- seat counts
   Aggregate only, and readable logged out — public.workshop_seat_counts()
   returns slug/capacity/taken and never touches a name or a number. Components
   fall back to the static numbers in content.js if this hasn't landed yet. */
export function useSeatCounts() {
  const [counts, setCounts] = useState(null);

  useEffect(() => {
    let alive = true;
    const supabase = createClient();
    supabase.rpc('workshop_seat_counts').then(({ data, error }) => {
      if (!alive || error || !data) return;
      setCounts(
        Object.fromEntries(data.map((r) => [r.slug, { capacity: r.capacity, taken: r.taken }]))
      );
    });
    return () => {
      alive = false;
    };
  }, []);

  return counts;
}
