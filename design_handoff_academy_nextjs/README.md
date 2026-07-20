# Handoff: Academy Workshop site → Next.js migration

## ⚠️ Read this first — what this package is

This bundle contains the **complete, finished design** of the Academy workshop
site, built as HTML prototypes. It is the **single source of truth**. Your job is
a **framework migration only**: rebuild these exact pages as a Next.js
application with **zero visual, UX, interaction, or design changes**. The result
must be **pixel-perfect** against the source files. If screenshots of the
original and your Next.js build are placed side by side, there must be **no
visible difference**.

The migration brief (verbatim requirements) is in `MIGRATION-BRIEF.md`. Treat it
as binding.

> These HTML files were authored in a component runtime ("DC" format). They are
> not throwaway mockups — they are the production design. Because the DC format
> is already React-under-the-hood (see "Source format" below), the conversion is
> almost entirely **mechanical string transformation**, not reinterpretation. Do
> not "improve", "modernize", "clean up the design", or make judgment calls about
> spacing/typography/color. Copy the values exactly.

---

## Source format (how to read the `.dc.html` files)

Each page in `design-source/` is a single `.dc.html` file with two parts:

1. **Template** — the markup between `<x-dc>` and `</x-dc>`.
2. **Logic class** — `class Component extends DCLogic { ... }` inside the
   `<script type="text/x-dc">` at the bottom of the file.

The DC runtime compiles this to React. That means the template is essentially
JSX already. The mapping to a normal React/Next component is 1:1:

| DC source | Next.js / React |
|---|---|
| `class="..."` | `className="..."` |
| `for="..."` | `htmlFor="..."` |
| `style="color:red;font-size:14px"` (CSS string) | `style={{ color: 'red', fontSize: 14 }}` (object) |
| `style-hover="..."`, `style-active`, `style-focus`, `style-before`, `style-after` | pseudo-states — move to a CSS module / styled rule (see "Styling" below) |
| `{{ path }}` in text/attr | `{path}` — value from the logic class |
| `<sc-for list="{{ items }}" as="item">…{{ item.x }}…</sc-for>` | `{items.map((item, $index) => (…))}` |
| `<sc-if value="{{ cond }}">…</sc-if>` | `{cond && (…)}` |
| `ref="{{ setX }}"` | `ref={setX}` (or a `useRef`) |
| `onClick="{{ fn }}"`, `onChange="{{ fn }}"` | `onClick={fn}`, `onChange={fn}` (already camelCase) |
| `renderVals()` returns `{ a, b, fn }` | those are your component's state/handlers |
| `this.state` / `this.setState` / `componentDidMount` | React class component, or convert to hooks |
| `this.props.accent ?? '#F5330A'` | a prop / constant with the same default |
| `<helmet>…</helmet>` (fonts, `<style>`, resets) | global styles + `next/font` (see below) |

`hint-*` attributes (`hint-placeholder-count`, `hint-size`, etc.) are DC
streaming hints — **drop them**, they have no runtime effect.

**These pages are client-interactive** (state, IntersectionObserver, timers,
file inputs). Mark each page/component `"use client"`.

---

## Route map

Rebuild as App Router pages. Rewrite every in-app link accordingly.

| Source file | Route | Notes |
|---|---|---|
| `Opencanvas Workshop.dc.html` | `/` | Public workshop landing page |
| `Sign In.dc.html` | `/signin` | Login + rotating benefits panel |
| `Onboarding.dc.html` | `/onboarding` | Multi-step signup wizard |
| `Dashboard.dc.html` | `/dashboard` | Logged-in home ("My workshops") |
| `Workshop (Logged In).dc.html` | `/workshop` | Logged-in workshop detail |

### Link rewrites (find → replace in `href`s)

| Source `href` | Next.js `<Link href>` |
|---|---|
| `Opencanvas Workshop.dc.html` | `/` |
| `Sign In.dc.html` | `/signin` |
| `Onboarding.dc.html` | `/onboarding` |
| `Dashboard.dc.html` | `/dashboard` |
| `Workshop (Logged In).dc.html` | `/workshop` |
| `#` (placeholder) | keep as `#` (no destination in the design) |
| `https://meet.google.com/landing` | keep exactly (external, `target="_blank" rel="noopener"`) |

Use `next/link` for internal navigation. `Sign out` and `Log in to register`
links point to `/signin` in the design — preserve that.

---

## Recommended project structure

