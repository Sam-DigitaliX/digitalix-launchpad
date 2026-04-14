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
- `fetcher.ts` — Playwright-based: launches headless Chromium, 3 sequential sessions, captures HTML, cookies, network requests, dataLayer
- `cmp-selectors.ts` — 15 CMP definitions with accept/reject selectors + ARIA/text fallbacks (20+ text patterns multi-language)
- `checks/` — 22 sync CheckModule files + `pagespeed.ts` (3 async Core Web Vitals)
- `index.ts` — orchestrator: runs scan with onProgress callback, executes all checks, computes scores
- Total: **25 checks** across 4 categories

**3-session consent protocol**:
1. **Pre-consent** — navigate, no CMP interaction. Capture cookies/requests that fire without consent (violations)
2. **Accept all** — click CMP accept button, wait for tags to fire. Capture full tracking stack
3. **Reject all** — click CMP reject button. Verify no analytics/ad cookies, check Consent Mode v2 Advanced (anonymized pings)

**CMP button detection** — cascade approach:
1. Known selectors (Didomi, Cookiebot, Axeptio, OneTrust, etc. — 15 CMP)
2. Generic fallback: detect `dialog`, `[role="dialog"]`, or fixed overlays containing consent keywords
3. ARIA roles fallback (`button[aria-label*="accept"]`)
4. Multi-language text fallback (20+ patterns: "Accepter et fermer", "Accept cookies", "Continuer sans accepter", etc.)
5. If no CMP after 10s → single session degraded mode

**Categories & weights**: Tracking Setup (30%), Server-Side (25%), Privacy & Consent (30%), Performance (15%)

