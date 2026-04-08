# Supabase → PostgreSQL + API Backend Migration Plan

> **Status**: Planning  
> **Target**: Dedicated PostgreSQL on Coolify + Hono API backend  
> **Current**: Supabase Cloud (PostgreSQL + Edge Functions + RLS)

---

## Table of Contents

1. [Current State Audit](#1-current-state-audit)
2. [Target Architecture](#2-target-architecture)
3. [Phase 1 — PostgreSQL Schema](#3-phase-1--postgresql-schema)
4. [Phase 2 — API Backend (Hono)](#4-phase-2--api-backend-hono)
5. [Phase 3 — Frontend Migration](#5-phase-3--frontend-migration)
6. [Phase 4 — Data Migration](#6-phase-4--data-migration)
7. [Phase 5 — Cleanup & Cutover](#7-phase-5--cleanup--cutover)
8. [Risk Assessment](#8-risk-assessment)
9. [Environment Variables](#9-environment-variables)

---

## 1. Current State Audit

### 1.1 Database Tables (4)

| Table | Rows (est.) | Purpose |
|-------|-------------|---------|
| `contacts` | Low volume | Leads with progressive enrichment (email = unique key) |
| `interactions` | Low volume | Timeline of all contact touchpoints |
| `email_logs` | Low volume | Every email sent via Resend |
| `admin_config` | 1 row | Admin password storage |

### 1.2 Database Views (1)

| View | Purpose |
|------|---------|
| `admin_contacts_overview` | Contacts + aggregated interaction data |

### 1.3 RPC Functions (7)

| Function | Access | Called From | Purpose |
|----------|--------|-------------|---------|
| `upsert_contact_with_interaction` | anon | QualificationForm, AuditResults | Atomic contact upsert + interaction log |
| `admin_get_stats` | anon (key-protected) | Admin.tsx | Dashboard stats |
| `admin_get_contacts` | anon (key-protected) | Admin.tsx | All contacts with interaction summary |
| `admin_get_contact_timeline` | anon (key-protected) | Admin.tsx | Interaction timeline for one contact |
| `admin_get_email_stats` | anon (key-protected) | Admin.tsx (unused currently) | Email delivery stats |
| `admin_get_contact_emails` | anon (key-protected) | Admin.tsx (unused currently) | Email logs for one contact |
| `log_email` | service_role | Edge Function | Log sent email + interaction |
| `_verify_admin_key` | internal | Other admin RPCs | Verify admin password |

### 1.4 Edge Functions (1)

| Function | Purpose | Secrets |
|----------|---------|---------|
| `send-confirmation` | Send email via Resend, log to DB | `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |

### 1.5 Frontend Call Sites (3 files, 6 calls)

| File | Call | Type |
|------|------|------|
| `src/components/qualification/QualificationForm.tsx:109` | `supabase.rpc('upsert_contact_with_interaction', {...})` | RPC |
| `src/components/qualification/QualificationForm.tsx:169` | `supabase.functions.invoke('send-confirmation', {...})` | Edge Function |
| `src/pages/AuditResults.tsx:235` | `supabase.rpc('upsert_contact_with_interaction', {...})` | RPC |
| `src/pages/AuditResults.tsx:252` | `supabase.functions.invoke('send-confirmation', {...})` | Edge Function |
| `src/pages/Admin.tsx:137` | `supabase.rpc('admin_get_contact_timeline', {...})` | RPC |
| `src/pages/Admin.tsx:258` | `supabase.rpc('admin_get_stats', {...})` | RPC |
| `src/pages/Admin.tsx:271` | `supabase.rpc('admin_get_contacts', {...})` | RPC |

### 1.6 Security Model

- All tables have RLS enabled but **no explicit policies** — all data access is via `SECURITY DEFINER` functions
- Admin endpoints protected by a plaintext key stored in `admin_config`
- Edge Function uses `service_role` key (server-side only)
- Frontend only uses the `anon` key

---

## 2. Target Architecture

```
┌─────────────────┐     HTTPS      ┌─────────────────────┐      TCP       ┌──────────────┐
│   React SPA     │ ───────────── → │  Hono API (Node.js) │ ────────────── → │  PostgreSQL   │
│   (Vercel)      │                 │  (Coolify)          │                │  (Coolify)    │
└─────────────────┘                 └─────────────────────┘                └──────────────┘
                                           │
                                           │ HTTPS
                                           ↓
                                    ┌──────────────┐
                                    │  Resend API   │
                                    └──────────────┘
```

### Key decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| API framework | **Hono** | Lightweight, TypeScript-first, runs on Node.js/Bun, easy deploy on Coolify |
| ORM / query | **Raw SQL via `postgres` (porsager/postgres)** | Schema is simple, 4 tables, RPCs are already written in SQL — no ORM overhead needed |
| Auth model | **Admin key via `Authorization` header** | Same simple model, just moved server-side. No user auth needed (public forms + admin key) |
| Email sending | **Direct Resend call from API** | Replaces Edge Function, same logic |
| Deployment | **Coolify** (Docker) | API + PostgreSQL on same Coolify instance |

---

## 3. Phase 1 — PostgreSQL Schema

**Goal**: Produce a clean, Supabase-free schema that runs on any PostgreSQL 15+.

### 3.1 What changes from Supabase

| Supabase-specific | Action |
|-------------------|--------|
| RLS policies | **Remove** — API backend handles authorization |
| `SECURITY DEFINER` functions | **Remove** — Logic moves to API routes |
| `GRANT ... TO anon/authenticated/service_role` | **Remove** — Single DB user for the API |
| `gen_random_uuid()` | **Keep** — Standard in PG 13+ (via `pgcrypto`) or PG 14+ natively |
| Views (`admin_contacts_overview`) | **Keep** — Useful for the contacts list query |

### 3.2 New migration file: `001_schema.sql`

```sql
-- Enable UUID generation (PG < 14 needs pgcrypto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════ Tables ═══════════════

CREATE TABLE contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  full_name text,
  company_name text,
  phone text,
  profile_type text,
  qualification_score integer,
  is_qualified boolean,
  gdpr_consent boolean,
  gdpr_consent_at timestamptz,
  newsletter_optin boolean DEFAULT false,
  behavioral_profile text,
  first_seen_at timestamptz DEFAULT now(),
  last_seen_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
  type text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_interactions_contact_id ON interactions(contact_id);
CREATE INDEX idx_interactions_type ON interactions(type);

CREATE TABLE email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id uuid REFERENCES contacts(id) ON DELETE SET NULL,
  to_email text NOT NULL,
  template_key text NOT NULL,
  subject text,
  status text NOT NULL DEFAULT 'sent',
  resend_message_id text,
  metadata jsonb DEFAULT '{}',
  sent_at timestamptz DEFAULT now(),
  opened_at timestamptz,
  clicked_at timestamptz
);

CREATE INDEX idx_email_logs_contact_id ON email_logs(contact_id);
CREATE INDEX idx_email_logs_template_key ON email_logs(template_key);
CREATE INDEX idx_email_logs_status ON email_logs(status);

CREATE TABLE admin_config (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  key text NOT NULL
);

-- ═══════════════ Views ═══════════════

CREATE OR REPLACE VIEW admin_contacts_overview AS
SELECT
  c.id, c.email, c.full_name, c.company_name, c.phone, c.profile_type,
  c.qualification_score, c.is_qualified, c.behavioral_profile,
  c.gdpr_consent, c.newsletter_optin, c.first_seen_at, c.last_seen_at,
  COUNT(i.id)::int AS interaction_count,
  ARRAY_AGG(DISTINCT i.type) FILTER (WHERE i.type IS NOT NULL) AS interaction_types,
  MAX(i.created_at) AS last_interaction_at
FROM contacts c
LEFT JOIN interactions i ON i.contact_id = c.id
GROUP BY c.id
ORDER BY c.last_seen_at DESC;
```

### 3.3 What's removed vs. Supabase migrations

- **Removed**: All `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`
- **Removed**: All `GRANT EXECUTE ON FUNCTION ... TO anon/authenticated/service_role`
- **Removed**: All 7 PL/pgSQL functions (`upsert_contact_with_interaction`, `_verify_admin_key`, `admin_get_*`, `log_email`) — logic moves to API
- **Kept**: Tables, indexes, view (identical structure)

---

## 4. Phase 2 — API Backend (Hono)

### 4.1 Project structure

```
api/
├── package.json
├── tsconfig.json
├── Dockerfile
├── .env.example
├── src/
│   ├── index.ts              # Hono app entry
│   ├── db.ts                 # postgres connection pool
│   ├── middleware/
│   │   ├── cors.ts           # CORS for SPA
│   │   └── admin-auth.ts     # Admin key verification
│   ├── routes/
│   │   ├── contacts.ts       # POST /api/contacts (upsert + interaction)
│   │   ├── email.ts          # POST /api/email/send-confirmation
│   │   ├── admin.ts          # GET /api/admin/stats, contacts, timeline, emails
│   │   └── health.ts         # GET /api/health
│   └── lib/
│       ├── email-templates.ts # Ported from Edge Function
│       └── resend.ts          # Resend API client
```

### 4.2 API Routes — Full mapping

Each Supabase call maps to one API route:

| Supabase Call | New API Route | Method | Auth |
|---------------|---------------|--------|------|
| `rpc('upsert_contact_with_interaction')` | `POST /api/contacts` | POST | Public |
| `functions.invoke('send-confirmation')` | `POST /api/email/send-confirmation` | POST | Public |
| `rpc('admin_get_stats')` | `GET /api/admin/stats` | GET | Admin key |
| `rpc('admin_get_contacts')` | `GET /api/admin/contacts` | GET | Admin key |
| `rpc('admin_get_contact_timeline')` | `GET /api/admin/contacts/:id/timeline` | GET | Admin key |
| `rpc('admin_get_email_stats')` | `GET /api/admin/email-stats` | GET | Admin key |
| `rpc('admin_get_contact_emails')` | `GET /api/admin/contacts/:id/emails` | GET | Admin key |

### 4.3 Route details

#### `POST /api/contacts`
Replaces `upsert_contact_with_interaction` RPC.

```typescript
// Body (same shape as current RPC params)
{
  email: string;              // required
  full_name?: string;
  company_name?: string;
  phone?: string;
  profile_type?: string;
  qualification_score?: number;
  is_qualified?: boolean;
  gdpr_consent?: boolean;
  gdpr_consent_at?: string;   // ISO timestamp
  newsletter_optin?: boolean;
  behavioral_profile?: string;
  interaction_type?: string;
  interaction_metadata?: object;
}

// Response: 200 OK
{ success: true }
```

Implementation: Same UPSERT + INSERT logic as the current PL/pgSQL function, but in TypeScript using parameterized SQL.

#### `POST /api/email/send-confirmation`
Replaces `send-confirmation` Edge Function.

```typescript
// Body (same shape as current Edge Function payload)
{
  type: "confirmation" | "audit_unlock";
  data: ConfirmationPayload | AuditUnlockPayload;
}

// Response: 200 OK
{ success: true, message_id: string }
```

Implementation: Port email template builders from Edge Function + call Resend API + insert into `email_logs` + `interactions`.

#### `GET /api/admin/stats`
Replaces `admin_get_stats` RPC.

```typescript
// Headers: Authorization: Bearer <admin-key>
// Response: 200 OK
{
  total_contacts: number;
  qualified_count: number;
  total_interactions: number;
  interactions_today: number;
  top_interaction_type: string | null;
}
```

#### `GET /api/admin/contacts`
Replaces `admin_get_contacts` RPC.

```typescript
// Headers: Authorization: Bearer <admin-key>
// Response: 200 OK
Contact[] // (same shape as admin_contacts_overview view)
```

#### `GET /api/admin/contacts/:id/timeline`
Replaces `admin_get_contact_timeline` RPC.

```typescript
// Headers: Authorization: Bearer <admin-key>
// Response: 200 OK
Interaction[] // { id, type, metadata, created_at }
```

#### `GET /api/admin/email-stats`
Replaces `admin_get_email_stats` RPC.

#### `GET /api/admin/contacts/:id/emails`
Replaces `admin_get_contact_emails` RPC.

### 4.4 Middleware

#### CORS
```typescript
// Allow requests from the Vercel frontend
cors({ origin: ['https://digitalix.fr', 'http://localhost:8080'] })
```

#### Admin Auth
```typescript
// Reads admin key from admin_config table (cached), compares with
// Authorization: Bearer <key> header using timing-safe comparison.
// Returns 401 if invalid.
```

### 4.5 Database connection

```typescript
import postgres from 'postgres';
const sql = postgres(process.env.DATABASE_URL);
```

Single connection pool, no ORM. All queries use tagged template literals with automatic parameterization (safe from SQL injection).

### 4.6 Dockerfile

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Deploy via Coolify with a `DATABASE_URL` and `RESEND_API_KEY` env var.

---

## 5. Phase 3 — Frontend Migration

### 5.1 Replace Supabase client with API client

**Delete**: `src/integrations/supabase/client.ts` and `src/integrations/supabase/index.ts`

**Create**: `src/lib/api.ts`

```typescript
const API_URL = import.meta.env.VITE_API_URL; // e.g. https://api.digitalix.fr

export const api = {
  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },

  async get<T>(path: string, adminKey?: string): Promise<T> {
    const headers: Record<string, string> = {};
    if (adminKey) headers['Authorization'] = `Bearer ${adminKey}`;
    const res = await fetch(`${API_URL}${path}`, { headers });
    if (!res.ok) throw new Error(`API error: ${res.status}`);
    return res.json();
  },
};
```

### 5.2 File-by-file changes

#### `src/components/qualification/QualificationForm.tsx`

```diff
- import { supabase } from '@/integrations/supabase';
+ import { api } from '@/lib/api';

  // Line ~109: Replace supabase.rpc() with API call
- const { error } = await supabase.rpc('upsert_contact_with_interaction', {
-   p_email: formData.email,
-   p_full_name: formData.fullName,
-   ...
- });
+ await api.post('/api/contacts', {
+   email: formData.email,
+   full_name: formData.fullName,
+   company_name: formData.companyName,
+   phone: formData.phone,
+   profile_type: formData.profileType,
+   qualification_score: score,
+   is_qualified: qualified,
+   gdpr_consent: formData.gdprConsent,
+   gdpr_consent_at: new Date().toISOString(),
+   newsletter_optin: formData.newsletterOptin,
+   behavioral_profile: behavioralProfile,
+   interaction_type: 'qualification_form',
+   interaction_metadata: { ...metadata },
+ });

  // Line ~169: Replace supabase.functions.invoke() with API call
- await supabase.functions.invoke('send-confirmation', {
-   body: { type: 'confirmation', data: { ... } }
- });
+ await api.post('/api/email/send-confirmation', {
+   type: 'confirmation',
+   data: { ... },
+ });
```

#### `src/pages/AuditResults.tsx`

```diff
- import { supabase } from '@/integrations/supabase';
+ import { api } from '@/lib/api';

  // Line ~235: Replace supabase.rpc()
- await supabase.rpc('upsert_contact_with_interaction', { ... });
+ await api.post('/api/contacts', { ... });

  // Line ~252: Replace supabase.functions.invoke()
- await supabase.functions.invoke('send-confirmation', { ... });
+ await api.post('/api/email/send-confirmation', { ... });
```

#### `src/pages/Admin.tsx`

```diff
- import { supabase } from '@/integrations/supabase';
+ import { api } from '@/lib/api';

  // Line ~137: Replace timeline RPC
- const { data, error } = await supabase.rpc('admin_get_contact_timeline', {
-   p_key: adminKey, p_contact_id: contact.id
- });
+ const data = await api.get(`/api/admin/contacts/${contact.id}/timeline`, adminKey);

  // Line ~258: Replace stats RPC
- const { data: statsData, error } = await supabase.rpc('admin_get_stats', { p_key: adminKey });
+ const statsData = await api.get('/api/admin/stats', adminKey);

  // Line ~271: Replace contacts RPC
- const { data: contactsData } = await supabase.rpc('admin_get_contacts', { p_key: adminKey });
+ const contactsData = await api.get('/api/admin/contacts', adminKey);
```

### 5.3 Environment variable change

```diff
- VITE_SUPABASE_URL=https://xxx.supabase.co
- VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUz...
+ VITE_API_URL=https://api.digitalix.fr
```

### 5.4 Package cleanup

```bash
npm uninstall @supabase/supabase-js
```

---

## 6. Phase 4 — Data Migration

### 6.1 Export from Supabase

```bash
# Use Supabase CLI or pg_dump against the Supabase connection string
pg_dump "postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres" \
  --data-only \
  --table=public.contacts \
  --table=public.interactions \
  --table=public.email_logs \
  --table=public.admin_config \
  > data_export.sql
```

### 6.2 Import to new PostgreSQL

```bash
# Run schema first
psql $DATABASE_URL < api/migrations/001_schema.sql

# Then import data
psql $DATABASE_URL < data_export.sql
```

### 6.3 Verification checklist

- [ ] Row counts match for all 4 tables
- [ ] `admin_contacts_overview` view returns data
- [ ] Admin key in `admin_config` works
- [ ] UUID references are intact (contacts ↔ interactions ↔ email_logs)

---

## 7. Phase 5 — Cleanup & Cutover

### 7.1 Cutover steps (ordered)

1. Deploy PostgreSQL on Coolify, run schema migration, import data
2. Deploy Hono API on Coolify, verify `/api/health` responds
3. Test all API routes manually against production data
4. Update frontend env vars on Vercel (`VITE_API_URL`)
5. Deploy frontend
6. Verify all flows work end-to-end:
   - Qualification form submission → contact created + email sent
   - Audit email gate → contact created + email sent
   - Admin login → stats + contacts list + timeline expand
7. Monitor for 48h
8. Decommission Supabase project

### 7.2 Files to delete

```
src/integrations/supabase/          # Entire directory
supabase/                           # Entire directory (migrations, functions, config)
```

### 7.3 Rollback plan

- Keep Supabase project active for 2 weeks after cutover
- Frontend rollback: revert env vars to Supabase values, redeploy
- Data sync: if rollback needed after writes to new DB, manually reconcile

---

## 8. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Data loss during migration | High | `pg_dump` + verify row counts before cutover |
| Email sending breaks | Medium | Test Resend integration in API before cutover; same API key works |
| CORS misconfiguration | Low | Test from `localhost:8080` + `digitalix.fr` before cutover |
| Admin auth bypass | Medium | Timing-safe comparison; rate-limit admin routes |
| Downtime during cutover | Low | Both systems can run in parallel; frontend switch is instant (env var) |

---

## 9. Environment Variables

### API Backend (Coolify)

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/digitalix
RESEND_API_KEY=re_xxxxx
ADMIN_CORS_ORIGINS=https://digitalix.fr,http://localhost:8080
PORT=3000
```

### Frontend (Vercel)

```env
VITE_API_URL=https://api.digitalix.fr
```

---

## Execution Order Summary

| Phase | Effort | Dependencies |
|-------|--------|-------------|
| **Phase 1**: PostgreSQL schema | ~1h | None |
| **Phase 2**: Hono API backend | ~4-6h | Phase 1 |
| **Phase 3**: Frontend migration | ~2h | Phase 2 |
| **Phase 4**: Data migration | ~1h | Phase 1 + Coolify setup |
| **Phase 5**: Cutover | ~2h | All phases |

**Total estimated effort**: ~10-12h of implementation work.

The migration is straightforward because:
- Small schema (4 tables, 1 view)
- No complex auth (no Supabase Auth / JWT — just a simple admin key)
- All data access is via RPCs that map 1:1 to REST endpoints
- Email logic is self-contained in one Edge Function
- Low data volume makes export/import trivial
