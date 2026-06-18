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
- **Consent**: Didomi CMP (SDK `c9077260-74ef-4f4a-94f0-80cae9cfe5c3`, notice `GrdXFGiG`), loaded before GTM in `index.html`. Google Consent Mode v2 (advanced) managed **entirely in the Didomi console** — no hardcoded `gtag('consent','default')` (would conflict). Re-open notice via footer "Consent choices" → `window.Didomi.preferences.show()`
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
| `/mentions-legales` | Mentions légales | EI Samuel Marangé, hébergeurs, PI |
| `/politique-de-confidentialite` | Politique de confidentialité | RGPD, sous-traitants, rétention 3 ans |

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
- INP (Interaction to Next Paint) non mesurable en lab → remplacé par TBT (Total Blocking Time), proxy lab officiel de Google

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
- [x] Supabase code cleanup — 7 commentaires "Replaces: supabase.x" retirés (2026-04-20)
- [x] Redirect chain analysis check — ajouté (2026-04-20)
- [x] Google Ads + Microsoft UET (Bing Ads) tracker checks ajoutés — 28 checks au total (2026-04-21)
- [x] Audit precision overhaul — Enhanced Conversions / Meta CAPI / cookies first-party / dataLayer ecom réécrits pour être **honnêtes** (voir Done 2026-04-21) (2026-04-21)
- [x] Server-managed cookies detection (FPID/FPLC/FPGCL*) + sGTM maturity levels + GTM masqué par custom loader + Sirdata/Consent Mode v2 via TCF API (2026-04-21)
- [ ] QualificationForm.tsx:202 — resource download link (waiting for resource)
- [ ] Setup email samuel@probr.io — migré vers ~/workspace/Probr.io
- [ ] Supabase : supprimer le projet côté dashboard supabase.com — action manuelle infra restante
- [ ] Cross-domain tracking detection (nouveau check audit — spec définie : sous-domaines racine + whitelist payment/booking + croisement config linker)
- [x] Frontend : visualisation `maturityLevel` sGTM (stepper 0→1→2) (2026-04-21)
- [ ] Security headers analysis — **retiré du backlog** (hors scope tracking, dilue le positionnement server-side)

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

### Retours utilisateurs (2026-04-14) — TOUS TRAITÉS
- [x] Accents manquants dans les descriptions des checks — corrigé dans 22 fichiers + SSE labels
- [x] Loader: Block progress loader (composant réutilisable `BlockProgressLoader`)
- [x] Contraste texte/fond — muted-foreground 55% → 65%
- [x] Mention e-commerce sur sites vitrines — adapté dans datalayer.ts
- [x] Badge "critical" confus → renommé Essentiel/Important/Utile/Mineur, masqué quand pass
- [x] Explications business sous chaque check → businessNote dans 20 fichiers de checks

### Chantier E — Refonte Audit Results (COMPLETE — 2026-04-14)
- [x] Phase 1: Backend — exposer raw_data + business_note dans API, migration 005
- [x] Phase 2: Frontend types — rawData + businessNote dans AuditCheck
- [x] Phase 3: Badges impact renommés + businessNote affiché en amber
- [x] Phase 4: TrackersTable — tableau structuré (Tracker, Plateforme, ID, Méthode, Statut)
- [x] Phase 5: PrivacySection — cards CMP, Consent Mode, violations, cookies tiers/first-party
- [x] Phase 6: RecommendationsSection — cards numérotées triées par impact + CTA → /contact
- [x] Phase 7: PerformanceSection — Core Web Vitals jauges + scripts count + loading strategy
- [x] Email gate: tous les checks floutés (blur 3px), overlay gradient transparent→opaque
- [x] SSE timeout 60s → 180s pour scans longs

### Bugs à investiguer
- [ ] **Consent Mode v2 — extraction des 4 params obligatoires incomplète sur certains setups server-side** : sur `https://mprez.fr` (2026-04-21), la CMP Sirdata est bien identifiée via TCF API mais les 4 paramètres obligatoires (`ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`) ne sont pas capturés. Hypothèses à tester : (a) `gtag('consent', 'default', ...)` pousse dans un dataLayer renommé par le custom loader, (b) consent default fire après la capture dataLayer, (c) params défaut envoyés directement via sGTM sans passer par `window.dataLayer`. À re-scanner sur d'autres setups sGTM similaires pour confirmer le pattern.

### Chantier F — Notifications Telegram temps réel (V1 LIVRÉE — 2026-06-18, bot leads dédié)
**Objectif** : push temps réel depuis l'API Hono à chaque nouveau lead (tous les `generate_lead` : audit unlock + formulaire qualif/contact), pensé comme **instrument** (triage + attribution + action), pas simple info. Cas d'usage moteur : mesurer l'impact d'un post LinkedIn en voyant les leads tomber avec leur source.

