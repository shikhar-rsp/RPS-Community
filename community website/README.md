# RPS Cohorts — website

A working front-end for the RPS Cohorts workshop program, built to the spec in
`RPS-Cohorts-PRD.md`, the layouts in `RPS-Cohorts-Wireframes-MidFi.html`, and the words in
`RPS-Cohorts-Copy-Deck.md`.

Every journey in the PRD is walkable end to end — including the gated, logged-in and
error states — with no backend, no database and no OAuth keys.

---

## Run it

```bash
node server.js
```

Then open <http://localhost:4321>. No dependencies, no build step. Opening `index.html`
directly also works, but the server gives you real URLs and a proper 404.

---

## Pages

| Route | What it is |
|---|---|
| `index.html` | Homepage — all eight sections from PRD §8.1, in order |
| `workshops.html` | Listing with Upcoming / Past tabs and the empty state |
| `workshop.html?w=<slug>` | Detail page. One route, two layouts, branching on derived status |
| `login.html` | Login. A page of its own — Google, or email confirmed with a code |
| `account.html` | "My workshops" — auth required, redirects and returns |
| `internal.html` | Credential-gated content console (PRD §12) |
| `404.html` | Not-found |

## The journeys, and how to walk them

There's a **Prototype controls** panel bottom-left. It's scaffolding, not product — it
jumps you to any state without waiting for a real date to pass or a seat to sell out.

1. **Anonymous browse.** Homepage → the gap → about us → the two workshops (next up and
   last one) → testimonials → FAQ → WhatsApp. Nothing is gated, and the next session's
   date, seat count and *Grab a seat* are on the homepage rather than a click away.
2. **Log in — two ways, one page.** Every gated action leaves for `login.html`, carrying
   what you were doing and where to come back to.
   - **Google** — one button, straight in.
   - **Email + code** — type an address, get a six-digit code, confirm it. No password, no
     separate sign-up step. Wrong code, expired code, resend, and *use a different email*
     all have states. Nothing is emailed in the prototype: **the code is printed on the
     screen.**
3. **Enroll.** Workshops → *Grab a seat* → login if you aren't → back on the same workshop
   with the form open → **name, email, WhatsApp number** → *Confirm my seat* → **You're
   in.** Name and email come pre-filled from the account; the number is the one thing we
   can't already know, and it's where the reminder and the Meet link go. Country code is
   required — the field says so, and says why.
4. **Waitlist.** *AI prototyping sprint* is seeded full. Same flow, ends on the waitlist
   state, and the seat pill says "Full — waitlist open" rather than relying on colour.
5. **The 150-vs-45 race.** *Portfolio teardown, live* is seeded with exactly one seat.
   Start enrolling, then hit **Fill the last seat** in the prototype panel while you're on
   the login page: you come back to *"Someone took the last seat while you were signing in.
   Rude."* Seat count at the moment you set off is kept across the login trip, so the line
   is literally true.
6. **Gated recording.** Open the past workshop logged out — recap and testimonials are
   public, the player is blurred behind *Log in to watch*. Log in and you land back on the
   recording, unlocked. The player itself only loads on click.
7. **Gated files.** The resource rows are always visible; the *download* is what's gated.
   Click one logged out and the login page remembers **which file** — you come back to it
   already downloading, with every row unlocked.
8. **My workshops.** Grouped Coming up / Been to, with Meet link, the number the reminder
   goes to, waitlist note, and *Watch it again*. Signed-out visits bounce through `/login`
   and land back here.
9. **Internal console.** `internal.html`, `rps@internal.demo` / `cohorts`. Add a workshop
   and it appears on the public site immediately — the PRD Phase 6 acceptance test. The
   **Who's coming** tab is the registration list: name, email and WhatsApp number per
   workshop, split by registered and waitlisted.
10. **Edges.** Google login failure, bad email, wrong code, expired code, recording-not-up-yet,
    empty calendar, already-enrolled, 404 — all reachable from the prototype panel or by URL.

