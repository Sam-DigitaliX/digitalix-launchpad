/**
 * Centralized GTM dataLayer tracking helper.
 *
 * All site conversion events are pushed through here so the event names and
 * param shapes stay consistent (one source of truth for the GTM tagging plan).
 *
 * The pushes are consent-agnostic: pushing to the dataLayer is not a tag — GTM
 * gates the actual GA4/Ads/Meta tags via Consent Mode v2 (managed in Didomi).
 */
import { getVisitorData } from './trackingUtils';

type LeadSource = 'qualification_form' | 'post_audit' | 'audit_unlock';

interface TrackLeadParams {
  source: LeadSource;
  leadScore?: number;
  isQualified?: boolean;
  profileType?: string | null;
  /** Monetary value for Ads bidding; derived from qualification if omitted. */
  value?: number;
  auditId?: string;
  auditScore?: number | null;
  /** PII for Enhanced Conversions / server-side match — pushed as `user_data`. */
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
}

/**
 * Google Enhanced Conversions `user_data` object. Values are sent in plaintext —
 * GTM/Google normalizes and SHA-256-hashes them before transmission. Built only
 * when an email or phone is present, and pushed alongside the conversion event.
 * @see https://support.google.com/google-ads/answer/13258081
 */
interface UserData {
  email?: string;
  phone_number?: string;
  address?: { first_name?: string; last_name?: string };
}

/** Normalize a phone to E.164 (best-effort, FR default). Returns null if unusable. */
function normalizePhone(phone: string): string | null {
  const trimmed = phone.trim();
  if (trimmed.startsWith('+')) {
    const digits = trimmed.slice(1).replace(/\D/g, '');
    return digits.length >= 8 ? `+${digits}` : null;
  }
  const digits = trimmed.replace(/\D/g, '');
  // French national format: leading 0 + 9 digits → +33
  if (digits.length === 10 && digits.startsWith('0')) return `+33${digits.slice(1)}`;
  if (digits.length >= 8) return `+${digits}`;
  return null;
}

function buildUserData(params: TrackLeadParams): UserData | undefined {
  const data: UserData = {};
  if (params.email) data.email = params.email.trim().toLowerCase();
  if (params.phone) {
    const normalized = normalizePhone(params.phone);
    if (normalized) data.phone_number = normalized;
  }
  if (params.fullName) {
    const parts = params.fullName.trim().split(/\s+/);
    if (parts.length > 0) {
      data.address = {
        first_name: parts[0],
        last_name: parts.length > 1 ? parts.slice(1).join(' ') : undefined,
      };
    }
  }
  return data.email || data.phone_number ? data : undefined;
}

/** Push a payload, stripping undefined keys to keep the dataLayer clean. */
function push(payload: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  const clean: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(payload)) {
    if (val !== undefined && val !== null) clean[key] = val;
  }
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push(clean);
}

/**
 * GA4 client_id from the `_ga` cookie.
 * Cookie format: `GA1.1.<client_id>` where client_id is `<rand>.<timestamp>`.
 */
export function getGaClientId(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/_ga=GA\d\.\d\.(\d+\.\d+)/);
  return match ? match[1] : null;
}

/** Most recent gclid captured across the visitor's stored visits. */
export function getGclid(): string | null {
  const data = getVisitorData();
  if (!data) return null;
  for (let i = data.visits.length - 1; i >= 0; i--) {
    const { gclid } = data.visits[i];
    if (gclid) return gclid;
  }
  return null;
}

/** `generate_lead` — qualification form, post-audit form, or audit email unlock. */
export function trackLead(params: TrackLeadParams): void {
  const value = params.value ?? (params.isQualified ? 50 : 10);
  push({
    event: 'generate_lead',
    lead_source: params.source,
    lead_score: params.leadScore,
    is_qualified: params.isQualified,
    profile_type: params.profileType,
    value,
    currency: 'EUR',
    audit_id: params.auditId,
    audit_score: params.auditScore,
    ga_client_id: getGaClientId(),
    gclid: getGclid(),
    user_data: buildUserData(params),
  });
}

/** `audit_start` — user launched a tracking audit scan. */
export function trackAuditStart(params: { auditUrl: string; partnerSlug?: string }): void {
  push({
    event: 'audit_start',
    audit_url: params.auditUrl,
    partner_slug: params.partnerSlug,
  });
}

/** `audit_complete` — scan finished, results displayed. */
export function trackAuditComplete(params: { auditId: string; auditScore: number }): void {
  push({
    event: 'audit_complete',
    audit_id: params.auditId,
    audit_score: params.auditScore,
  });
}

/** `booking_intent` — user opened the appointment calendar. */
export function trackBookingIntent(params?: { bookingType?: string }): void {
  push({
    event: 'booking_intent',
    booking_type: params?.bookingType ?? 'qualified_lead',
  });
}

/** `cta_click` — primary call-to-action clicked. */
export function trackCtaClick(params: {
  ctaLabel: string;
  ctaLocation: string;
  ctaDestination?: string;
}): void {
  push({
    event: 'cta_click',
    cta_label: params.ctaLabel,
    cta_location: params.ctaLocation,
    cta_destination: params.ctaDestination,
  });
}
