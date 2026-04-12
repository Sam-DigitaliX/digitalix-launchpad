# DigitaliX Launchpad — Project Context

## Overview
Marketing site + lead qualification platform for DigitaliX (server-side tracking consulting).
Live at: https://digitalix.xyz (deployed via Vercel)

## Tech Stack
- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui (Vercel)
- **Backend**: Hono API (`api/`) + @hono/node-server (Coolify, Docker)
- **Database**: PostgreSQL 18 (Coolify, Docker)
- **Email**: Resend (domain: digitalix.xyz, from: noreply@digitalix.xyz)
- **Tracking**: GTM (GTM-PD3X686F) with virtual_page_view for SPA tracking
- **Analytics**: Vercel Speed Insights

## Architecture

```
Frontend (Vercel)          API (Coolify)              Database (Coolify)
digitalix.xyz        -->   api.digitalix.xyz    -->   PostgreSQL 18
React 18 + Vite            Hono + Node.js 20          digitalix-db
                                  |
                                  v
                           Resend API (email)
```

### Frontend Routes
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
- **Base URL**: `https://api.digitalix.xyz` (env: `VITE_API_URL`)
- **Framework**: Hono + @hono/node-server (Node.js 20 Alpine)
- **Database**: PostgreSQL 18 via `postgres` (porsager/postgres) driver
- **Migration**: `api/migrations/001_schema.sql`
- **Dockerfile**: `api/Dockerfile`
- **Coolify**: auto-deploy on push to main (base_dir: `/api`)

#### API Routes
| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/health` | Public | Health check |
| `POST` | `/api/contacts` | Public | Upsert contact + log interaction |
| `POST` | `/api/email/send-confirmation` | Public | Send email via Resend + log |
| `GET` | `/api/admin/stats` | Bearer | Dashboard stats |
| `GET` | `/api/admin/contacts` | Bearer | All contacts with interaction summary |
| `GET` | `/api/admin/contacts/:id/timeline` | Bearer | Interaction timeline for one contact |
| `GET` | `/api/admin/email-stats` | Bearer | Email delivery stats |
| `GET` | `/api/admin/contacts/:id/emails` | Bearer | Email logs for one contact |

Admin routes require `Authorization: Bearer <admin-key>` header.

#### Database Tables
| Table | Description |
|-------|-------------|
| `contacts` | Leads with progressive enrichment (email = unique key) |
| `interactions` | Timeline of all contact touchpoints |
| `email_logs` | Every email sent via Resend |
| `admin_config` | Admin password storage (single row) |
| `admin_contacts_overview` | View: contacts + aggregated interaction data |

### Frontend API Client
- `src/lib/api.ts` — typed fetch wrapper
- Env var: `VITE_API_URL` (defaults to `https://api.digitalix.xyz`)

### Email System
- Templates in `api/src/lib/email-templates.ts`
- Types: `confirmation_qualified`, `confirmation_unqualified`, `audit_unlock`
- All emails logged to `email_logs` + `interactions` tables

### Lead Scoring
- Defined in `src/components/qualification/types.ts`
- Threshold: score >= 30 && no disqualifying factors
- Factors: profile type, pain points, situation, budget, timeline, priority

## Infrastructure

