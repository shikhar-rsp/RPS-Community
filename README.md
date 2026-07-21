# RPS Community

Academy — live design workshops, a community, and assessments from senior designers.

## Repository layout

```
.
└── frontend/                       # Next.js app — the live product (see frontend/README.md)
    ├── app/                        # Routes: /, /signin, /onboarding, /dashboard, /workshop, /reset-password
    ├── lib/                        # dc.js runtime + lib/logic/* page logic + supabase clients
    ├── public/                     # Static assets
    ├── supabase/                   # DB schema.sql + security.sql (run in Supabase)
    ├── BACKEND_SETUP.md · SECURITY.md
    └── package.json
```

`frontend/` is the whole project. (The original static `.dc.html` design mockups
the app was ported from live in git history if you ever need them back.)

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
