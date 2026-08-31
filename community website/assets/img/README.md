# Images

Every image on the site is currently a placeholder illustration. Drop a real file
into the directory below and point the matching key in
`assets/js/seed.js` → `config` at it. Nothing else changes: the frame keeps its
size, radius and crop, and the little "Placeholder — …" badge disappears on its
own once a real file is in place.

Paths are relative to the site root, so they always start `assets/img/…`.

| Directory | What goes here | Where it shows | Set in `seed.js` |
|---|---|---|---|
| `assets/img/brand/` | **The logo.** `logo.svg` (plus an optional `logo-dark.svg` for dark mode) | Nav and footer, replacing the "RPS Cohorts" wordmark | `config.logoUrl`, `config.logoDarkUrl` |
| `assets/img/about/` | **The team group photo.** `team-group-photo.jpg` | The **About us** section on the homepage | `config.images.team` |
| `assets/img/sessions/` | Session photography — `studio.jpg` | The WhatsApp CTA panel | `config.images.studio` |
| `assets/img/workshops/` | One banner per workshop, named for its slug — `design-handoff-that-doesnt-break-in-dev.jpg` | Workshop cards and the detail-page hero; also the OG share image | `bannerUrl` on that workshop |

The **homepage hero** doesn't take a photo — it's a built-in animated mockup of
a live Google Meet session (`.meet-mock` in `assets/js/ui.js`), not a
placeholder frame. There's nothing to drop in for it.

## The two you asked about

```
assets/img/about/team-group-photo.jpg     ← About us team photo
assets/img/brand/logo.svg                 ← logo (add logo-dark.svg for dark mode)
```

Then in `assets/js/seed.js`:

```js
logoUrl: 'assets/img/brand/logo.svg',
logoDarkUrl: 'assets/img/brand/logo-dark.svg',   // optional
images: {
  team: 'assets/img/about/team-group-photo.jpg',
  ...
}
```

## Specs

- **Logo** — SVG preferred. It renders at 30px tall (26px on phones) and is
  free to be any width. If it's a PNG, supply it at 3× (90px tall) with a
  transparent background. A dark-mode variant is only needed if the logo has
  dark ink in it; a single-colour orange or white mark works in both themes.
- **Team photo** — landscape, at least 1600 × 900. It's cropped to fill a frame
  that is roughly 2.5:1 on desktop and 1.6:1 on a phone, so keep faces away from
  the extreme top and bottom.
- **Session photos** (`assets/img/sessions/studio.jpg`) — landscape, at least 1600 × 1000.
- **Workshop banners** — landscape, at least 1400 × 900. These double as the
  LinkedIn/OG share image, so they should read at thumbnail size.
- Export JPEG at ~80% quality, or WebP. Everything is lazy-loaded except the
  hero.
- Alt text lives in `config.imageAlt` (per key) or in a `data-alt` attribute on
  the frame. Workshop banners fall back to the workshop title.
