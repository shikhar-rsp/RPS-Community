/* =============================================================================
   Derived workshop state + IST formatting.
   Ported from the community website's assets/js/store.js — the read-only half.
   Status is always derived from `dateTime`, never a stored flag.
   ============================================================================= */

import { WORKSHOPS, HOSTS, TESTIMONIALS, FAQS } from './content';

export function allWorkshops() {
  return WORKSHOPS.slice().sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
}

export function bySlug(slug) {
  return WORKSHOPS.find((w) => w.slug === slug) || null;
}

export function byId(id) {
  return WORKSHOPS.find((w) => w.id === id) || null;
}

export function isPast(w) {
  return new Date(w.dateTime) < new Date();
}

export function recordingReady(w) {
  return !!w.recordingUrl;
}

export function upcoming() {
  return allWorkshops().filter((w) => !isPast(w));
}

export function past() {
  return allWorkshops().filter(isPast).reverse();
}

export function featuredPast() {
  const list = past();
  return list.find((w) => w.featured) || list[0] || null;
}

export function host(id) {
  return HOSTS.find((h) => h.id === id) || null;
}

export function faqs() {
  return FAQS.slice().sort((a, b) => a.order - b.order);
}

export function testimonials(workshopId) {
  if (workshopId) return TESTIMONIALS.filter((t) => t.workshopId === workshopId);
  return TESTIMONIALS.filter((t) => t.featured);
}

/* Seat counts, the "N of M seats left" meter and the derived full/waitlist
   state used to live here. They're gone on purpose: the site no longer shows
   remaining capacity anywhere, so there's nothing left to derive it for.
   Enrolment itself is unaffected — the server still owns who has a seat. */

export function initialsFrom(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

/* ---------------------------------------------------------------- formatting
   Everything renders in IST regardless of where the reader is, because the
   sessions run to IST. Months are assembled by hand rather than left to a
   locale (en-GB abbreviates September as "Sept"). */

const IST = 'Asia/Kolkata';
const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parts(iso) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: IST,
    weekday: 'short',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })
    .formatToParts(new Date(iso))
    .reduce((a, p) => ((a[p.type] = p.value), a), {});
}

// "Sat 12 Sep"
export function dayShort(iso) {
  const p = parts(iso);
  return `${p.weekday} ${p.day} ${MON[Number(p.month) - 1]}`;
}

// "12 Jul 2026"
export function dateFull(iso) {
  const p = parts(iso);
  return `${p.day} ${MON[Number(p.month) - 1]} ${p.year}`;
}

// "6PM IST" / "6:30PM IST"
export function time(iso) {
  const p = parts(iso);
  const mins = p.minute === '00' ? '' : ':' + p.minute;
  return `${p.hour}${mins}${p.dayPeriod.toUpperCase()} IST`;
}

export function metaLine(w, h) {
  const who = h ? ` · with ${h.name}` : '';
  return isPast(w)
    ? `Held ${dateFull(w.dateTime)}${who}`
    : `${dayShort(w.dateTime)} · ${time(w.dateTime)} · Google Meet${who}`;
}

// "12 Jul 2026" → { dy:'12', mo:'JUL' } for the little calendar tile
export function calParts(iso) {
  const bits = dateFull(iso).split(' ');
  return { dy: bits[0], mo: (bits[1] || '').toUpperCase() };
}

/* Where "Grab a seat" should go: the next open session, with the enrol flow
   already firing. Nothing upcoming → the listing, which owns the empty state. */
export function seatUrl() {
  const next = upcoming()[0];
  return next ? `/workshops/${encodeURIComponent(next.slug)}?action=enroll` : '/workshops';
}

export function workshopUrl(w) {
  return `/workshops/${encodeURIComponent(w.slug)}`;
}

/* Hand a resource over for real. Used by the row's own button and by the
   deferred hand-off that fires when someone comes back from logging in, so
   both paths do the same thing: a `download` for files, a new tab for links. */
export function downloadResource(r) {
  if (!r || !r.fileUrl || r.fileUrl === '#') return false;
  if (typeof document === 'undefined') return false;
  const a = document.createElement('a');
  a.href = r.fileUrl;
  a.rel = 'noopener';
  if (r.type === 'link') a.target = '_blank';
  else a.download = r.fileName || '';
  document.body.appendChild(a);
  a.click();
  a.remove();
  return true;
}
