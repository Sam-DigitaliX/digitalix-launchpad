/* ──────────────────── Cookie ──────────────────── */

export interface ParsedCookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
  maxAge?: number;
  expires?: string;
  isThirdParty: boolean;
}

/* ──────────────────── Network ──────────────────── */

export interface NetworkRequest {
  url: string;
  method: string;
  resourceType: string;
  status: number;
  initiator: string;
  timestamp: number;
}

export interface RedirectHop {
  url: string;
  statusCode: number;
  method: string;
}

/* ──────────────────── Consent ──────────────────── */

export interface ConsentState {
  hasConsentMode: boolean;
  /** Consent default state from gtag('consent', 'default', ...) */
  defaultParameters: Record<string, string>;
  /** Consent state after update (accept/reject) */
  updatedParameters: Record<string, string>;
  /** gcs parameter from /g/collect requests */
  gcsValues: string[];
  /** gcd parameter from /g/collect requests */
  gcdValues: string[];
}

/* ──────────────────── Session ──────────────────── */

export type SessionPhase = 'pre-consent' | 'post-accept' | 'post-reject';

export interface ScanSession {
  phase: SessionPhase;
  cookies: ParsedCookie[];
  networkRequests: NetworkRequest[];
  consentState: ConsentState;
  dataLayerPushes: Record<string, unknown>[];
  /** Scripts loaded (src URLs) */
  scriptsLoaded: string[];
}

/* ──────────────────── CMP ──────────────────── */

export interface DetectedCmp {
  name: string;
  /** Time in ms from page load to CMP banner visible */
  appearanceDelayMs: number;
  acceptButtonFound: boolean;
  rejectButtonFound: boolean;
  /** Label/text of the detected reject button (when rejectButtonFound is true) */
  rejectButtonLabel: string | null;
  /** True if the reject path is a "Continuer sans accepter" style link (CNIL-tolerated but discouraged) */
  rejectIsContinueWithout: boolean;
}

/* ──────────────────── Scan Context ──────────────────── */

export interface ScanContext {
  url: string;
  finalUrl: string;
  domain: string;
  html: string;
  headers: Record<string, string>;
  cookies: ParsedCookie[];
  scripts: string[];
  inlineScripts: string[];
  fetchDurationMs: number;
  statusCode: number;
  /** Detected CMP info (null if no CMP found) */
  cmp: DetectedCmp | null;
  /** The 3 scan sessions (pre-consent, post-accept, post-reject) */
  sessions: ScanSession[];
  /** True if scan ran in degraded mode (no CMP found, single session) */
  degradedMode: boolean;
  /** Detected e-commerce platform */
  ecommercePlatform: string | null;
  /** HTTP redirect chain from the entered URL to the final page (includes the final 200) */
  redirectChain: RedirectHop[];
}

/* ──────────────────── Progress ──────────────────── */

export interface ScanProgressEvent {
  type: 'session_start' | 'step_done' | 'issues_count' | 'session_complete' | 'scan_complete' | 'error';
  session?: number;
  totalSessions?: number;
  label: string;
  issuesCount?: number;
}

export type OnProgress = (event: ScanProgressEvent) => void;

/* ──────────────────── Check ──────────────────── */

export interface CheckResult {
  status: 'pass' | 'fail' | 'warning' | 'info';
  description: string;
  rawData?: Record<string, unknown>;
  businessNote?: string;
}

export interface CheckModule {
  id: string;
  category: 'tracking' | 'serverside' | 'privacy' | 'performance';
  name: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  gated: boolean;
  run: (ctx: ScanContext) => CheckResult;
}