```
app/
  layout.tsx            # <html>/<body>, global styles, Geist font, base resets
  globals.css           # resets + .btn system + @media rules + keyframes (verbatim)
  page.tsx              # "/"          → Opencanvas Workshop
  signin/page.tsx       # "/signin"
  onboarding/page.tsx   # "/onboarding"
  dashboard/page.tsx    # "/dashboard"
  workshop/page.tsx     # "/workshop"
components/
  Nav.tsx               # public nav (logo + Log in)
  AuthNav.tsx           # logged-in nav (logo + profile dropdown + Sign out)
  ProfileMenu.tsx       # avatar dropdown + avatar upload (Dashboard + Workshop)
  Footer.tsx            # shared footer (Community / Account columns)
  Button.tsx (optional) # thin wrapper that just applies .btn classes
  Reveal.tsx            # IntersectionObserver scroll-reveal wrapper
public/
  assets/               # all images (copied from design-source/assets)
```

Componentize the genuinely repeated pieces (nav, footer, profile menu, reveal
wrapper). Do **not** over-fragment — a 400-line page component is fine and
matches the source. Keep the rendered DOM identical.

---

## Styling — keep it identical

- **Do not restyle anything.** Copy every inline `style` value verbatim into a
  React style object (px numbers or strings both fine; keep `clamp(...)`,
  `var(--...)`, gradients, shadows exactly as written).
- The design is driven by **CSS custom properties** set on each page's root
  `<div>`. Keep that pattern: put the same `--bg/--surface/--surface2/--border/
  --text/--muted/--faint/--accent/--glow/--navbg/--footerbg` declarations on the
  page root. (Full token list below.)
- Move only what **cannot** be inline into `globals.css`, verbatim:
  - The base resets (`*{box-sizing}`, `body{margin:0}`, `a{color:inherit}`,
    `a:hover{color:var(--accent)}`, `::selection`).
  - The **`.btn` button system** (`#oc-btn-system` block) — copy the whole thing.
  - The **`@media` responsive override blocks** (they use `!important` on class
    selectors like `.oc-hero`, `.oc-rail`, `.oc-footgrid`, `.db-*`, etc). Keep
    the class names on the corresponding elements so these rules still match.
  - `@keyframes` (`btn-spin`, `asg-pop`, dashboard `db-rise`, any others).
  - `style-hover`/`style-active`/`style-before`/`style-after` — convert each to a
    real CSS rule (a scoped class or CSS-module `:hover`/`::before`), since React
    inline styles can't express pseudo-states. Match the declared values exactly.
- Tailwind is **not** required and risks drift. If you use it, restrict it to
  layout scaffolding and still port every literal value — do not round or
  snap to Tailwind's scale.

### Fonts

The design uses **Geist** (weights 400–900) from Google Fonts. Load it with
`next/font/google` (`Geist`, subsets `['latin']`) so there's no layout shift,
and keep the stack `'Geist', -apple-system, BlinkMacSystemFont, sans-serif`.

---

## Design tokens (dark theme = default)

Root CSS variables (from the page root `<div>`):

```
--bg:       #141312
--surface:  #1d1c1b
--surface2: #242322
--border:   rgba(255,255,255,0.09)
--text:     #ECEBE9
--muted:    #9a9993
--faint:    #6e6d6a
--accent:   #F5330A
--glow:     rgba(150,55,25,0.26)
--navbg:    rgba(20,19,18,0.82)
--footerbg: #0a0a0a
```

Light theme (used by the `/` page's day/night toggle — keep the toggle):

```
--bg:#f4f3f1  --surface:#ffffff  --surface2:#efeeec  --border:rgba(0,0,0,0.10)
--text:#191817  --muted:#57564f  --faint:#8b8a85  --glow:rgba(245,90,40,0.12)
```

- **Accent** `#F5330A` is exposed as a prop `accent` (color) on the `/` page with
  default `#F5330A`. Preserve the default; the prop just re-sets `--accent`.
- **Radii:** buttons `12px`; cards `16–20px`; avatars/pills `999px`.
- **Button sizes:** `--lg` h54 pad 0 30 / 16px · `--md` h46 pad 0 22 / 15px ·
  `--sm` h38 pad 0 16 / 13.5px. Variants: `primary` (orange gradient
  `#FF7C48→#F5330A`, layered inset + `0 3px 0 #B4260B` + glow shadow),
  `secondary` (surface2 fill, border, subtle shadow), `tertiary` (transparent,
  muted text). Disabled + loading (spinner) states exist — copy the whole
  `#oc-btn-system` CSS block rather than reconstructing it.

---

## Per-page interaction inventory

All state below lives in each page's `Component` logic class. Reproduce the same
state, handlers, and effects (hooks or a class component — either is fine).

### `/` — Opencanvas Workshop (public landing)
- **State:** `{ dark: true }`; **prop** `accent` (default `#F5330A`).
- **Day/night toggle:** swaps the full CSS-var map (`darkVars`/`lightVars`) on the
  root element, then re-applies `--accent`. Keep it.
- **Scroll reveals:** elements with `data-reveal` (+ optional
  `data-reveal-delay="Nms"`) start at `opacity:0; translateY(26px)` and animate to
  visible via `IntersectionObserver` (threshold 0.1, rootMargin
  `0px 0px -6% 0px`, transition `.8s cubic-bezier(.16,.84,.44,1)`). A 2200ms
  fallback forces everything visible; a `beforeprint` handler reveals all. Port
  this as a reusable `Reveal` wrapper / hook.
- **Sticky agenda card**, CTAs to `/signin`, footer links to `/signin` & `/onboarding`.

### `/workshop` — Workshop (Logged In)
- **State:** `{ dark:true, link:'', note:'', submitted:false, submitting:false,
  menuOpen:false, avatar:'assets/vivin-avatar.png', pdfOpen:false, now:Date.now() }`.
- **Google Meet card (hero):** Meet logo header + "Joining opens when the workshop
  starts, Jul 31." + a **secondary** "Join Meet" button (Meet logo icon, links to
  `https://meet.google.com/landing`, new tab) + a **live countdown pill** beside
  it. Countdown target `new Date('2026-07-31T15:00:00')`; a 1s `setInterval`
  updates `now`; `fmtCountdown()` shows `Nd HHh MMm` while ≥1 day out, else
  `HH:MM:SS`, clamped at 0; `font-variant-numeric: tabular-nums`. Clear the
  interval on unmount.
