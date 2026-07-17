# RPS Community — Frontend

The Academy web frontend, built with [Next.js](https://nextjs.org/) (App Router) and React 18.

This is a port of the original static `.dc.html` design mockups (which ran on a custom "DC" runtime) into a real Next.js application. The CSS, UI, and interactive behaviour are preserved 1:1 — only the rendering layer changed.

## Getting started

```bash
cd frontend
npm install
npm run dev
```

Then open <http://localhost:3000>.

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server (hot reload) at `localhost:3000` |
| `npm run build` | Create an optimized production build |
| `npm run start` | Serve the production build (run `build` first) |
| `npm run lint` | Run Next.js / ESLint checks |

## Routes

| Route | Page | Source mockup |
|---|---|---|
| `/` | Workshop landing (marketing) | `Opencanvas Workshop.dc.html` |
| `/signin` | Sign in | `Sign In.dc.html` |
| `/onboarding` | Onboarding wizard (4 steps) | `Onboarding.dc.html` |
| `/dashboard` | Dashboard (assignment submit + assessment) | `Dashboard.dc.html` |

Navigation between pages mirrors the original flow: Sign In → Onboarding → Dashboard, with the logo / nav linking back to the Workshop landing.

## Project structure

```
frontend/
├── app/
│   ├── layout.jsx           # Root layout (loads globals.css, sets <html>/<body>)
│   ├── globals.css          # Shared reset, button system, fonts, per-page scoped styles
│   ├── page.jsx             # "/"  — Workshop landing
│   ├── workshop-markup.js   # Verbatim Workshop HTML (rendered as-is)
│   ├── signin/page.jsx      # "/signin"
│   ├── onboarding/page.jsx  # "/onboarding"
│   └── dashboard/page.jsx   # "/dashboard"
├── components/
│   ├── RawPage.jsx          # Renders verbatim HTML + re-implements reveal & hover behaviour
│   └── Box.jsx              # Element with a hover-only extra style set (replaces `style-hover`)
├── lib/
│   └── css.js               # Parses an inline-CSS string into a React style object
├── public/
│   └── assets/              # Images (logos, avatars, hero, etc.)
├── next.config.js
├── jsconfig.json            # Enables the "@/..." import alias
└── package.json
```

## How the original mockups were ported

The source files ran on a bespoke "DC" runtime (`support.js`) that rendered HTML templates through React with `{{ }}` interpolation and `DCLogic` state classes. That runtime was removed and its behaviour reproduced with native React:

- **Inline styles** — the original CSS strings are kept verbatim and converted to React style objects at runtime via [`lib/css.js`](lib/css.js), preserving the CSS-custom-property theming (`--bg`, `--surface`, `--accent`, …).
- **Shared styling** — the identical `.btn` button system, Geist font, resets, keyframes and media queries live in [`app/globals.css`](app/globals.css). Rules that differed per page (link colors, input focus) are scoped under wrapper classes: `.pg-signin`, `.pg-onboard`, `.pg-dash`, `.pg-workshop`.
- **State & logic** — the `DCLogic` classes were ported to `useState`:
  - **Onboarding** — 4-step wizard with per-step validation, animated progress bars, role/goal/tool selection, and a generated summary.
  - **Dashboard** — assignment submit form with a simulated ~1.1s "submitting" → "submitted" transition and reset.
  - **Sign In** — Google / email handlers that navigate to onboarding.
- **Workshop landing** — rendered from its exact original markup ([`app/workshop-markup.js`](app/workshop-markup.js)) through [`components/RawPage.jsx`](components/RawPage.jsx), which re-implements the two runtime behaviours the markup relied on: `[data-reveal]` scroll-in animations (`IntersectionObserver`) and `[style-hover]` hover styling.
- **Hover effects** on the JSX pages use [`components/Box.jsx`](components/Box.jsx).

### Intentionally dropped

- `image-slot.js` and the dot-canvas animation from the Workshop source were **dead code** — no `<image-slot>` or `<canvas>` elements existed in any markup.
- The Workshop theme-toggle button was `display:none` in the original and remains hidden (the app renders in the dark theme).

## Notes

- Pages that hold state or use effects are Client Components (`"use client"`); the Workshop landing markup is static.
- The Geist font is loaded from Google Fonts via `@import` in `globals.css`, matching the original.