---

## Design direction

Built to the `Community Home v3` canvas in Claude Design, then carried across every
page so nothing reads like a wireframe next to the homepage, and re-skinned from the
original forest green to **orange `#FF630B`**.

- **Blueprint paper, not flat white.** `#FCFBFA` ground with a 72px hairline grid and
  two soft radial washes at the top — one warm, one cool. Sections that need to lift
  off it sit on a `.band` with a 1px rule top and bottom. The page reads like drafting
  paper, not a dashboard.
- **One confident accent, in three steps.** `#FF630B` is the *signature* — it fills
  meters, badges, illustration shapes and the pulse on the hero pill, but it is never
  small text: it only clears **2.97:1** on white. Text-safe orange is `#C24405`
  (`--accent`, 5.1:1), headings are the deep burnt `#6B2A05` (`--heading`, 10.4:1), and
  the always-dark surfaces — the "next up" card, the CTA panel, the player, the calendar
  tile — are `#5A2204` (`--deep`).
- **A second, cooler pole for "not yet".** Waitlist, in-progress and
  recording-still-being-cut use slate `#3D5A8A` (`--hold`). It is deliberately *not* a
  yellow: on an orange-branded site an amber "pending" chip just reads as more brand.
  Green is gone entirely, so nothing accidentally signals success.
- **Warm neutrals.** The ink ramp runs `#221A15 → #4A3F38 → #6B5D53 → #7A6C61`, warm
  enough to sit under orange without going grey-blue.
- **Syne throughout,** display and body. It's a wide, geometric face, so the heading
  tracking is only half as tight as a grotesque would take (`-.02em`, `-.025em` on h1)
  and the leading is a touch more open; body sits at 1.6 line-height.
- **Generous radii and one shadow.** 20/28/32px corners, pill buttons and chips, a
  single soft elevation for cards that lift on hover and for the enrolment panel.
- **Growth shows up as direction, not decoration.** The ascending arrow inside every
  section eyebrow and on every forward button, the capacity meter that fills, the
  gradient rule under the problem section's closing line.

### Dark mode

A switch in the nav, next to *Grab a seat*. The stored choice wins; with none, the OS
decides and keeps deciding — flipping the system setting flips the site until the
visitor picks a side.

- An inline script at the top of every `<head>` sets `data-theme` on `<html>` before
  first paint, so there is no flash of the wrong theme. `assets/js/ui.js` keeps it in
  sync afterwards and persists the choice in `localStorage` under `rps.theme`.
- The palette lives in two token blocks in `app.css` — `:root` and
  `:root[data-theme="dark"]`. Components never name a colour; they name a token.
- Two rules make it hold together. **One:** anything that is *always* a dark surface
  uses `--deep`, which stays dark in both themes, so its contents can use fixed light
  values and never need a second rule. **Two:** the primary button carries
  `--on-accent`, because white on orange fails in dark mode — there the button is
  bright `#FF8438` with near-black text at 8.1:1.
- `color-scheme` is set on both, so scrollbars, form controls and the browser's own
  chrome follow along. `<meta name="theme-color">` is updated live.

### Layout changes, and why

Three structural problems were fixed rather than restyled.

- **The homepage never showed the next session.** It featured the last cohort only, so the
  one thing a visitor came to do — take a seat — lived a click away behind a generic CTA.
  There is now a Workshops section carrying both cards: the next session (dark, with date,
  time, seat count and a working *Grab a seat*) and the last one (with duration, what was
  covered and *Watch the recording*). The nav CTA points at that same next session with
  the enrol flow already firing, and falls back to the listing when nothing is scheduled.
- **The listing was a stack of thin rows.** Cards now carry the banner, the date, the time,
  the host, the seat count and your own status, so nobody opens three pages to find out
  the next one is full. The first upcoming session gets the wide dark treatment: which one
  is next should be obvious before you read a word.
