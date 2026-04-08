# DigitaliX Launchpad — Project Context

## Overview
Marketing site + lead qualification platform for DigitaliX (server-side tracking consulting).
Live at: https://digitalix.fr (deployed via Vercel)

## Tech Stack
- React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Edge Functions + RLS) — **migration to direct PostgreSQL planned**
- Resend for transactional emails (domain: digitalix.xyz, from: noreply@digitalix.xyz)
- GTM (GTM-PD3X686F) with virtual_page_view for SPA tracking
- Vercel Speed Insights

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

### Database (Supabase)
- `contacts` — leads with progressive enrichment (email as unique key)
- `interactions` — timeline of all contact touchpoints
- `email_logs` — every email sent via Resend
- `admin_config` — admin key storage (workaround for Supabase Cloud permission limits)
- Key RPCs: `upsert_contact_with_interaction`, `log_email`, `admin_get_stats`, `admin_get_contacts`
- Migrations: `001_contacts_interactions.sql`, `002_admin_dashboard.sql`, `003_email_system.sql`

### Email System
- Edge Function: `supabase/functions/send-confirmation/index.ts`
- Templates: `confirmation_qualified`, `confirmation_unqualified`, `audit_unlock`
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
- [ ] **Supabase → PostgreSQL migration** (main priority)
- [ ] Audit Tracking: replace mock data with real site scanning
- [ ] QualificationForm.tsx:202 — resource download link (waiting for resource)
- [ ] Setup email samuel@probr.io (Resend + Cloudflare Email Routing)

## Commands
```bash
npm run dev        # Dev server on :8080
npm run build      # Production build
npm run test       # Vitest
npm run lint       # ESLint
npm run format     # Prettier
```
