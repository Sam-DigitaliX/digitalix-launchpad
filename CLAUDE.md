# DigitaliX Launchpad — Project Context

## Overview
Marketing site + lead qualification platform for DigitaliX (server-side tracking consulting).
Live at: https://digitalix.fr (deployed via Vercel)

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui (Vercel)
- **Backend**: Hono API (`api/`) + PostgreSQL on Coolify — replaces Supabase
- **Email**: Resend (domain: digitalix.xyz, from: noreply@digitalix.xyz)
- **Tracking**: GTM (GTM-PD3X686F) with virtual_page_view for SPA tracking
- **Analytics**: Vercel Speed Insights

## Architecture

### Routes
| Path | Page | Notes |
|------|------|-------|
| `/` | Landing | Hero, services, case studies carousel, CTA |
| `/consultants` | Qualification Form | Multi-step form with lead scoring |
| `/contact` | Contact | Direct contact page |
| `/services` | Services Hub | All services overview |
| `/services/:slug` | Service Detail | Individual service pages |
| `/audit-tracking` | Audit Checker | URL input — **uses mock data, not yet functional** |
| `/audit-tracking/resultats/:id` | Audit Results | Email gate + results — **mock data** |
| `/a-propos` | About | 6-section about page (not in nav) |
| `/cas-clients` | Case Studies | 3 fake case studies (not in nav) |
| `/cas-clients/:slug` | Case Study Detail | Individual case study |
| `/brand` | Brand Guide | Design system reference |
| `/admin` | Admin Dashboard | Key-based auth via sessionStorage |

### Backend API (`api/`)
- **Base URL**: `https://api.digitalix.fr` (env: `VITE_API_URL`)
- **Framework**: Hono (TypeScript, Node.js)
- **Database**: PostgreSQL (postgres.js driver)
- **Migration**: `api/migrations/001_schema.sql`
- **Dockerfile**: `api/Dockerfile`
- Tables: `contacts`, `interactions`, `email_logs`, `admin_config`
- API routes:
  - `POST /contacts/upsert` — upsert contact + log interaction
  - `POST /email/send` — send confirmation/audit emails via Resend
  - `GET /admin/stats` — dashboard stats (x-admin-key header)
  - `GET /admin/contacts` — list all contacts
  - `GET /admin/contacts/:id/timeline` — contact interaction history
  - `GET /admin/email-stats` — email analytics
  - `GET /admin/contacts/:id/emails` — contact email history

### Frontend API Client
- `src/lib/api.ts` — typed fetch wrapper, replaces Supabase client
- Env var: `VITE_API_URL` (defaults to `https://api.digitalix.fr`)

### Email System
- Templates in `api/src/lib/email-templates.ts`
- Types: `confirmation_qualified`, `confirmation_unqualified`, `audit_unlock`
- All emails logged to `email_logs` + `interactions` tables

### Lead Scoring
- Defined in `src/components/qualification/types.ts`
- Threshold: score >= 30 && no disqualifying factors
- Factors: profile type, pain points, situation, budget, timeline, priority

## Design System
- Evervault-inspired dark glassmorphism (see global CLAUDE.md)
- Key CSS classes: `ev-card` (animated border), `ev-card-static` (hover glow), `ev-input`, `ev-btn-primary`
- Design tokens in `src/index.css` and `tailwind.config.ts`
- Always use tokens: `text-foreground`, `text-muted-foreground`, `border-glass-border`, `bg-glass`, `font-display`, `font-mono`

## Known TODOs
- [x] **Supabase → PostgreSQL migration** — code done, needs deployment on Coolify
- [ ] Deploy API on Coolify + configure DNS (api.digitalix.fr)
- [ ] Run `api/migrations/001_schema.sql` on PostgreSQL + insert admin key
- [ ] Set env vars on Vercel: `VITE_API_URL=https://api.digitalix.fr`
- [ ] Audit Tracking: replace mock data with real site scanning
- [ ] QualificationForm.tsx:202 — resource download link (waiting for resource)
- [ ] Setup email samuel@probr.io (Resend + Cloudflare Email Routing)

## Commands
```bash
# Frontend
npm run dev        # Dev server on :8080
npm run build      # Production build
npm run test       # Vitest
npm run lint       # ESLint
npm run format     # Prettier

# API (from api/ directory)
npm run dev        # Dev server on :3000 (tsx watch)
npm run build      # Compile TypeScript
npm run start      # Production (node dist/index.js)
npm run migrate    # Run database migrations
```