- **Submit-your-link form:** `link`/`note` controlled inputs; submit sets a brief
  `submitting` (spinner via `.btn--loading`) → `submitted` success state; reset
  returns to the form.
- **PDF modal:** `pdfOpen` opens a modal (`.asg-pop` entrance animation); `Escape`
  and outside-click close it; a download action; body/overlay click-through
  guarded by a `stop` handler.
- **Profile dropdown:** avatar button toggles `menuOpen`; outside-click &
  `Escape` close (document listeners added in `componentDidMount`); menu has
  Edit (opens hidden `<input type=file accept=image/*>`, reads file to a data URL
  → `avatar`) and Delete (reset to default avatar). Same reveals as `/`.
- Nav: logo → `/dashboard`; "Sign out" → `/signin`.

### `/dashboard`
- **State:** `{ link:'', note:'', submitted:false, submitting:false,
  menuOpen:false, avatar:'assets/vivin-avatar.png' }`.
- **"My workshops":** workshop card is a full link to `/workshop`. Card entrance
  uses `.db-rise` keyframe with staggered `animation-delay`.
- **Profile dropdown + avatar upload:** identical behavior to `/workshop`.
- Nav: logo → `/`; footer "Workshops" → `/workshop`, "Dashboard" → `/dashboard`,
  "Sign out" → `/signin`.

### `/signin`
- **State:** `{ i:0, prev:null }` — a **rotating benefits panel** advancing every
  `DUR = 4400ms` (slide/crossfade using `i` + `prev`). Preserve timing and
  transition. Clear the timer on unmount.
- Login form (email/password fields, primary submit). Logo → `/`; "Create an
  account" → `/onboarding`.

### `/onboarding`
- **State:** `{ step:1, name:'', role:null, goals:[], tools:[] }` — a multi-step
  wizard (name → role (single-select) → goals (multi) → tools (multi) → summary).
- Final step renders "You're in{nameSuffix}." + a generated `summary` line and a
  primary "Go to my dashboard" → `/dashboard`. Preserve step transitions,
  selection toggles, and the summary composition logic exactly.

---

## Assets

All in `design-source/assets/` → copy to `public/assets/` (reference as
`/assets/...`):

- `academy-logo-full.png`, `academy-logo.png` — brand logo (nav/footer/auth)
- `google-meet-logo.png` — Google Meet card + Join Meet button icon
- `hero-9hours.png` — workshop hero (desktop), `hero-16x9.png` — hero (≤820px) &
  dashboard card cover, `hero.png` — alt hero
- `vineet-avatar.png`, `vivin-avatar.png` — trainer avatars (round);
  `vineet.png`, `vivin.png`, `maya.png` — larger portrait variants

Inline SVGs (icons) appear throughout the markup — **keep them inline**, exactly
as written (calendar, clock, arrows, camera-off, chevrons, etc.). Do not swap for
an icon library.

`image-slot.js` is a drag-drop image placeholder web component used only in the
authoring tool — **not needed** in the Next.js build unless a page still
references an `<image-slot>` tag; the finished pages use real `<img>`s, so you can
omit it.

---

## Verification (definition of done)

1. Run the app; each of the 5 routes renders with no console errors.
2. Open the corresponding `design-source/*.dc.html` alongside your route and diff
   visually at desktop **and** the breakpoints in the `@media` blocks (≈560, 680,
   820, 920px). No layout, spacing, type, or color differences.
3. Exercise every interaction listed above (toggle, reveals, countdown, forms,
   PDF modal, profile dropdown + avatar upload, benefits rotation, onboarding
   steps). All behave identically.
4. All internal links route via the map above; the Meet link stays external.

If anything in your build differs from the source, the source wins — change your
build, not the design.
