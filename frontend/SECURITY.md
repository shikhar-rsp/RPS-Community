# Security overview

How Academy protects data, and what you must configure in the Supabase dashboard.

## The mental model (important)

You **cannot** hide data from the dev tools of the user who is logged in — their
browser must decrypt it to display it. "Client-side encryption so no one can read
it in dev tools" is not real security. What actually protects data:

1. **Row-Level Security (RLS)** — a logged-in user can only ever read/write their
   OWN rows, even if they hand-write Supabase queries in the console.
2. **Secrets stay server-side** — the `service_role` key is never shipped to the
   browser. Only the `anon` key is public, and it's useless without passing RLS.
3. **TLS in transit + encryption at rest** — handled by Supabase.
4. **The browser can't be trusted for writes** — identity and status are set on
   the server, never accepted from the client.

## What's implemented in code

| Protection | Where |
|---|---|
| Security headers (CSP, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy) | `next.config.js` |
| Route guard (server middleware) for `/dashboard` | `middleware.js`, `lib/supabase/middleware.js` |
| Submissions written via a **validated Server Action** (not a raw client insert) | `app/dashboard/actions.js` |
| Input validation — http(s)-only links (blocks `javascript:`/`data:` XSS), length caps | `lib/validation.js` |
| RLS + owner/status stamped by DB trigger + status CHECK + least-privilege grants | `supabase/security.sql` |
| Passwords min 8 chars | onboarding / reset pages |
| `service_role` key server-only, `.env.local` git-ignored | `lib/supabase/server.js` |

### The specific vulnerability this closed
Previously the browser sent `user_name` and `status` on insert. A user could open
dev tools and submit `status: "assessed"` or a fake name. Now:
- The Server Action ignores those fields and derives them from the session.
- A DB trigger (`stamp_submission`) re-derives `user_id`/`email`/`name` and forces
  `status = 'submitted'` — defence in depth, even if someone bypasses the app.
- RLS `with check` stops users updating a row to any status other than `submitted`.

## What YOU must turn on in the Supabase dashboard

- [ ] **Authentication → Providers → Email → Confirm email: ON** (in production).
- [ ] **Authentication → Policies → Leaked password protection: ON**
      (rejects passwords found in known breaches, via HaveIBeenPwned).
- [ ] **Authentication → Policies → Minimum password length: 8** (or higher).
- [ ] **Authentication → Rate limits** — keep the default sign-in/sign-up limits on
      (throttles brute-force + signup spam).
- [ ] **Authentication → Attack protection → CAPTCHA (hCaptcha/Turnstile): ON**
      for production sign-up/sign-in (stops automated account creation).
- [ ] **Authentication → MFA** — enable TOTP if you want 2FA for staff accounts.
- [ ] Run **`supabase/security.sql`** in the SQL editor (after `schema.sql`).
- [ ] Confirm **RLS is enabled** on every table under **Table Editor** (green
      shield). Never disable it on `profiles` / `submissions`.
- [ ] Keep the **`service_role` key** out of any `NEXT_PUBLIC_*` var, git, or the
      browser. Rotate it (Settings → API) if it's ever exposed.

## Before going to production

- Set `NEXT_PUBLIC_SITE_URL` to your real https domain and add it to Supabase
  **URL Configuration → Redirect URLs**, and to the Google/LinkedIn OAuth apps.
- Serve only over **HTTPS** (Vercel does this automatically) so HSTS takes effect.
- Consider tightening the CSP `script-src` to nonces if you later remove inline
  scripts (currently `'unsafe-inline'` is required by the design's inline styles/
  Next runtime).
