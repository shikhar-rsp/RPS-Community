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

## 7. Confirmation email (Resend)

When someone takes a workshop seat they get a "You're in" email — or a "You're
on the waitlist" one, if the session was already full. Nothing is sent until
this is configured, and **enrolling keeps working either way**: an unsent
confirmation is logged, never surfaced to the person registering, and never
allowed to fail the seat.

1. [resend.com](https://resend.com) → **API Keys** → create one with *Sending*
   access. It starts `re_`.
2. **Domains** → add `rockpaperscissors.studio` and put the DKIM/SPF records it
   gives you into DNS. Resend refuses any `From` on an unverified domain —
   **until this is done you can only send to your own Resend account address**,
   so a test registration to any other inbox will fail.
3. Set `RESEND_API_KEY` in Vercel → **Settings → Environment Variables**, for
   **Production** only. Leave it unset locally and on previews, so development
   never mails a real person.
4. Optionally override `MAIL_FROM` / `MAIL_REPLY_TO` (see `.env.example`). Both
   default to `cohorts@rockpaperscissors.studio`.

Free tier is 3,000 emails/month and 100/day at the time of writing — check
resend.com/pricing, since a launch announcement is the one thing that could
push a day over 100.

### Fix the SPF record first

**The domain currently has two SPF records, and that breaks SPF for every mail
it sends — Google Workspace included.** A domain is allowed exactly one. When a
receiver finds two it returns `permerror` and stops evaluating, so nothing the
domain sends is SPF-authenticated. This is the most likely cause of the bounce
problem noted at the top of `lib/email.js`, and setting Resend up on top of it
would inherit a broken foundation.

Checked 2026-09-15 against public DNS:

```
v=spf1 include:_spf.google.com ~all      <- Google Workspace, live (MX + DKIM present)
v=spf1 include:mailgun.org ~all          <- Mailgun, no DKIM found; looks like a leftover
```

DNS is on **Cloudflare** (`edward.ns` / `jamie.ns.cloudflare.com`). In the
Cloudflare dashboard → the domain → **DNS → Records**, delete one of the two
TXT records at the root (`@`) and edit the other to a single merged record:

```
v=spf1 include:_spf.google.com include:mailgun.org ~all
```

That is the safe merge: it fixes the `permerror` and changes nothing about who
can send. Only the tracking CNAME `email.rockpaperscissors.studio → mailgun.org`
was found for Mailgun and no DKIM, which suggests it is not actually sending —
but confirm that before dropping `include:mailgun.org`, because if some other
system still sends through Mailgun, removing it fails their mail instead.

While in there: DMARC is `p=none` with reports going to `dmarc.brevo.com`, so
it is monitoring only and not enforcing. Worth revisiting once SPF is clean and
Resend's DKIM is live, but it is not a blocker.

### Verify it worked

From `frontend/`, with the key in the shell:

```bash
RESEND_API_KEY=re_xxx node scripts/check-mail.mjs you@example.com
```

It checks the three things that fail, in the order they fail, and names which
one it was. Run it before trusting a real registration — the domain-not-verified
case is silent, and the app cannot tell it apart from success.

To change what the email says, edit `lib/emails/enrollment.js`. It builds the
HTML and plain-text parts together; keep them in step, because the text part is
what spam filters read and what a watch or screen reader falls back to.

## 8. The registration list, in the site

`/admin/registrations` is the list, built in. It reads `enrollments` live, so
there is nothing to sync, import or keep up to date — a registration is on it
the moment it happens. Search by name, email or number, filter by workshop and
status, and **Export CSV** for anything a spreadsheet is genuinely better at.
Each row links the email to a mail client and the number to WhatsApp, which is
what sending the Meet link round actually involves.

**Who can open it.** Only the addresses in `ADMIN_EMAILS`; unset, it is the
three in `lib/admin.js` — dheena@, rishi@ and vivin@. Setting the variable
**replaces** that list rather than adding to it, so name everyone who needs
access, not just the new person. Anyone else — signed in or not — gets a
404 rather than a refusal, so the page's existence is not advertised. The check
is the session's verified email, made on the server before any data is fetched;
there is no client-side gate to bypass and nothing about who is an admin reaches
the browser.

The read uses the service-role client, because RLS limits every normal session
to its own row. That key stays on the server, and only the rows rendered reach
the page.

## 9. Registrations in a Google Sheet (optional)

The team's sheet ("Cohort Ep2 Registrations") reads the registration list
without needing a Supabase login. There are two ways to fill it, and **you only
need one**.

### The simple one: the sheet pulls from Supabase

`scripts/sheet-sync-supabase.gs` goes into the sheet itself
(Extensions → Apps Script) and reads the `enrollments` table directly on a
15-minute timer. Nothing is added to the website, nothing is deployed, and the
first run brings across every registration that already exists — so there is no
separate backfill step.

Setup is in that file's header: paste it in, run `setUp` once and give it the
Supabase project URL and **service_role** key, then run `syncNow`, then
`startAutoSync`. It also adds a **Registrations** menu to the sheet so the team
can sync on demand without opening the editor.

The service_role key is required because `enrollments` is behind RLS — the anon
key can only read a signed-in user's own row, which from a script is nobody.
That key bypasses every access rule, so it is stored in Script Properties rather
than in the file, and anyone who can open the Apps Script editor on that sheet
can read it. Keep the sheet's edit access tight.

### The other one: the site pushes on each registration

`lib/sheets.js` + `scripts/registrations-sheet.gs` + `SHEETS_WEBHOOK_URL`.
Rows appear the instant someone registers rather than within 15 minutes, at the
cost of a deployed web app and two environment variables.
`scripts/backfill-sheet.mjs` carries across anyone who registered before it was
switched on.

Running both is safe — they upsert on the same key (email + workshop) and
converge on the same rows — but there is no reason to.

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
| Workshop seats + waitlist | `app/workshops/actions.js`, `supabase/enrollments.sql` |
| Seat confirmation email | `lib/emails/enrollment.js`, `lib/mail.js` |
| Registration list (admin) | `app/admin/registrations/`, `lib/admin.js` |
| Registrations → Google Sheet | `scripts/sheet-sync-supabase.gs` (pull) or `lib/sheets.js` (push) |
| DB schema | `supabase/schema.sql` |