- **The workshop detail page opened with a full-bleed banner.** Title, date and seat count
  were all below the fold, which put the two questions people actually arrive with — *what
  is this* and *can I still get in* — last. Both layouts now lead with a two-column hero
  that answers them in the first screen. The past page keeps the next session in the right
  rail, so a finished recording is no longer a dead end.

### Accessibility (PRD §7, §10)

- Every body-text pair clears 4.5:1 **in both themes**. The tightest in light is accent
  on its own soft tint at **4.6:1**; muted on paper is 6.1:1, faint 4.9:1, ink 16.7:1,
  headings 10.4:1, white on the accent 5.1:1. In dark nothing falls below 6:1 — muted on
  paper is 8.3:1, accent 7.8:1, near-black on the accent 8.1:1.
- The vivid brand `#FF630B` is treated as a fill, never as text, precisely because it
  does not clear 4.5:1 on white.
- Visible focus ring on every interactive element; skip link; the mobile menu and the
  avatar menu close on Escape. The theme switch is a real button with `aria-pressed`
  and a label that says what pressing it will do.
- Touch targets are 40–48px, including the small "Download" and text-link buttons.
- **No state is signalled by colour alone** — Registered / Waitlisted / Been there, and
  full-vs-open seats, all carry a text label.
- Tabs, the accordion and the avatar menu are real ARIA widgets, not styled divs.

## One correction to the spec

PRD §9 derives a workshop's status as *past = the date has passed **and** a recording
exists*. That rule parks a finished-but-not-yet-edited workshop back in **Upcoming**, where
people can still enroll in a session that already happened — which is precisely the
"recording not up yet" case the copy deck writes copy for.

So this build derives `past` from the date alone, and treats *recording ready* as a separate
question (`store.isPast()` / `store.recordingReady()` in `assets/js/store.js`). A workshop
that's finished but unedited shows under Past with *"Recording's not up yet — still editing.
Few days."* Flip it on with the prototype panel to see it. Worth confirming before the real
build, since it changes one line of the Prisma-derived status.

## Where this departs from the PRD on auth

Both changes were asked for directly, and both are worth noting because they touch §5.1,
§8.3 and §8.5.

- **Login is a page, not a modal.** §8.5 made the modal primary and `/login` the fallback.
  It's now the other way round: there is no modal, every gated action navigates to
  `login.html?intent=…&next=…`, and the return trip is what carries the user back. Intent
  preservation (§11.2) does more work as a result — for a file download it remembers the
  specific file, not just the page.
- **LinkedIn is out; email + one-time code is in.** §5.1 specified Google + LinkedIn only.
  Login is now Google **or** an email address confirmed with a six-digit code — no
  password, and still no separate sign-up step. Re-adding LinkedIn is one entry in
  `demoAccounts` plus a button; the provider plumbing hasn't changed shape.
- **`User` gains a phone, `Enrollment` gains a snapshot.** The enrollment form writes
  `name`, `email` and `whatsapp` onto the enrollment row *and* folds the number back onto
  the user so the next enrollment pre-fills. The snapshot matters: people edit their
  profile, and a registration list shouldn't quietly change under RPS afterwards. In Prisma
  that's `User.phone String?` plus three columns on `Enrollment`.

Two smaller calls, both easy to reverse:

- **Empty listing.** §8.2 says default to Past when nothing is upcoming, but also specifies
  an empty state whose job is the WhatsApp signup. Defaulting to Past would mean that empty
  state never renders, so the Upcoming tab keeps its empty state and puts Past one click
  away.
- **Listing CTA** goes to the detail page with the enroll flow already firing, rather than
  enrolling from the card. Nobody should confirm a seat without seeing what they're
  confirming.

---

## Content still needed

Everything marked below is a stand-in. Search for `needsCopy` and `placeholder` in
`assets/js/seed.js`.

