import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://udikvpxmrzynokbljpmn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaWt2cHhtcnp5bm9rYmxqcG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5ODc0MjEsImV4cCI6MjA4NTU2MzQyMX0.aRf6Qr-U2-G-EXMgTq2ZInvWIIgdkRA1rg_pzbzrFg0';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
