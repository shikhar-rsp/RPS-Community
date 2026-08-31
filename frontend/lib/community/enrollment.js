'use client';
import { useEffect, useState, useCallback } from 'react';
/* =============================================================================
   Seat state — UI ONLY.

   The imported design has a full enrolment journey (grab a seat → sign in →
   confirm name/email/WhatsApp → registered or waitlisted → "My workshops"),
   and every one of those states is built. What it does NOT have is anywhere to
   persist a seat: the Supabase schema this app ships with has exactly two
   tables, `profiles` and `submissions`, and the brief was to leave the backend
   untouched. So the confirmed seat is remembered per-user in localStorage.

   TO MAKE THIS REAL, and nothing else needs to move:
     1. add an `enrollments` table (user_id, workshop_slug, status, name, email,
        whatsapp, created_at) with RLS "user owns their rows";
     2. add a server action beside app/dashboard/actions.js that inserts it,
        taking user_id/email from the verified server session the way
        submitAssignment already does — never from the browser;
     3. swap the four functions below for reads/writes against it.

   Auth is NOT faked here. Every gate calls the real Supabase session.
   ============================================================================= */

const KEY = 'rps.seats';

function readAll() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

function writeAll(v) {
  try {
    localStorage.setItem(KEY, JSON.stringify(v));
  } catch {
    /* private mode — the prototype still works, it just forgets */
  }
}

function bucket(userId) {
  return readAll()[userId] || {};
}

export function enrollmentFor(userId, slug) {
  if (!userId) return null;
  return bucket(userId)[slug] || null;
}

export function myEnrollments(userId) {
  if (!userId) return [];
  const mine = bucket(userId);
  return Object.keys(mine).map((slug) => ({ slug, ...mine[slug] }));
}

export function saveEnrollment(userId, slug, row) {
  if (!userId) return null;
  const all = readAll();
  all[userId] = { ...(all[userId] || {}), [slug]: row };
  writeAll(all);
  return row;
}

export function cancelEnrollment(userId, slug) {
  if (!userId) return;
  const all = readAll();
  if (all[userId]) {
    delete all[userId][slug];
    writeAll(all);
  }
}

/* Returns a {field: message} object, or null when everything's fine.
   Ported from the community store's validateDetails. */
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

/* ---------------------------------------------------------------- hooks
   Read after mount only: the server has no idea what's in this browser, so
   reading during render would hydrate mismatched markup. */

export function useSeats(userId) {
  const [seats, setSeats] = useState({});

  const refresh = useCallback(() => {
    setSeats(userId ? bucket(userId) : {});
  }, [userId]);

  useEffect(() => { refresh(); }, [refresh]);

  const save = useCallback((slug, row) => {
    saveEnrollment(userId, slug, row);
    refresh();
  }, [userId, refresh]);

  const cancel = useCallback((slug) => {
    cancelEnrollment(userId, slug);
    refresh();
  }, [userId, refresh]);

  return { seats, save, cancel, refresh };
}