**API routes** (`api/src/routes/audit.ts`):
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/audit` | Create audit (status=scanning), launch scan in background, return `{ id }` |
| `GET` | `/api/audit/:id/progress` | SSE stream — real-time scan progress events |
| `GET` | `/api/audit/:id` | Retrieve completed audit (respects unlock state) |
| `POST` | `/api/audit/:id/unlock` | Email → upsert contact → send email (with UTM) → return all checks |
| `POST` | `/api/audit/:id/track-click` | Log `audit_email_click` interaction (from email link with `?cid=`) |

**Frontend scan UX**: real-time progress via SSE — each session step displayed live (30s total)

**DB**: `api/migrations/002_audit.sql` — tables `audits` + `audit_checks`
**Rate limit**: 3 audits/IP/hour (in-memory, single concurrent scan)
**Email**: `audit_unlock` template with UTM parameters (utm_source=email, utm_medium=transactional, utm_campaign=audit_unlock) + "Revoir mon rapport" link with `?cid={contactId}` for click tracking
**Dependencies**: playwright (Chromium headless), cheerio (HTML parsing fallback)
**Dockerfile**: node:20-slim (Debian) + `npx playwright install --with-deps chromium` (auto-installs all system deps)

**Server resources**: ~400MB RAM per scan, sequential execution, KVM1 (4GB) viable for 1 scan at a time

## Roadmap

### Chantier A — Playwright scanner (COMPLETE — 2026-04-13)
- [x] A1: Install playwright + Chromium in Docker (node:20-slim, --with-deps)
- [x] A2: Rewrite fetcher.ts with Playwright (3-session consent protocol)
- [x] A2: CMP button detection (15 CMP selectors → generic dialog fallback → ARIA → text cascade)
- [x] A3: SSE progress events (real-time scan feedback to frontend)
- [x] A4: Frontend loader (OrbitLoader spinner + session cards via EventSource)
- [x] A4: UTM parameters in audit_unlock email
- [x] A5: Enrich 10 existing checks with real network/cookie/dataLayer data
- [x] A6: 4 new checks (pre-consent violations, post-reject violations, e-commerce, tag firing order)
- [x] Fix: CMP_WAIT_MS 5s → 10s for slow-loading CMPs
- [x] Fix: fetchDurationMs measures page load, not total scan duration
- [x] Fix: generic CMP detection via dialog/overlay with consent keywords
- [x] Fix: SSE final event timing to trigger frontend transition
- [x] Fix: OrbitLoader spinner restored (4 concentric rings, conic-gradient)

### Known limitations
- Sites with anti-bot (DataDome, Akamai) block headless Chromium → degraded scan results
- INP (Interaction to Next Paint) always "non disponible" — requires user interaction, not measurable in lab/headless mode

### Chantier B — Dashboard leads + system health (in progress)
**Leads intelligence (COMPLETE — 2026-04-13):**
- [x] Admin endpoints: contacts/:id/audits, enriched contacts list, email stats wrappers
- [x] Lead temperature scoring (hot/warm/cold computed in SQL view)
- [x] Timeline: show audits (site, score, link to results) + emails (status badges) per contact
- [x] Multi-audit view: audit count column in contacts table
- [x] Date filter on dashboard (7j / 30j / 90j)
- [x] Filter contacts by source (audit / form / both)
- [x] Email stats row: total sent, open rate (wired existing API endpoints)
- [x] Migration 003: enriched admin_contacts_overview view with DROP+CREATE pattern
- [x] Fix: DROP VIEW IF EXISTS before CREATE VIEW for safe idempotent redeployment

**System health check (COMPLETE — 2026-04-13):**
- [x] `GET /api/admin/health` endpoint — 10 checks across 3 categories (App, Data, Infra)
  - App: Node.js version, uptime, Playwright binary, Chromium version
  - Data: DB connexion (with latency), PostgreSQL version, tables integrity (6 tables)
  - Infra: disk usage (warning >80%, error >95%), memory usage (warning >85%, error >95%)
- [x] Version tracking: Node.js, PostgreSQL, Chromium (in-container only, skipped Coolify/Traefik/SSL/Resend)
- [x] Dashboard UI: status banner (healthy/degraded/unhealthy) with expandable detail panel
  - Cards by category (App, Data, Infra) with glass design
  - Versions section with mono badges
  - Auto-check on page load + refresh every 5 min
  - Manual refresh button
  - Read-only, no action buttons

### Chantier C — Backlog fonctionnel
- [x] CRUD contacts in admin dashboard (edit, delete, notes, tags) (2026-04-13)
- [ ] QualificationForm.tsx:202 — resource download link (waiting for resource)
- [ ] Setup email samuel@probr.io — migré vers ~/workspace/Probr.io
- [ ] Decommission Supabase project after 2-week monitoring period
- [ ] Cross-domain tracking detection (nouveau check audit)
- [ ] Security headers analysis (nouveau check audit)
- [ ] Redirect chain analysis (nouveau check audit)

### Chantier D — Migrations majeures
**Batch 1 — faible risque :**
- [ ] lucide-react 0.462 → 1.x (renaming d'icônes)
- [ ] zod 3.x → 4.x (API changes mineures)
- [ ] typescript 5.x → 6.x (nouvelles règles strictes)

**Batch 2 — moyen risque :**
- [ ] vite 5.x → 8.x (breaking changes config)
- [ ] recharts 2.x → 3.x

**Batch 3 — haut risque (planifier ensemble) :**
- [ ] tailwindcss 3.x → 4.x (refonte CSS-first)
- [ ] react 18 → 19 + react-dom (attendre support shadcn/ui)
- [ ] react-router-dom 6 → 7 (refonte API loaders/actions)

### Retours utilisateurs (2026-04-14)
**Haute priorité :**
- [x] Accents manquants dans les descriptions des checks — corrigé dans 22 fichiers
- [x] Loader: Block progress loader (20 blocs gradient + pulse) dans `AuditResults.tsx:459`
- [x] Contraste texte/fond — muted-foreground 55% → 65%
- [x] Mention e-commerce sur sites vitrines — adapté dans datalayer.ts
- [ ] Badge "critical" confus sur check pass — masquer le badge impact quand status=pass, ou renommer en "importance"
- [ ] Ajouter une phrase d'explication business sous chaque check ("pourquoi c'est utile pour moi ?")

### Nice to have
- [ ] Audit results: restructurer l'UI par sections (Privacy & RGPD, Tracking, Performance, Server-Side)
- [ ] Audit results: toggle technique par check (raw_data en bullet points + annotation)
- [ ] Audit results: exposer raw_data dans GET /api/audit/:id
- [ ] INP: simuler une interaction (clic) dans Playwright pour mesurer INP en headless

### Monitoring
- Weekly audit: GitHub Action (`.github/workflows/weekly-audit.yml`) — dimanche 20h Paris
- Telegram bot: @digitalix_monitor_bot (chat ID: 6155735961)
- GitHub Secrets: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `COOLIFY_API_TOKEN`, `HOSTINGER_API_TOKEN`
- Checks: API health, Coolify/Traefik versions, VPS state, npm outdated (key packages), GitHub issues
- Verdict: OK / PAS URGENT / ACTION REQUISE

### Done
- [x] Supabase → PostgreSQL migration (2026-04-10)
- [x] Deploy API on Coolify + configure DNS (api.digitalix.xyz)
- [x] Run schema migration on PostgreSQL + insert admin key
- [x] Set env vars on Vercel: VITE_API_URL
- [x] Audit Tracking V1: static fetch scanner, 21 checks, deployed (2026-04-13)
- [x] Audit Tracking V2: Playwright scanner, 25 checks, 3-session consent protocol, SSE progress, deployed (2026-04-13)
- [x] Audit Tracking V2 bugfixes: CMP detection, page load timing, SSE transition, OrbitLoader (2026-04-13)
- [x] Chantier B: Leads intelligence — temperature, audits/emails timeline, filters, email stats (2026-04-13)
- [x] Chantier B: System health check — 10 checks, dashboard banner, auto-refresh 5min (2026-04-13)
- [x] Weekly audit GitHub Action + Telegram bot monitoring (2026-04-13)
- [x] Chantier C: CRUD contacts — edit, delete, notes, tags with suggested labels (2026-04-13)
- [x] Fix: CORS PUT/DELETE methods, tag route ordering, categories JSON parsing (2026-04-13)
- [x] PageSpeed API key integration — LCP/CLS now working (timeout 15s → 30s) (2026-04-14)
- [x] WP Rocket lazy-load support — dispatch trigger events (mousemove, touchstart, wheel, keydown) in CMP detection + scan sessions (2026-04-14)
- [x] Scanner timing improvements — CMP wait 2s → 5s, post-consent 4s → 6s, networkidle 3s → 5s (2026-04-14)
- [x] Auto-tags: "prospect" on new contact, "prioritaire" when qualified (2026-04-14)
- [x] Dashboard: tags visible without expand, contacts toggle (5 default), refresh button (2026-04-14)
- [x] npm minor/patch dependencies updated (2026-04-14)

## Important Notes
- **Do NOT use Supabase SDK** — all data access goes through the Hono API
- **Do NOT import from `src/integrations/supabase/`** — directory has been deleted
- The API backend code lives in the `api/` folder of this repo
- Auto-deploy is enabled: pushing to `main` triggers Coolify build + deploy
- The Dockerfile uses **Node.js 20 Slim (Debian)** with Chromium for Playwright (NOT Alpine, NOT Bun)
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
