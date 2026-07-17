# Backend setup (Supabase)

The backend is Supabase (managed Postgres + Auth), integrated into this Next.js
app. Follow these one-time steps to go live.

## 1. Create the Supabase project
1. Go to https://supabase.com → **New project**. Pick a name + region + strong DB password.
2. Wait for it to provision (~1 min).

## 2. Load the database schema
1. In the Supabase dashboard: **SQL Editor → New query**.
2. Paste the entire contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**.
3. This creates the `profiles` and `submissions` tables, the signup trigger, and
   Row-Level Security policies. It's safe to re-run.

## 3. Add your keys
1. **Project Settings → API**. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (secret — server only)
2. Paste them into `.env.local` (replace the placeholder values). Restart `npm run dev`.

## 4. Auth settings
- **Authentication → Providers → Email**: for the smoothest flow, turn **Confirm
  email OFF** during development (users are logged in immediately after signup).
  Leave it ON in production if you want verified emails — the app handles both
  (it shows a "check your email" screen when confirmation is required).
- **Google login** (optional): Authentication → Providers → Google → enable and
  paste your Google OAuth client ID/secret. Add
  `https://<your-project>.supabase.co/auth/v1/callback` as an authorized redirect
  URI in Google Cloud Console.
- **URL Configuration → Redirect URLs**: add `http://localhost:3000/**` (and your
  production domain) so OAuth + password-reset links redirect back correctly.

## 5. Run it
```bash
npm run dev
```
Test flow: `/onboarding` (create account) → `/dashboard` (submit a link) →
`/signin` (log back in).

## 6. Team access to submission data (CSV / Excel)
- Supabase dashboard → **Table Editor → `submissions`**.
- Every submission appears here with `user_email`, `user_name`, `link`, `note`,
  `assignment`, `status`, `created_at`.
- Click the **⋯ / Export** button to download **CSV** (opens directly in Excel).
- No admin panel needed — the service-role/dashboard view bypasses RLS so the team
  sees all rows, while each end-user (via the app) only sees their own.

## What's wired
| Area | File |
|------|------|
| Browser client | `lib/supabase/client.js` |
| Server client + admin | `lib/supabase/server.js` |
| Session refresh + route guard | `lib/supabase/middleware.js`, `middleware.js` |
| OAuth / email-link callback | `app/auth/callback/route.js` |
| Sign in (email/pw, Google, forgot) | `app/signin/page.jsx` |
| Sign up + profile | `app/onboarding/page.jsx` |
| Submit assignment | `app/dashboard/page.jsx` |
| Password reset | `app/reset-password/page.jsx` |
| DB schema | `supabase/schema.sql` |
