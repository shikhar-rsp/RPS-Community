/* The one place that answers "what is this site's public address?".

   Every OAuth and email-link journey leaves the app and has to be told where to
   come back to. Deriving that from wherever the browser happens to be —
   `window.location.origin` in the client, `new URL(request.url).origin` in a
   route handler — means anyone who arrives on the raw *.vercel.app deployment
   URL is sent back there when they log in, and stays on it for the rest of the
   session. That is the whole bug: the site lives on the custom domain, but a
   login hands you the Vercel one.

   Pinning it to NEXT_PUBLIC_SITE_URL keeps every round-trip on the real domain,
   and keeps Supabase's redirect allow-list down to a single stable entry.

   Unset — local dev, preview deployments — it falls back to the current origin,
   which is exactly what you want there. Set it in the production environment
   and nothing below is consulted at all. */

const CONFIGURED = String(process.env.NEXT_PUBLIC_SITE_URL || '')
  .trim()
  .replace(/\/+$/, '');

/* The origin a redirect should carry, with no trailing slash. */
export function siteOrigin(fallback) {
  if (CONFIGURED) return CONFIGURED;
  if (fallback) return String(fallback).replace(/\/+$/, '');
  if (typeof window !== 'undefined') return window.location.origin;
  return '';
}

/* siteUrl('/auth/callback') → 'https://cohorts.rockpaperscissors.studio/auth/callback' */
export function siteUrl(path, fallback) {
  const base = siteOrigin(fallback);
  return base + (String(path).startsWith('/') ? path : '/' + path);
}

/* Server-side fallback: what the visitor actually asked for.

   Behind a proxy, `new URL(request.url).origin` is the INTERNAL host — on
   Vercel that is the *.vercel.app deployment, not the domain the user typed.
   The proxy records the real one in x-forwarded-host, so prefer it.

   These headers are only trusted when NEXT_PUBLIC_SITE_URL is unset; set that
   in production and the answer never depends on a header a client could forge. */
export function requestOrigin(request) {
  const host =
    request.headers.get('x-forwarded-host') || request.headers.get('host');
  if (!host) return new URL(request.url).origin;
  const proto =
    request.headers.get('x-forwarded-proto') ||
    (host.startsWith('localhost') || host.startsWith('127.0.0.1') ? 'http' : 'https');
  return `${proto}://${host}`;
}