**Implémenté (PR Telegram lead notifications)** :
- Helper `api/src/lib/telegram.ts` — `sendLeadNotification()` fire-and-forget (ne throw/bloque jamais la réponse API). Parse mode **HTML** + **blockquote** (`expandable` pour lead simple, dépliée pour hot/qualifié) + **inline keyboard** boutons URL (Ouvrir le contact / Voir l'audit). Compteur « Nᵉ lead du jour » (count interactions du jour par type) + température lue depuis `admin_contacts_overview`.
- Déclencheurs : `POST /api/contacts` (formulaire) + `POST /api/audit/:id/unlock` (audit). **Tous les leads** notifiés (ping unitaire).
- **Attribution persistée** (migration `007_contact_attribution.sql`) : colonnes `lead_source`, `traffic_source`, `ga_client_id`, `gclid` sur `contacts`. Le frontend envoie `current_visit_source` + `ga_client_id` + `gclid` au unlock (`AuditResults`) et au submit form (`QualificationForm`). **Bonus** : débloque le prérequis attribution du Chantier J Phase 2 (MP / conversions offline server-side).
- **Bot dédié** : variables `TELEGRAM_LEADS_BOT_TOKEN` + `TELEGRAM_LEADS_CHAT_ID` (séparé de `@digitalix_monitor_bot` monitoring). Deep links : `PUBLIC_SITE_URL` (défaut `https://digitalix.xyz`).

**Manuel restant (Samuel) avant que ça marche en prod** :
- [ ] Créer le nouveau bot (@BotFather) + chat dédié leads
- [ ] Poser `TELEGRAM_LEADS_BOT_TOKEN` + `TELEGRAM_LEADS_CHAT_ID` (+ option `PUBLIC_SITE_URL`) en env vars **Coolify** (API)
- [x] Migration `007` : tourne **automatiquement** au déploiement (Dockerfile CMD `migrate.js && index.js`, `ADD COLUMN IF NOT EXISTS` idempotent) — rien à faire
- [ ] Valider le rendu de `<blockquote expandable>` par un envoi de test après déploiement

**Évolutions possibles (non faites)** :
- Enrichir la température multi-audit (`audit_count >= 2` → hot ; tags `récurrent`/`très engagé`)
- Récap groupé si burst (anti-spam pendant un pic viral) — choix actuel = ping unitaire
- Notif sur changement de statut/température (pas juste création)

### Chantier G — Internationalisation EN/US (à valider produit avant de coder)
**Contexte** : site 100% FR aujourd'hui, aucune infra i18n. Ouvrir le marché EN (UK/US/EU non-FR) demande une vraie traduction + adaptation produit.

**Périmètre estimé** :
- Frontend : ~400-500 strings (pages, composants, form de qualif)
- Backend checks audit : ~130 descriptions + businessNotes réparties sur 24 fichiers dans `api/src/lib/scanner/checks/`
- Emails Resend : 3 templates (~500 mots)
- SSE labels scanner : ~10 strings dans `fetcher.ts`
- DB : aucun changement nécessaire (descriptions générées au runtime, pas stockées)

**Archi recommandée** :
- Lib : `react-i18next` (léger, JSON splittable)
- Routing : locale prefix `/fr/*` + `/en/*` + détection `Accept-Language` pour redirect entrée
- Backend : factory `getChecks(locale)` qui renvoie la version localisée. Locale passée via header ou query dans `POST /api/audit`
- SEO : `hreflang` alternatifs + sitemap dual (`sitemap-fr.xml` + `sitemap-en.xml`) + canonical URLs absolues

**Effort estimé** : 4-6 semaines full-stack pour production-ready.
- Frontend (extraction + traduction) : 2-3 semaines
- Backend (24 checks + emails + SSE) : 1-2 semaines
- SEO + metadata + QA : 1 semaine
- Budget traducteur externe : ~800-1200€ pour ~5000 mots qualité

**Deux stratégies de rollout** :
- Option MVP (prudente) : Phase 1 = hero + audit tracking + email gate uniquement (~1 semaine). Valide le pattern et la demande EN avant d'investir.
- Option big bang : tout traduit d'un coup en 4-6 semaines. Risque : investissement avant validation marché.

**Questions produit à trancher AVANT de coder** :
- [ ] Marché cible précis : UK, US, global EU ? (impacte wording US vs UK, refs RGPD/GDPR, prix affichés)
- [ ] Positionnement légal en EN : on garde la focus CNIL/RGPD FR, ou bascule GDPR générique pour annonceurs non-EU qui vendent en Europe ?
- [ ] Signaux de demande validés ? (prospects EN LinkedIn, recherches Search Console en EN, etc.) Recommandation : ne pas lancer avant d'avoir 3-5 signaux concrets

**Reco en cours** : attendre validation produit (les 3 questions ci-dessus) avant d'investir. Si oui → partir sur Option MVP pour valider avant le full site.

### Chantier H — Pages partenaires co-brandées (LIVRÉ — 2026-04-21)
Système réplicable de landing pages dédiées par partenaire pour distribuer l'audit tracking sous co-branding.

**Architecture** :
- Route `/partenaires/:slug` (ex. `/partenaires/le-mage-du-sea`)
- Config dans `src/data/partners.ts` (objet TS, type-safe) — ajouter un partenaire = ~5 lignes
- Page `src/pages/PartnerAuditTracking.tsx` co-brandée (header DigitaliX × partenaire + logo + badge + intro override)
- Slug propagé via `location.state` jusqu'à `startAudit(url, partnerSlug)`
- Backend : nouvelle colonne `audits.partner_slug` (migration 006), index dédié
- Auto-tag : à l'unlock, contact taggé `partenaire-<slug>` automatiquement
- Slug inconnu → redirect vers `/audit-tracking` (graceful fallback)

**Propriété clé** : tout partenaire bénéficie automatiquement des évolutions de l'audit (form, scan, 28 checks, page résultats, emails, etc.). Une seule code base, un seul déploiement. Différenciation uniquement sur le wrapping visuel.

**Ajouter un partenaire** (≤30 secondes) :
1. Edit `src/data/partners.ts` → ajouter une entrée `{ slug, name, logoUrl?, badge?, intro? }`
2. Optionnel : déposer le logo dans `/public/partners/`
3. Push → live

**Suivi des leads par partenaire** :
- Tag `partenaire-<slug>` filtrable dans le dashboard admin
- Colonne `audits.partner_slug` requêtable directement (stats SQL : leads, score moyen, conversions par partenaire)

**Évolutions futures possibles** :
- Cookie de fallback `dx_partner=<slug>` (30j) pour préserver l'attribution sur visites de retour
- Page admin dédiée "Stats partenaires" (leads / conversions / score moyen par slug)

### Monitoring
- Weekly audit: GitHub Action (`.github/workflows/weekly-audit.yml`) — dimanche 20h Paris
- Telegram bot: @digitalix_monitor_bot (chat ID: 6155735961)
- GitHub Secrets: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `COOLIFY_API_TOKEN`, `HOSTINGER_API_TOKEN`
- Checks: API health, Coolify/Traefik versions, VPS state, npm outdated (key packages), GitHub issues
- Verdict: OK / PAS URGENT / ACTION REQUISE

### Chantier I — Didomi + Consent Mode v2 sur le site (branche `feat/didomi-consent-mode`, 2026-06-17)
**Contexte** : le site se positionne expert RGPD/Consent Mode/Didomi mais chargeait GTM sans aucune CMP ni Consent Mode. Cordonnier mal chaussé corrigé.
- [x] Loader Didomi placé **avant** GTM dans `index.html`. Pas de `gtag('consent','default')` hardcodé — le default `denied` + les updates sont gérés par la console Didomi (doc Didomi : "don't use more than one way to configure GCM"). Mode **advanced** choisi.
- [x] Pages légales créées : `/mentions-legales` + `/politique-de-confidentialite` (cette dernière corrige un **lien mort 404** déjà référencé par l'email gate de l'audit dans `AuditResults.tsx`).
- [x] Footer refondu (`src/components/landing/Footer.tsx`) : colonnes Services/Société/Légal, réseaux, SIREN, + bouton "Consent choices" → `window.Didomi.preferences.show()`. Type `window.Didomi` ajouté dans `vite-env.d.ts`.
- **Actions hors-repo restantes (Samuel)** avant merge/prod :
  - [ ] Console Didomi : activer Google Consent Mode (new flow) en mode **advanced**
  - [ ] Container GTM : tags Google (GA4/Ads) sur trigger `didomi-ready`, retirer triggers `didomiVendorsEnabled` + consent checks natifs GTM sur vendors `google` / `googleana-4TXnJigR`
  - [ ] Vérifier post-deploy : default denied au chargement, `gcs`/`gcd` sur les hits, re-scan digitalix.xyz avec l'audit tool (Didomi cmpId 7 détecté, 0 violation pré-consentement)
- **Identité légale** : EI Samuel Marangé, nom commercial DigitaliX, SIREN 849 349 253, SIRET 84934925300013, TVA FR70849349253, contact RGPD `privacy@digitalix.xyz`, hébergeurs Vercel (front) + Hostinger (API/DB).

### Chantier J — Plan de taggage dataLayer / GA4 (branche `feat/datalayer-tracking`, 2026-06-17)
**Contexte** : GTM chargé mais dataLayer quasi vide (seulement `virtual_page_view` + `calendar_modal_open`). Aucune conversion trackée → GTM n'avait rien à remonter à GA4/Ads/Meta.

**Phase 1 — dataLayer client-side (FAIT) :**
- Helper centralisé `src/lib/tracking.ts` (typé, source unique des events). Pushes consent-agnostic (GTM gère le gating via Consent Mode).
- Events : `generate_lead` (form qualif + post-audit + audit unlock), `audit_start`, `audit_complete`, `booking_intent` (remplace `calendar_modal_open`), `cta_click`.
- `generate_lead` porte `lead_score`, `is_qualified`, `profile_type`, `value`/`currency` (50 qualifié / 10 sinon / 20 audit), `ga_client_id` (cookie `_ga`), `gclid` (depuis visites stockées).
- Câblé dans : `QualificationForm.tsx` (submit), `AuditResults.tsx` (start/complete/unlock), `OutcomeStep.tsx` (booking intent), `CTASection.tsx` (cta_click).
- **Tunnel audit ordonné (fix race condition, 2026-06-18)** : si l'user déverrouille **pendant** le scan, `generate_lead` est **déféré** jusqu'à `audit_complete` (porte le vrai `audit_score`, tunnel GA4 `audit_start → audit_complete → generate_lead`). Fallback anti-perte : sur échec/timeout/onglet fermé, `generate_lead` part quand même (score partiel). Client : `pendingLeadRef` + `flushPendingLead()` dans `AuditResults.tsx`. Backend : la notif Telegram suit le même pattern via `notifyAuditLeadOnce()` (claim atomique sur `audits.lead_notified_at`, migration 008) — fire à l'unlock si complété, sinon à la fin de scan, fallback sur échec.
- **Note** : `/contact` et `/consultants` partagent `QualificationForm` → même `generate_lead` (`lead_source: qualification_form`), distinction via `page_location`. `cta_click` câblé sur `CTASection` (réutilisé multi-pages) ; extensible aux autres CTA.

**GTM web container — PUBLIÉ + validé DebugView (workspace `4`, 2026-06-18) :**
- Chaîne complète validée end-to-end : dataLayer → GTM → GA4 (`generate_lead` vu en DebugView avec tous params + user_data + user properties).
- Ajouts post-build : `user_data` (email/phone) câblé sur le tag `generate_lead` (event param → variable `UPD - Manual (dataLayer)`, awec mode MANUAL, clés snake_case `email`/`phone_number` ; adresse non incluse car GA4 exige le groupe complet `postal_code`+`country`). User properties sur `generate_lead` (`profile_type`, `lead_source`, `is_qualified`) + sur `audit_start` (`partner_slug`). `overall_score` unifié → `audit_score` (1 seule métrique). Microsoft Clarity (template Luratic, id `x8pq2azslc`, Consent Mode built-in, fire sur `didomi-ready` only).
- Config tag GA4 fire sur `cE - didomi-ready` (pattern Didomi advanced confirmé), pas sur virtual_page_view.
- Custom definitions créées en GA4 : 4 User-scoped (`profile_type`, `lead_source`, `is_qualified`, `partner_slug`) + 6 Event-scoped (`audit_id`, `audit_url`, `booking_type`, `cta_label`, `cta_location`, `cta_destination`) + 2 métriques (`lead_score`, `audit_score`). PII (`user_data`/email/phone) jamais en CD.
- Restant : marquer `generate_lead` en Key Event (par nom, latence liste Événements 24-48h) ; décocher Enhanced Measurement "Page changes based on browser history events". (`page_title` par route : ✅ fait — voir ci-dessous)
- **Fix `page_location`/`page_title` sur tous les events (version 5 publiée, 2026-06-18)** : le tag de config gelait `page_location = {{Page URL}}` + `page_title` au fire `didomi-ready` ; seul `page_view` overridait → les events non-`page_view` (`generate_lead`, `audit_start/complete`, `booking_intent`, `cta_click`) reportaient l'URL d'atterrissage (avec gclid) et le titre du site. Fix : `page_location` + `page_title` (depuis `{{DLV - page_location}}`/`{{DLV - page_title}}`) ajoutés aux **5 Event Settings** (vars 31-35), même pattern que `page_view`. Workspace `6` → version `5` LIVE. Config tag laissé tel quel (sans effet, tous les events overrident + `send_page_view=false`).

**GTM web container — build (workspace dédié `4`, 2026-06-18) :**
- Container web `GTM-PD3X686F` (accountId `6274627309`, containerId `209382913`). GA4 Measurement ID = `G-Z77KTMJYZ4`. Container serveur déjà existant : `sGTM - DigitaliX` `GTM-N5FHRMJS` (containerId `255835480`) — à héberger sur Stape.
- Base déjà OK avant intervention : config tag GA4 `send_page_view=false`, event `page_view` sur `virtual_page_view`, DLVs page_*, User-Provided Data (Enhanced Conversions auto).
- Ajouté dans workspace `4` : 17 DLVs (lead_source, lead_score, is_qualified, profile_type, value, currency, audit_id, audit_score, ga_client_id, gclid, audit_url, partner_slug, overall_score, booking_type, cta_label, cta_location, cta_destination) + 5 Event Settings vars + 5 triggers Custom Event + 5 tags GA4 Event (generate_lead, audit_start, audit_complete, booking_intent, cta_click).
- Config vérifiée vs doc Google + Simo Ahava (tracking SPA) : `send_page_view=false` + page_view manuel sur custom event = best practice confirmée ; params dynamiques en event-scope (pas config-scope) ; Custom Event trigger > History Change.
- **Manuel restant (hors GTM, côté GA4/Ads)** :
  - GA4 admin : marquer `generate_lead` (et booking_complete à terme) comme Key Event ; enregistrer les params en custom dimensions ; **décocher Enhanced Measurement "Page changes based on browser history events"** (sinon double page_view).
  - Google Ads : tag de conversion (besoin conversion ID/label) sur `generate_lead` — pas encore créé.
  - Vérifier en Preview : ordre consent default → config → page_view ; `didomi-ready` fire au load (advanced, pas basic).
- **page_title par route** : ✅ **réglé** (commit `d2c86f7`, PR #136) — `src/lib/pageTitles.ts` (`resolvePageTitle()` : mapping de routes + humanisation des slugs pour routes dynamiques) + `src/hooks/useDataLayerPageView.ts` set `document.title` synchroniquement avant le push `page_view`. GA4 reçoit désormais un titre par page.

**Décision archi server-side (2026-06-18, recherche sourcée Stape/Google MP/Simo/Meta) : HYBRIDE.**
- Stape sGTM (container `GTM-N5FHRMJS`) pour les events web → GA4/Ads/Meta server-side (dogfooding + cookies FPID httpOnly résistants ITP Safari + Cookie Keeper). Plan Pro ~17$/mois.
- Hono backend pour la conversion booking offline uniquement (webhook Calendar) → **routée via l'endpoint sGTM Stape**, pas en appels API directs (1 seul pipe consent-governed, dedup, pas de code API tripliqué).
- Prérequis : persister `ga_client_id`+`gclid`+`_fbp`/`_fbc` sur le contact en DB au submit (pour l'attribution offline). GA4 MP exige client_id+session_id (<24h) et timestamp <72h. Ads offline migre vers Data Manager API (deadline ~15 juin 2026 — à vérifier).

**sGTM build — PUBLIÉ EN PROD (gate `dgx.digitalix.xyz` 200 levé, 2026-06-18) :**
- Domaine server-side : **`dgx.digitalix.xyz`** (CNAME Cloudflare → cible Stape, DNS only/SSL Stape). Custom loader Stape : `load.dgx.digitalix.xyz`. Gate vérifié : `dgx.digitalix.xyz/healthy` → 200, `load.dgx.digitalix.xyz/dd8qqdhbapwnu.js` → 200 (408KB JS). Note : `/healthy` et `/ns.html` sur le sous-domaine `load.dgx` répondent 403 (normal, le custom loader ne sert que les chemins obfusqués).
- Container serveur `GTM-N5FHRMJS` (containerId `255835480`) : **publié v2 live** depuis workspace `3`. GA4 Client (FPID, server, 2 ans — préexistant) + built-in `Client Name` activée + trigger `All GA4 client events` (`{{_event}}` matchRegex `.*` + filtre `Client Name = GA4`) + tag `GA4 - Forward to GA4` (`sgtmgaaw`, mode rely-on-incoming-request).
- Container web `GTM-PD3X686F` (containerId `209382913`) : **publié v4 live** depuis workspace `5`. `server_container_url = https://dgx.digitalix.xyz` + `first_party_collection = true` sur `GTAG - Config_settings`.
- Code : PR #137 (custom loader Stape dans index.html, après Didomi) — **mergée** (`9e9db86`, 2026-06-18), branche supprimée, auto-deploy Vercel. Loader pointe `https://load.dgx.digitalix.xyz/dd8qqdhbapwnu.js?dum9rb2=...`, noscript iframe sur `load.dgx.digitalix.xyz/ns.html`.
- Ordre de publication respecté : serveur AVANT web (sinon hits perdus), puis merge.
- **Reste à valider post-deploy (Samuel)** : test Preview + GA4 DebugView → Request URL = `dgx.digitalix.xyz`, cookie FPID httpOnly posé, events toujours reçus dans GA4. Vérifier aussi le noscript `ns.html` (404 possible si Stape ne le sert pas sous loader obfusqué — impact négligeable).

**Phase 2 — conversion booking server-side (À FAIRE, décidé 2026-06-17) :**
- Le calendrier est un **embed iframe Google Calendar Appointment Schedule** (`calendar.google.com/...`, cross-origin) → `booking_complete` **non captable côté client** (pas de postMessage, SOP).
- **Décision : reconstruire une UI de réservation custom sur la Google Calendar API** (freebusy + events.insert) → prefill des slots avec infos déjà collectées + capture du booking + déclenchement conversion **server-side** (GA4 Measurement Protocol + Meta CAPI + Google Ads), attribué par email/`client_id`. Gros chantier (dispo, fuseaux, anti-double-booking).
- Prérequis attribution : persister `ga_client_id` + `gclid` **sur le contact en DB** (aujourd'hui seulement poussés dans le dataLayer). `CALENDAR_URL` actuel dans `OutcomeStep.tsx:24`.

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
- [x] Chantier E: Refonte Audit Results — 7 phases, sections structurées, businessNotes, raw_data exposé (2026-04-14)
- [x] Fix: SSE timeout 60s → 180s, progress % dynamique, accents SSE labels (2026-04-14)
- [x] BlockProgressLoader: composant réutilisable (`src/components/ui/block-progress-loader.tsx`) (2026-04-14)
- [x] ev-card applied to audit scan + results pages (2026-04-14)
- [x] Blur email gate: all checks blurred with transparent→opaque gradient (2026-04-14)
- [x] Fix: unlock endpoint returns rawData + businessNote (2026-04-14)
- [x] Fix: all hardcoded French accents in AuditResults.tsx (2026-04-14)
- [x] Scan page: domain H1 gradient + email/consent form during scan (2026-04-14)
- [x] Fix: PageSpeed sequential after Playwright (resource contention on VPS) (2026-04-14)
- [x] Fix: PageSpeed timeout 30s → 90s — silent catch was hiding timeouts on slow sites (digitalix.xyz: TTFB 4.4s + 98 scripts). LCP/CLS now display. (2026-04-19)
- [x] Diagnostic: surface PageSpeed error (HTTP status / timeout / no API key) dans rawData + UI (ambre sous "Non disponible") pour diag futur sans accès logs (2026-04-19)
- [x] SSE step "Mesure des Core Web Vitals..." avant PageSpeed pour éviter loader figé à 95% pendant 90s (2026-04-19)
- [x] Remplacement INP → TBT (Total Blocking Time) — INP nécessite CrUX field data, TBT est le proxy lab de Google, toujours mesurable. Seuils 200/600ms. (2026-04-19)
- [x] RGPD: checkbox consentement obligatoire sur email gate (scan + overlay résultats) + texte légal + lien politique de confidentialité (2026-04-19)
- [x] RGPD: confirmation visuelle "Email enregistré" avec CheckCircle après soumission pendant le scan (2026-04-19)
- [x] RGPD: persistance consentement — frontend envoie `gdpr_consent`, backend valide (400 si absent) et écrit `gdpr_consent = true` + `gdpr_consent_at = COALESCE(original, now())` dans contacts (2026-04-19)
- [x] Fix: CMP timing — remplacement du `waitForTimeout(10s)` bloquant par `pollDetectCmp` (200ms) qui retourne à la 1ère apparition. Les sites rapides affichent enfin une vraie valeur (~500ms-2s) au lieu du plafond artificiel 12-15s. (2026-04-20)
- [x] Rename + refonte check `capi-google` → "Google Ads server-side (Enhanced Conversions)" — plus d'invention du terme "CAPI Google", messages contextuels alignés avec le check sGTM (plus de contradiction) (2026-04-20)
- [x] Copy: durée scan alignée à 2-3 min sur toutes les pages (subtitle entry + badge "sous 3 min" + reassurance durant le scan "Gardez cet onglet ouvert") (2026-04-20)
- [x] Style: CTA "Reserver mon Audit Offert" centré sur mobile via wrapper `flex justify-center` (2026-04-20)
- [x] Fix: bouton "Débloquer" durant le scan était un no-op silencieux — `handleEmailSubmit` retournait early sur `!auditResult` (null pendant l'analyse). Nouveau state `scanAuditId` set dès que `startAudit()` résout, `effectiveId` combine `auditResult?.id ?? scanAuditId ?? routeId` (2026-04-20)
- [x] CMP: détection bouton refus enrichie — fallback ARIA/texte après échec du sélecteur CMP (moins de faux négatifs "Refuser non trouvé") + détection explicite du pattern "Continuer sans accepter" avec message CNIL-aware ("toléré depuis l'arrêt Google 2022 mais non-optimal"). Nouveaux champs `rejectButtonLabel` + `rejectIsContinueWithout` dans DetectedCmp. (2026-04-20)
- [x] CMP coverage étendue à la liste partenaire Google : nouvelle map `CMP_SCRIPT_PATTERNS` (30 entrées, identification par URL script) + 8 nouvelles CMPs full-selector (Sourcepoint, TrustArc, Termly, Osano, Ketch, Tealium, Adobe Privacy, Piwik PRO) → 23 CMPs supportées en 3-session protocol. Fix bonus : selectors Sirdata hashés dégagés au profit de sélecteurs stables. (2026-04-20)
- [x] Contact smart context : CTA audit → `/contact?auditId=xxx` avec email + URL propagés via router state. Contact.tsx fetch l'audit, bannière contextualisée, QualificationForm passe en mode 3 étapes (skip Situation), email pré-rempli, bonus scoring +25 post-audit, `interaction_type: 'audit_contact_request'` + `audit_id` en metadata. (2026-04-20)
- [x] Chantier C : Supabase code cleanup — 7 commentaires `* Replaces: supabase.x` retirés dans admin.ts / email.ts / contacts.ts. Reste uniquement l'action manuelle "supprimer le projet côté dashboard supabase.com". (2026-04-20)
- [x] Chantier C : **Redirect chain analysis check** — capture la chaîne via Playwright `response.request().redirectedFrom()`, analyse hops + préservation des query params tracking (utm_*, gclid, gbraid, fbclid, msclkid, dclid, wbraid). Fail direct si params perdus (attribution Google Ads cassée). 0-1 hop → pass, 2 → warning, 3+ → fail. 26 checks au total. (2026-04-20)
- [x] Audit Results : CTA inline "Contactez un expert" dans section Recommandations supportait l'audit context (auditId + state email/url) comme le CTA gradient du bas. (2026-04-20)
- [x] Audit Results : section "Autres vérifications" (pass/info) déplacée AVANT "Recommandations" (fail/warning) pour que les actions restent collées au CTA gradient final et que l'utilisateur voie d'abord ce qui est OK. (2026-04-20)
- [x] Fix critique : race condition unlock pendant scan — quand le user clique Débloquer avant la fin du scan, l'endpoint unlock écrit `unlocked_at = now()` mais `audit_checks` est vide → renvoie `checks: []`. Le SSE `result` event appliquait ensuite le mask gated sans checker l'unlock state → user voyait "Débloquez les résultats..." comme description dans TOUTES les cards alors qu'il avait donné son email. Fix backend : nouveau helper `buildSseResultPayload()` qui lit `unlocked_at` en DB avant de masquer. Fix frontend : n'écrase plus les checks avec un tableau vide quand unlock mid-scan retourne `[]`. (2026-04-20)
- [x] Audit Results : CTA inline "Contactez un expert" retiré complètement — redondant avec le CTA gradient principal "Reserver mon Audit Offert". 1 CTA fort > 2 CTA moyens rapprochés. (2026-04-20)
- [x] Audit : nouveaux checks **Google Ads** (détection AW-XXX via 4 signaux + mode hybride client/server/cookie-only explicite) + **Microsoft UET Bing Ads** (bat.bing.com + uetq). Ajout à TrackersTable, platform mapping Google/Microsoft, affichage loading method "Hybride (client + server)". 28 checks au total. (2026-04-21)
- [x] Audit precision overhaul — 4 checks réécrits pour être **honnêtes** au lieu de sur-affirmer (2026-04-21) :
  - **Meta CAPI** : check `_fbp httpOnly` était cassé (le cookie est toujours lu par JS, jamais httpOnly même server-side). Description/businessNote contradictoires. Nouvelle logique basée sur eventID seul (signal fiable de dédup CAPI). Pass si eventID détecté, warning si Pixel sans eventID.
  - **Enhanced Conversions** : ajout parsing réseau (em/em_hash sur /pagead/conversion, user_data sur /g/collect). Inline regex strict (plus de faux positifs). Wording humble quand sGTM présent (EC peut être server-side, opaque à notre scan).
  - **Cookies first-party** : drop du trap `httpOnly || (!isThirdParty && expires)` (faussé). Nouvelle logique : httpOnly (rare mais conclusif) + durée > 7j (si un cookie persiste au-delà, il vient forcément d'un HTTP Set-Cookie car ITP Safari cap les JS-set à 7j).
  - **DataLayer e-commerce** : détection de 8 plugins connus (GTM4WP, WooCommerce DataLayer, Shopify Pixels, Magento GTM, PrestaShop, BigCommerce, etc.). Plugin détecté → pass avec note "events attendus sur pages produit/checkout (non scannées)". Sinon info (plus warning) avec reco manuelle. Events GA4 étendus (select_item, remove_from_cart, view_cart).
- [x] Audit : **server-managed cookies detection** (FPID/FPLC/FPGCLAW/FPGCLDC/FPGCLGB) via nouveau helper `server-managed-cookies.ts` (2026-04-21) :
  - Ces noms sont exclusifs aux setups sGTM "Server-managed cookies (recommended)" — preuve définitive par le naming
  - **sgtm.ts** refondu avec niveaux de maturité 0/1/2 explicites (client-side / librairie proxifiée / server-managed complet) + edge case "gtm.js non proxifié + FP* présents" flagué comme "setup fragmenté à investiguer"
  - **cookies.ts** : famille FP* comme signal prioritaire (pass immédiat avec label de rôle pour chaque cookie détecté)
  - **capi-google.ts** : FPGCLAW ajouté comme signal fort pour Google Ads server-managed
  - Distinction GTGA (Google Tag Gateway for Advertisers — proxy de librairie) vs sGTM (processing server-side) documentée dans les descriptions/businessNotes
- [x] Audit : **sous-détection server-side sur custom-domain corrigée** (2026-06-18, après faux négatif sur digitalix.xyz lui-même) :
  - **Fix #1 — classification cookie eTLD+1** (`fetcher.ts` `cookieIsThirdParty`) : l'ancien test par suffixe ratait les sous-domaines du même domaine racine (`dgx.digitalix.xyz` vs `www.digitalix.xyz`). Nouveau `registrableDomain()` (eTLD+1 + set de suffixes multi-parties type `co.uk`). Un FPID posé sur un sous-domaine sGTM est désormais classé first-party (capté). Améliore aussi toutes les cards cookies (capi-meta/google, third-party-cookies).
  - **Fix #2 — signal server-side indépendant du cookie** (`sgtm.ts` `detectServerSideCollect` + `looksLikeGa4Collect`) : détecte les hits GA4 routés vers un host **first-party non-Google** (ex. `dgx.digitalix.xyz`). **Gère l'obfuscation custom-loader Stape** : le hit n'est pas `/g/collect` en clair mais `/dd8qq...?<hash>=<base64>` avec le payload `/g/collect` encodé en base64 dans un param → le helper décode les valeurs base64 et cherche `/g/collect`/`tid=G-`. Le niveau 2 reste réservé au FPID, mais le message niveau 1 affirme « hits routés server-side vers ton domaine ». `serverSideCollect`/`serverSideCollectHost` en rawData.
  - **Constat vérifié en live (Playwright + DevTools, 2026-06-18)** : digitalix.xyz est **confirmé NIVEAU 2 complet** — hits GA4 consentis routés vers `dgx.digitalix.xyz` (marqueurs `sst.*` Stape, payload base64) **ET cookie `FPID` server-managed posé** (httpOnly, `.digitalix.xyz`, format `FPID2.2.<id>.<ts>`, 2 ans). Le client GA4 serveur (`GTM-N5FHRMJS`) est en `cookieManagement=server` + publié. Tout fonctionne.
  - **Le « niveau 1 » était un FAUX NÉGATIF du scanner**, en deux temps : (1) hit server-side **obfusqué** par le custom loader (pas de `/g/collect` en clair) → corrigé par le décodage base64 ; (2) **FPID non capté** sur un scan « visiteur frais » — le cookie httpOnly cross-sous-domaine n'était pas dans le snapshot `context.cookies()` au bon moment. **Ce n'était PAS un problème de classification** (FPID sur `.digitalix.xyz` était déjà first-party même avant le fix eTLD+1).
- [x] Audit : **capture du `Set-Cookie` server-side** (2026-06-18) : `fetcher.ts` lit désormais le header `Set-Cookie` des réponses first-party non-Google (server-side) et expose `serverSetCookieNames` par session ; `server-managed-cookies.ts` détecte les FP* (FPID/FPGCLAW…) via ce signal **en plus** du cookie-jar. Attrape le FPID même quand le jar le rate (httpOnly, visite fraîche). Corrige le faux négatif niveau 2 sur les setups Stape server-managed.
- [x] Audit : **GTM masqué par first-party load + custom loader** — bug où un setup server-side avancé causait "Installer Google Tag Manager" dans les recommandations (2026-04-21) :
  - Pattern URL élargi : matche `gtm.js?id=GTM-XXX` sur n'importe quel domaine (pas que googletagmanager.com)
  - Inline guards relâchés (accepte `'GTM-XXX'` en string literal)
  - Network requests ajoutées comme source de détection (custom loader peut fetch gtm.js avec URL transformée)
  - Fallback FP* cookies → pass "container GTM non visible, détecté indirectement via cookies server-managed"
  - Fallback dataLayer actif seul → info "possible custom loader ou tag manager alternatif"
  - TrackersTable : affiche "masqué (custom loader)" + loading method "Server-side (masqué)" quand détection indirecte
- [x] Audit : **Sirdata + Consent Mode v2** sur setup server-side (2026-04-21) :
  - Sirdata n'était pas identifié sur un sGTM proxifié (CMP_SCRIPT_PATTERNS rate quand l'URL proxifiée ne contient plus "sirdata")
  - Fix : query IAB TCF API (`window.__tcfapi('getTCData', 2, ...)`) → récupère le `cmpId` officiel. Nouvelle table `TCF_CMP_IDS` (14 CMP courantes : Sirdata=92, Didomi=7, OneTrust=10, Axeptio=300, CookieYes=373, etc.). Cascade : TCF > script URLs > generic tag.
  - Consent Mode v2 : l'extracteur cherchait `gcs`/`gcd` seulement sur `/g/collect` et `/j/collect`. Avec sGTM endpoint custom → on ratait les signaux. Fix : accepte gcs/gcd sur **n'importe quelle URL** + validation de format (gcs `/^G1\d{2}$/`, gcd ≥ 4 chars) pour éviter les faux positifs.
- [x] Fix critique : **email "Score 0/100" envoyé pendant le scan** — quand l'user cliquait Débloquer avant la fin du scan, l'endpoint lisait `audit.overall_score = 0` (valeur DB par défaut) et envoyait l'email immédiatement. Fix : nouveau helper `sendUnlockEmailIfPending()` avec guard anti-double-envoi via `email_logs`. Endpoint unlock n'envoie que si `audit.status === 'completed'`, sinon persiste juste l'unlock. Handler fin de scan détecte unlock en attente (via `unlocked_at`) et envoie avec le vrai score. (2026-04-21)
- [x] **Audit cookies — refonte complète classification selon définition user** (2026-04-21) :
  - Définition adoptée : **third-party = navigateur communique directement avec un vendor externe** (et non classification domain-based CNIL/technique)
  - Recherche CNIL (définition officielle) + IAB TCF + docs WebKit ITP consultées
  - Nouveau champ `firstPartyCommunication: boolean` par cookie dans `cookie-vendors.ts` :
    - `true` uniquement pour FP\* family (browser ↔ sGTM sur notre domaine) + Matomo self-hosted
    - `false` pour tous les trackers vendor client-side (_ga, _gcl_au, _fbp, _ttp, _uetsid, li_fat_id, _scid, _pin_unauth, _hjSession\* ...)
    - Helper `identifyCookieVendorWithContext()` override Matomo en third-party si script chargé depuis `*.matomo.cloud`
  - `cookies.ts` réécrit : ne liste que les cookies `firstPartyCommunication: true`. Heuristique durée > 7j retirée (invalide sur Chromium, seul Safari applique ITP)
  - `third-party-cookies.ts` réécrit : liste les cookies vendor client-side + ceux sur domaines techniquement tiers. rawData expose `cookies: [{name, vendor, role, safariDurationDays, safariState}]`
- [x] **Audit cookies — Safari ITP impact standardisé sur les 2 cards** (2026-04-21) :
  - Recherche : Safari ITP 2.1+ cap les cookies JS-set à 7 jours ; ITP 2.3 bloque entièrement les cookies sur domaines tiers (depuis 2020) ; HTTP Set-Cookie same-origin préserve la durée. Safari ≈ 20-25% du trafic EU (Statcounter)
  - Ligne pédagogique `safariPedagogy` dans rawData, toujours présente dans les 2 cards
  - Third-party : *"Safari bloque ou cap ces cookies à 7 jours. Ça concerne ≈ 25% de votre trafic EU."*
  - First-party : *"Ces cookies server-managed résistent à Safari ITP et aux adblockers."*
- [x] **Audit Results — CookieCard component + TrackersTable dynamique** (2026-04-21) :
  - Nouveau composant réutilisable `CookieCard` (AuditResults.tsx) : layout cohérent pour les 2 cards (status icon, title, description courte, liste structurée de cookies, businessNote amber, ligne pédagogique Safari séparée par border)
  - Composant `SafariBadge` par cookie : 🟢 `✓ 2 ans Safari` (FP\*/httpOnly), 🟡 `⏱ 7j Safari` (capped), 🔴 `🚫 Bloqué Safari` (domaine tiers)
  - `TrackersTable` dynamique : fonction `isTrackerDetected()` qui filtre les lignes sur la présence de signaux en rawData. Seuls les trackers détectés apparaissent. Footer "N détectés sur M analysés" si certains masqués. Page de résultats beaucoup plus légère sur les sites avec peu de trackers.
- [x] **Audit Results — Stepper maturité Server-Side** (2026-04-21) :
  - Nouveau composant `ServerSideMaturity` qui lit `rawData.maturityLevel` (0/1/2) du check sgtm et affiche un stepper horizontal visuel entre TrackersTable et PrivacySection
  - Étape courante : pastille primary→secondary gradient + shadow ; étapes passées : emerald ✓ ; étapes futures : muted
  - Connecteurs colorés quand atteints
  - Labels : Client-side / Librairie proxifiée / Server-managed
  - Description du check sGTM affichée en context sous le stepper
  - Gros gain pédagogique — le prospect voit sa position server-side en 1 coup d'œil

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
