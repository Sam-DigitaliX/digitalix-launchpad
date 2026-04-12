const API_BASE = (import.meta.env.VITE_API_URL ?? 'https://api.digitalix.xyz').replace(/\/+$/, '');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (options.body) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new ApiError(res.status, body.error ?? 'Request failed', body);
  }

  return res.json() as Promise<T>;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/* ──────────────────── Contacts ──────────────────── */

export interface UpsertContactParams {
  email: string;
  full_name?: string | null;
  company_name?: string | null;
  phone?: string | null;
  profile_type?: string | null;
  qualification_score?: number | null;
  is_qualified?: boolean | null;
  gdpr_consent?: boolean | null;
  gdpr_consent_at?: string | null;
  newsletter_optin?: boolean | null;
  behavioral_profile?: string | null;
  interaction_type?: string | null;
  interaction_metadata?: Record<string, unknown> | null;
}

export function upsertContact(params: UpsertContactParams) {
  return request<{ success: boolean; contact_id: string }>('/api/contacts', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/* ──────────────────── Email ──────────────────── */

export interface SendConfirmationParams {
  type: 'confirmation';
  data: {
    email: string;
    full_name: string;
    company_name?: string;
    profile_type?: string;
    current_situation?: string;
    pain_points?: string[];
    budget_range?: string;
    timeline?: string;
    score: number;
    is_qualified: boolean;
  };
}

export interface SendAuditUnlockParams {
  type: 'audit_unlock';
  data: {
    email: string;
    url: string;
    score: number;
  };
}

export function sendEmail(params: SendConfirmationParams | SendAuditUnlockParams) {
  return request<{ success: boolean; message_id: string }>('/api/email/send-confirmation', {
    method: 'POST',
    body: JSON.stringify(params),
  });
}

/* ──────────────────── Audit ──────────────────── */

import type { AuditResult, AuditCheck } from '@/types/audit';

export interface AuditProgressEvent {
  type: 'session_start' | 'step_done' | 'issues_count' | 'session_complete' | 'scan_complete' | 'error' | 'result';
  session?: number;
  totalSessions?: number;
  label: string;
  issuesCount?: number;
  result?: AuditResult;
}

/** Create an audit and get the ID back (scan runs in background) */
export function startAudit(url: string) {
  return request<{ id: string }>('/api/audit', {
    method: 'POST',
    body: JSON.stringify({ url }),
  });
}

/** Open SSE stream to receive scan progress events */
export function streamAuditProgress(
  id: string,
  onEvent: (event: AuditProgressEvent) => void,
  onError?: (error: Event) => void,
): EventSource {
  const source = new EventSource(`${API_BASE}/api/audit/${id}/progress`);

  source.addEventListener('progress', (e) => {
    try {
      const data = JSON.parse((e as MessageEvent).data) as AuditProgressEvent;
      onEvent(data);
    } catch {
      // malformed event
    }
  });

  source.onerror = (e) => {
    source.close();
    onError?.(e);
  };

  return source;
}

export function getAudit(id: string) {
  return request<AuditResult>('/api/audit/' + id);
}

export function unlockAudit(id: string, email: string) {
  return request<{ success: boolean; checks: AuditCheck[]; contactId: string }>('/api/audit/' + id + '/unlock', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function trackAuditEmailClick(id: string, contactId: string) {
  return request<{ success: boolean }>('/api/audit/' + id + '/track-click', {
    method: 'POST',
    body: JSON.stringify({ contactId }),
  });
}

/* ──────────────────── Admin ──────────────────── */

function adminHeaders(adminKey: string): HeadersInit {
  return { Authorization: `Bearer ${adminKey}` };
}

export interface AdminStats {
  total_contacts: number;
  qualified_count: number;
  total_interactions: number;
  interactions_today: number;
  top_interaction_type: string | null;
}

export function getAdminStats(adminKey: string) {
  return request<AdminStats>('/api/admin/stats', {
    headers: adminHeaders(adminKey),
  });
}

export interface AdminContact {
  id: string;
  email: string;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  profile_type: string | null;
  qualification_score: number | null;
  is_qualified: boolean | null;
  behavioral_profile: string | null;
  gdpr_consent: boolean | null;
  newsletter_optin: boolean | null;
  first_seen_at: string;
  last_seen_at: string;
  interaction_count: number;
  interaction_types: string[] | null;
  last_interaction_at: string | null;
}

export function getAdminContacts(adminKey: string) {
  return request<AdminContact[]>('/api/admin/contacts', {
    headers: adminHeaders(adminKey),
  });
}

export interface AdminInteraction {
  id: string;
  type: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function getAdminContactTimeline(adminKey: string, contactId: string) {
  return request<AdminInteraction[]>(`/api/admin/contacts/${contactId}/timeline`, {
    headers: adminHeaders(adminKey),
  });
}
