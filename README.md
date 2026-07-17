# RPS Community

Academy — live design workshops, a community, and assessments from senior designers.

## Repository layout

```
.
├── frontend/                       # Next.js app — the live product (see frontend/README.md)
│   ├── app/                        # Routes: /, /signin, /onboarding, /dashboard, /reset-password
│   ├── components/ · lib/ · public/
│   ├── supabase/                   # DB schema.sql + security.sql (run in Supabase)
│   ├── BACKEND_SETUP.md · SECURITY.md
│   └── package.json
│
└── design-mockups/                 # Original static design mockups (reference only)
    ├── Opencanvas Workshop.dc.html
    ├── Sign In.dc.html · Onboarding.dc.html · Dashboard.dc.html
    ├── support.js                  # The "DC" runtime the mockups ran on
    ├── image-slot.js               # Fillable image-slot web component
    └── assets/                     # Source images
```

`frontend/` is the active project. `design-mockups/` holds the original static
`.dc.html` designs the app was ported from — kept for visual reference, not part
of the build.

## Run the frontend

```bash
cd frontend
npm install
cp .env.example .env.local          # then fill in your Supabase keys
npm run dev                         # http://localhost:3000
```

Backend setup (Supabase): [frontend/BACKEND_SETUP.md](frontend/BACKEND_SETUP.md)
· Security notes: [frontend/SECURITY.md](frontend/SECURITY.md)
· App details: [frontend/README.md](frontend/README.md)