- **Photography and the logo.** Placeholder illustrations are standing in for the Meet
  session, the studio, the team group photo and the four workshop banners; the logo is
  currently a wordmark. **You do not have to touch any markup.** Drop the file into the
  directory below and set the matching key in `assets/js/seed.js` → `config` — the frame
  keeps its size, radius and crop, and the "Placeholder — …" badge removes itself.

  | File | Directory | `seed.js` key |
  |---|---|---|
  | **Team group photo** (About us) | `assets/img/about/` | `config.images.team` |
  | **Logo** (nav + footer) | `assets/img/brand/` | `config.logoUrl`, `config.logoDarkUrl` |
  | Meet session / studio photos | `assets/img/sessions/` | `config.images.meet`, `config.images.studio` |
  | Workshop banners (also the OG image) | `assets/img/workshops/` | `bannerUrl` on that workshop |

  Sizes, formats and alt-text rules are in `assets/img/README.md`. Per the PRD the team
  photo is the single highest-value image on the site.
- **Testimonials.** Rendered exactly as the copy deck's placeholders ("Name / Role"). Collect
  real ones with: *"What can you do now that you couldn't before?"*
- **Hosts.** Two invented names and bios. Real names, titles, photos needed.
- **Two workshops.** *AI prototyping sprint* and *Portfolio teardown, live* exist in the
  wireframe as titles only, so their body copy was written to match the deck's voice and is
  flagged `needsCopy`. The handoff and landing-page workshops use deck copy verbatim.
- **WhatsApp invite URL** — currently a placeholder in `seed.js` → `config.whatsappUrl`
  (`WHATSAPP_GROUP_URL` in the real build).
- **Recording URL** for cohort 01.

---

## If this becomes the Next.js build (PRD §13)

The shape is deliberately close, so this is a port rather than a rewrite:

- `assets/js/seed.js` maps 1:1 to the Prisma models in §9 — it can become `prisma/seed.ts`
  almost as-is.
- `assets/js/store.js` is the data layer. Each function has a server equivalent:
  `enroll()` becomes a server action that re-checks capacity **inside a transaction**,
  re-validates name/email/phone, and re-checks the session (§11.3) — the client-side checks
  here are convenience, never security.
- `requestCode()` / `verifyCode()` become an Auth.js **Email provider** (magic code): mail
  the code with Resend, store its hash with a short TTL, rate-limit by address and by IP,
  and cap attempts. The prototype prints the code on screen instead — that, obviously, goes.
- `RPS.intent` plus the `next` query param are the intent-preservation mechanism from
  §11.2; with Auth.js they become `callbackUrl`.
- `RPS.track()` already emits the eight §10 events (`workshop_viewed`, `enroll_clicked`,
  `enrollment_confirmed`, `waitlisted`, `recording_unlock_clicked`, `resource_downloaded`,
  `whatsapp_cta_clicked`, `faq_item_opened`). Point it at the real sink. The prototype panel
  shows the live event log.
- Per-page `<title>`/description/OG are set on the workshop route already; in Next they move
  to `generateMetadata()` with the banner as the OG image.

**Delete before production:** the prototype controls panel (`demoPanel()` in `ui.js`), the
demo accounts in `seed.js`, the on-screen login code in `page-login.js`, the first-login
attendance seed in `store.startSession()`, and the demo credential in
`store.internalSignIn()`.

---

## Files

```
index.html  workshops.html  workshop.html  login.html  account.html  internal.html  404.html
server.js                     zero-dependency static server
assets/css/app.css            design system + every component
assets/js/seed.js             content, shaped like the Prisma schema
assets/js/store.js            data layer, auth + codes, enrollment, capacity, formatting, analytics
assets/js/ui.js               nav/footer, theme switch, login routing, gating, toasts, art, demo panel
assets/js/page-*.js           one per route
assets/img/                   real photography + the logo go here — see assets/img/README.md
```