### VPS (Hostinger KVM1)
- IP: `148.230.108.196`
- OS: Ubuntu 24.04 LTS (template n8n queue mode)
- Resources: 1 vCPU, 4 GB RAM, 50 GB disk
- Coolify v4 (Traefik 3.6.9, Let's Encrypt SSL)

### Coolify — Applications & Services
| Name | Type | Status | URL | Source |
|------|------|--------|-----|--------|
| `digitalix-api` | Application (Dockerfile) | running | `https://api.digitalix.xyz` | `Sam-DigitaliX/digitalix-launchpad` (base_dir `/api`) |
| `Probr.io` | Application (docker-compose) | running:healthy | — | `Sam-DigitaliX/Probr.io` |
| `bookstack-probr.io` | Service (BookStack + MariaDB) | running:healthy | `https://docs.probr.io` | — |

### DNS (Cloudflare)
- `digitalix.xyz` / `www.digitalix.xyz` → Vercel
- `api.digitalix.xyz` → `148.230.108.196` (DNS only, no proxy)
- `docs.probr.io` → `148.230.108.196` (BookStack via Coolify)

### Environment Variables
**Frontend (Vercel)**:
- `VITE_API_URL=https://api.digitalix.xyz`

**API Backend (Coolify)**:
- `DATABASE_URL=postgresql://...`
- `RESEND_API_KEY=re_...`
- `ADMIN_CORS_ORIGINS=https://digitalix.xyz,http://localhost:8080` (www variants auto-added by backend)
- `PORT=3000`

## Design System
- Evervault-inspired dark glassmorphism (see global CLAUDE.md)
- Key CSS classes: `ev-card` (animated border), `ev-card-static` (hover glow), `ev-input`, `ev-btn-primary`
- Design tokens in `src/index.css` and `tailwind.config.ts`
- Always use tokens: `text-foreground`, `text-muted-foreground`, `border-glass-border`, `bg-glass`, `font-display`, `font-mono`

## Feature Status

### Live
| Feature | Route | Notes |
|---------|-------|-------|
| Landing page | `/` | Hero, services, case studies carousel, CTA |
| Services hub + detail | `/services`, `/services/:slug` | All service pages |
| Qualification form | `/consultants` | Multi-step with lead scoring (threshold ≥30) |
| Contact | `/contact` | Direct contact form |
| About | `/a-propos` | 6-section (not in nav) |
| Case studies | `/cas-clients`, `/cas-clients/:slug` | 3 fake case studies (not in nav) |
| Brand guide | `/brand` | Design system reference |
| Admin dashboard | `/admin` | Key-based auth, stats, contacts, timeline, emails |
| Email system | — | Resend: confirmation_qualified, confirmation_unqualified, audit_unlock |
| GTM tracking | — | GTM-PD3X686F with virtual_page_view for SPA |

### Pending
| Feature | Route | Status |
|---------|-------|--------|
| Audit Tracking | `/audit-tracking` | Complete — real scan engine, 21 checks, not yet deployed |
| Audit Results | `/audit-tracking/resultats/:id` | Complete — email gate, error/rate-limit states, email click tracking |
| Resource download | `/consultants` | QualificationForm.tsx:202 — waiting for resource file |

## Audit Tracking — Architecture

**Approach**: Playwright headless (Chromium) on the VPS, 3-session consent protocol, integrated into the Hono API.

**Scanner** (`api/src/lib/scanner/`):
- `fetcher.ts` — Playwright-based: launches headless Chromium, captures HTML, cookies, network requests, console
- `checks/` — check modules analyzing real browser data (network requests, cookies, dataLayer, consent state)
- `index.ts` — orchestrator: runs 3 sessions sequentially, executes checks, computes scores
- `pagespeed.ts` — Core Web Vitals from real browser metrics (LCP, CLS, INP)

**3-session consent protocol**:
1. **Pre-consent** — navigate, no CMP interaction. Capture cookies/requests that fire without consent (violations)
2. **Accept all** — click CMP accept button, wait for tags to fire. Capture full tracking stack
3. **Reject all** — click CMP reject button. Verify no analytics/ad cookies, check Consent Mode v2 Advanced (anonymized pings)

**CMP button detection** — cascade approach:
1. Known selectors (Didomi, Cookiebot, Axeptio, OneTrust, etc. — 15+ CMP)
2. ARIA roles fallback (`button[aria-label*="accept"]`)
3. Multi-language text fallback ("Accepter", "Accept", "Akzeptieren", etc.)
4. If no CMP after 5s → single session degraded mode

**Categories & weights**: Tracking Setup (30%), Server-Side (25%), Privacy & Consent (30%), Performance (15%)

**API routes** (`api/src/routes/audit.ts`):
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/audit` | Submit URL → scan (SSE progress events) → store → return results |
| `GET` | `/api/audit/:id` | Retrieve audit (respects unlock state) |
| `POST` | `/api/audit/:id/unlock` | Email → upsert contact → send email → return all checks |
| `POST` | `/api/audit/:id/track-click` | Log `audit_email_click` interaction (from email link with `?cid=`) |

**Frontend scan UX**: real-time progress via SSE — each session step displayed live (30s total)

**DB**: `api/migrations/002_audit.sql` — tables `audits` + `audit_checks`
**Rate limit**: 3 audits/IP/hour (in-memory, single concurrent scan)
**Email**: `audit_unlock` template includes "Revoir mon rapport" link with `?cid={contactId}` for click tracking
**Dependencies**: playwright (Chromium headless), cheerio (HTML parsing fallback)

**Server resources**: ~400MB RAM per scan, sequential execution, KVM1 (4GB) viable for 1 scan at a time

## Roadmap

### Chantier A — Playwright scanner (in progress)
- [ ] Install playwright + Chromium in Docker
- [ ] Rewrite fetcher.ts with Playwright (3-session consent protocol)
- [ ] CMP button detection (selectors → ARIA → text cascade)
- [ ] SSE progress events (real-time scan feedback to frontend)
- [ ] Adapt frontend loader (live session steps, ~30s)
- [ ] Enrich checks with real network/cookie data
- [ ] New checks: e-commerce detection, dataLayer inspect, GA4 collect analysis, tag firing order

### Chantier B — Dashboard leads (planned)
- [ ] Admin endpoints: contacts/:id/audits, enriched contacts list
- [ ] Lead temperature scoring (audit + form + resource = hot)
- [ ] Timeline: show audits (site, score, link to results) per contact
- [ ] Multi-audit view: number of sites audited, links to results
- [ ] Date filter on dashboard
- [ ] Filter contacts by source (audit / form / both)

### Chantier C — Backlog
- [ ] QualificationForm.tsx:202 — resource download link (waiting for resource)
- [ ] Setup email samuel@probr.io (Resend + Cloudflare Email Routing)
- [ ] Decommission Supabase project after 2-week monitoring period
- [ ] Cross-domain tracking detection
- [ ] Security headers analysis
- [ ] Redirect chain analysis

### Done
- [x] Supabase → PostgreSQL migration (2026-04-10)
- [x] Deploy API on Coolify + configure DNS (api.digitalix.xyz)
- [x] Run schema migration on PostgreSQL + insert admin key
- [x] Set env vars on Vercel: VITE_API_URL
- [x] Audit Tracking V1: static fetch scanner, 21 checks, deployed (2026-04-13)

## Important Notes
- **Do NOT use Supabase SDK** — all data access goes through the Hono API
- **Do NOT import from `src/integrations/supabase/`** — directory has been deleted
- The API backend code lives in the `api/` folder of this repo
- Auto-deploy is enabled: pushing to `main` triggers Coolify build + deploy
- The Dockerfile uses **Node.js 20 Alpine** (NOT Bun)
- For infra changes (Coolify, VPS, DNS), use a session with MCP access to Coolify/Hostinger/Vercel

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
