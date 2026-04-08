Assist with the Supabase → PostgreSQL migration for DigitaliX:

## Context
- Current: Supabase Cloud (PostgreSQL + Edge Functions + RLS)
- Target: Dedicated PostgreSQL on Coolify + API backend (Hono or Fastify)
- 3 SQL migrations in supabase/migrations/
- 1 Edge Function: send-confirmation (Resend email integration)

## Migration Steps
1. Review current Supabase usage: client calls, RPCs, Edge Functions
2. Identify all `supabase.rpc()` and `supabase.from()` calls in the frontend
3. Plan the API routes that will replace these calls
4. Generate the PostgreSQL schema (adapt migrations, remove Supabase-specific features like RLS policies)
5. Create the API backend with equivalent endpoints
6. Update frontend to call the new API instead of Supabase

Focus on: $ARGUMENTS (or "plan" for the full migration plan)
