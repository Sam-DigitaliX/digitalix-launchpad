# DigitaliX Launchpad

Marketing site + lead qualification platform for [DigitaliX](https://digitalix.xyz) — server-side tracking consulting.

## Stack

| Layer | Technology | Platform |
|-------|-----------|----------|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui | Vercel |
| Backend API | Hono, @hono/node-server, Node.js 20 | Coolify (Docker) |
| Database | PostgreSQL 18 | Coolify (Docker) |
| Email | Resend (noreply@digitalix.xyz) | API call |
| Tracking | GTM (GTM-PD3X686F) | SPA virtual pageviews |

## Project structure

```
digitalix-launchpad/
├── src/                    # React frontend
│   ├── components/         # UI components (qualification form, landing, etc.)
│   ├── pages/              # Route pages
│   ├── lib/                # API client, utilities
│   ├── hooks/              # Custom React hooks
│   ├── data/               # Static data (case studies, services)
│   └── types/              # TypeScript types
├── api/                    # Hono backend API
│   ├── src/
│   │   ├── index.ts        # Entry point
│   │   ├── db.ts           # PostgreSQL connection
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/      # Admin auth
│   │   └── lib/            # Email templates, Resend client
│   ├── migrations/         # SQL schema
│   └── Dockerfile          # Node.js 20 Alpine
├── docs/                   # Migration plan, infra briefs
└── .claude/commands/       # Claude Code custom skills
```

## Getting started

**Prerequisites**: Node.js 20+, npm

### Frontend

```bash
npm install
npm run dev          # http://localhost:8080
```

### Backend API

```bash
cd api
npm install
cp .env.example .env # edit with your credentials
npm run migrate      # run schema on PostgreSQL
npm run dev          # http://localhost:3000
```

### Environment variables

**Frontend** (`.env` at root):
```
VITE_API_URL=http://localhost:3000    # or https://api.digitalix.xyz
```

**API** (`api/.env`):
```
DATABASE_URL=postgresql://user:pass@localhost:5432/digitalix
RESEND_API_KEY=re_xxxxx
ADMIN_CORS_ORIGINS=https://digitalix.xyz,http://localhost:8080
PORT=3000
```

## API routes

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/health` | - | Health check |
| POST | `/api/contacts` | - | Upsert contact + log interaction |
| POST | `/api/email/send-confirmation` | - | Send email via Resend |
| GET | `/api/admin/stats` | Bearer | Dashboard stats |
| GET | `/api/admin/contacts` | Bearer | Contacts list |
| GET | `/api/admin/contacts/:id/timeline` | Bearer | Contact interactions |
| GET | `/api/admin/email-stats` | Bearer | Email analytics |
| GET | `/api/admin/contacts/:id/emails` | Bearer | Contact email history |

Admin routes require `Authorization: Bearer <admin-key>` header.

## Scripts

### Frontend (root)

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on :8080 |
| `npm run build` | Production build |
| `npm run test` | Vitest |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

### API (`api/`)

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server on :3000 (tsx watch) |
| `npm run build` | Compile TypeScript |
| `npm run start` | Production server |
| `npm run migrate` | Run database migrations |

## Deployment

- **Frontend**: auto-deploys to Vercel on push to `main`
- **API**: auto-deploys to Coolify on push to `main` (Dockerfile in `api/`)
- **Database**: PostgreSQL 18 on Coolify, internal network only

## Design system

Evervault-inspired dark glassmorphism theme. See `/brand` route for the full reference.

Key CSS classes: `ev-card`, `ev-card-static`, `ev-input`, `ev-btn-primary`

Fonts: Inter (body), Sora (display), JetBrains Mono (code/data)

## License

Private repository. All rights reserved.
