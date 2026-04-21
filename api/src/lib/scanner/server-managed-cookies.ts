import type { ScanContext } from './types.js';

/**
 * First-party cookies posés par sGTM en mode "Server-managed cookies".
 * Leurs noms sont EXCLUSIFS aux setups server-managed — la librairie
 * gtag.js / GTM web ne crée jamais ces cookies. Les détecter = preuve
 * définitive que le client GA4/Ads de sGTM tourne en first-party mode.
 */
export const GOOGLE_FP_COOKIES: Record<string, string> = {
  FPID: 'GA4 client_id (server-managed)',
  FPLC: 'GA4 linker companion (server-managed, cross-domain)',
  FPGCLAW: 'Google Ads conversion ID (server-managed)',
  FPGCLDC: 'DoubleClick / Campaign Manager (server-managed)',
  FPGCLGB: 'gbraid / iOS Google Ads (server-managed)',
};

export interface ServerManagedCookies {
  /** Noms des cookies FP* détectés (first-party, non tiers) */
  detected: string[];
  hasFpid: boolean;
  hasFpgclaw: boolean;
  /** Cookie _ga encore présent → cohabitation possible avec FPID */
  hasLegacyGa: boolean;
  /** Cookie _gcl_au encore présent → cohabitation possible avec FPGCLAW */
  hasLegacyGclAu: boolean;
}

export function detectServerManagedCookies(ctx: ScanContext): ServerManagedCookies {
  // On regarde en priorité la session post-accept (cookies complets)
  const postAccept = ctx.sessions.find((s) => s.phase === 'post-accept');
  const cookies = postAccept?.cookies ?? ctx.cookies;

  const names = Object.keys(GOOGLE_FP_COOKIES);
  const detected: string[] = [];
  let hasFpid = false;
  let hasFpgclaw = false;
  let hasLegacyGa = false;
  let hasLegacyGclAu = false;

  for (const c of cookies) {
    if (c.isThirdParty) continue;
    if (names.includes(c.name)) {
      detected.push(c.name);
      if (c.name === 'FPID') hasFpid = true;
      if (c.name === 'FPGCLAW') hasFpgclaw = true;
    }
    if (c.name.startsWith('_ga')) hasLegacyGa = true;
    if (c.name === '_gcl_au') hasLegacyGclAu = true;
  }

  return { detected, hasFpid, hasFpgclaw, hasLegacyGa, hasLegacyGclAu };
}
