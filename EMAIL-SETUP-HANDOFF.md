# Email setup — RPS Cohorts

**For:** whoever holds the Cloudflare, Resend and Vercel accounts for `rockpaperscissors.studio`.
**Time:** about 20 minutes, plus waiting for DNS.
**Needs:** Cloudflare DNS access · a Resend account · Vercel access to the `cohorts` project.

The site at <https://cohorts.rockpaperscissors.studio> now emails people a
confirmation when they register for a workshop. The code is written, deployed and
tested. **It will not send anything until the three tasks below are done.**

Right now registration works and every unsent email is logged — so nobody sees an
error, and nobody gets told they are in. The next session is **Sat 19 Sep**.

---

## Task 1 — Fix the SPF record (do this first, it is not about this app)

**The domain currently publishes two SPF records. That breaks SPF for everything
it sends, including normal Google Workspace mail.**

A domain is allowed exactly one SPF record. A receiver that finds two returns
`permerror` and authenticates none of your mail. This is very likely why the
domain has had transactional email flagged for bounces.

Verified against public DNS on 2026-09-15:

```
v=spf1 include:_spf.google.com ~all      <- Google Workspace: live (MX + DKIM present)
v=spf1 include:mailgun.org ~all          <- Mailgun: no DKIM found, looks disused
```

**Do this:** Cloudflare → `rockpaperscissors.studio` → **DNS → Records**. Filter
for TXT records on the root name (`@`). Delete one of the two above, and edit the
other to read exactly:

```
v=spf1 include:_spf.google.com include:mailgun.org ~all
```

That is the safe merge. It clears the error and changes nothing about who is
allowed to send.

> **On dropping Mailgun.** Only a tracking CNAME was found
> (`email.rockpaperscissors.studio → mailgun.org`) and no DKIM key, which suggests
> nothing sends through Mailgun any more. If you can confirm that, use
> `v=spf1 include:_spf.google.com ~all` instead. **Do not guess** — if some other
> system still sends via Mailgun, removing the include starts failing its mail.

Unrelated but worth a look while you are in there: DMARC is `p=none` with reports
going to `rua@dmarc.brevo.com`, so it is monitoring only and enforcing nothing.
Not a blocker. Worth revisiting once SPF is clean.

---

## Task 2 — Resend account and domain verification

The app sends through [Resend](https://resend.com). Free tier at time of writing
is 3,000 emails/month and **100/day** — confirm current limits at
<https://resend.com/pricing>. A 45-seat cohort is well inside that; a launch
announcement that lands all at once is the only thing that could brush the daily
cap.

1. Create the account (or use the existing one) at <https://resend.com>.
2. **API Keys → Create** with **Sending** access. The key starts `re_`.
   Keep it somewhere safe — Resend shows it once.
3. **Domains → Add Domain** → `rockpaperscissors.studio`.
4. Resend gives you DKIM and SPF records. Add them in Cloudflare → DNS → Records.
   - Set each to **DNS only** (grey cloud), *not* proxied. Proxying breaks mail records.
   - If Resend offers a subdomain setup (e.g. `send.rockpaperscissors.studio`),
     either is fine — but the app sends from `cohorts@rockpaperscissors.studio`,
     so if you choose a subdomain, tell the dev team so `MAIL_FROM` is changed to match.
5. Wait for Resend to show the domain as **Verified**. Usually minutes on
   Cloudflare; allow a few hours.

> **This is the step that fails silently.** Until the domain shows Verified,
> Resend accepts sends and delivers them **only to your own Resend account
> address**. Every other recipient gets nothing, and the app is told it succeeded.
> Do not skip to Task 4 before this says Verified.

---

## Task 3 — Put the key in Vercel

`cohorts.rockpaperscissors.studio` is served by Vercel (confirmed: the DNS points
at `vercel-dns-017.com`).

Vercel → the **cohorts** project → **Settings → Environment Variables**:

| Name | Value | Environment |
|---|---|---|
| `RESEND_API_KEY` | the `re_…` key from Task 2 | **Production only** |

Leave it unset for Preview and Development, so test deployments can never email a
real registrant.

Two optional overrides, only if you used a different sending address:

| Name | Default if unset |
|---|---|
| `MAIL_FROM` | `RPS Cohorts <cohorts@rockpaperscissors.studio>` |
| `MAIL_REPLY_TO` | `cohorts@rockpaperscissors.studio` |

**Redeploy after saving** — environment variables are read at build time, so an
existing deployment will not pick the key up on its own.

---

## Task 4 — Check it actually works

From a clone of the repo, in the `frontend/` folder:

```bash
RESEND_API_KEY=re_xxx node scripts/check-mail.mjs you@example.com
```

It checks the SPF record, the key, and the domain verification — in the order they
fail — and then sends one real test email. All four lines should pass:

```
PASS  One SPF record on rockpaperscissors.studio.
PASS  RESEND_API_KEY is set (re_abc…).
PASS  Resend accepted the key.
PASS  "rockpaperscissors.studio" is verified. Mail can go to any address.
PASS  Sent to you@example.com. Check the inbox, and the spam folder.
```

Then do one real registration on the live site with a personal address and confirm
the "You're in" email arrives. **Check spam as well as the inbox** — the first
mail from a newly verified domain often lands there.

---

## What done looks like

Someone registers for the 19 Sep workshop and immediately gets an email with the
session time, the Google Meet link, a dial-in number and an Add-to-calendar button.
If the session is full they get a waitlist email instead.

## If you do nothing

Registration keeps working and nobody is emailed. There is no error and no alert —
the only trace is a log line per skipped email in the Vercel function logs. The
first you would hear of it is a participant asking why they never got a link.

## Questions

Anything about the code rather than the accounts — what the email says, when it
fires — is in `frontend/BACKEND_SETUP.md` section 7, and the email itself is
`frontend/lib/emails/enrollment.js`.
