/**
 * Identifie les cookies de tracking par leur nom (indépendamment du domaine
 * technique). Le RGPD/CNIL considère un cookie comme "tiers" quand il est
 * déposé par un tiers agissant pour son propre compte — même s'il est
 * techniquement stocké sur le domaine first-party du site visité.
 *
 * Référence : CNIL — "les cookies tiers sont généralement gérés par des
 * tiers qui ont été interrogés par le site visité et non par l'internaute".
 */

export interface CookieVendorInfo {
  vendor: string;
  role: string;
  /**
   * True si le cookie reste en communication first-party (navigateur ↔ notre
   * domaine uniquement). False si le navigateur envoie la donnée directement
   * à un vendor externe (Google, Meta, TikTok, etc.).
   *
   * Critère du user pour classer third-party : "le browser communique
   * directement avec un vendor externe".
   */
  firstPartyCommunication: boolean;
}

type VendorEntry = { match: RegExp; info: CookieVendorInfo };

const COOKIE_VENDORS: VendorEntry[] = [
  // Google Analytics client-side (browser → google-analytics.com directement)
  { match: /^_ga$/, info: { vendor: 'Google Analytics', role: 'GA4 client_id', firstPartyCommunication: false } },
  { match: /^_ga_[A-Z0-9]+$/, info: { vendor: 'Google Analytics', role: 'GA4 session-stream', firstPartyCommunication: false } },
  { match: /^_gid$/, info: { vendor: 'Google Analytics', role: 'Universal session id', firstPartyCommunication: false } },
  { match: /^_gat(_.*)?$/, info: { vendor: 'Google Analytics', role: 'throttle', firstPartyCommunication: false } },
  { match: /^_dc_gtm_.*$/, info: { vendor: 'Google Tag Manager', role: 'throttle', firstPartyCommunication: false } },
  // Google Ads client-side
  { match: /^_gcl_au$/, info: { vendor: 'Google Ads', role: 'conversion linker', firstPartyCommunication: false } },
  { match: /^_gcl_aw$/, info: { vendor: 'Google Ads', role: 'AW conversion', firstPartyCommunication: false } },
  { match: /^_gcl_dc$/, info: { vendor: 'Google DoubleClick', role: 'DoubleClick conversion', firstPartyCommunication: false } },
  { match: /^_gcl_gb$/, info: { vendor: 'Google Ads', role: 'gbraid (iOS)', firstPartyCommunication: false } },
  { match: /^_gcl_gs$/, info: { vendor: 'Google Ads', role: 'gs conversion', firstPartyCommunication: false } },
  // Google server-managed (sGTM) — posés par notre sGTM, browser parle à notre domaine
  { match: /^FPID$/, info: { vendor: 'GA4 sGTM', role: 'server-managed client_id', firstPartyCommunication: true } },
  { match: /^FPLC$/, info: { vendor: 'GA4 sGTM', role: 'linker companion', firstPartyCommunication: true } },
  { match: /^FPGCLAW$/, info: { vendor: 'Google Ads sGTM', role: 'server-managed conversion', firstPartyCommunication: true } },
  { match: /^FPGCLDC$/, info: { vendor: 'Google DoubleClick sGTM', role: 'server-managed DoubleClick', firstPartyCommunication: true } },
  { match: /^FPGCLGB$/, info: { vendor: 'Google Ads sGTM', role: 'server-managed gbraid', firstPartyCommunication: true } },
  // Meta Pixel — browser → facebook.com directement
  { match: /^_fbp$/, info: { vendor: 'Meta Pixel', role: 'browser_id', firstPartyCommunication: false } },
  { match: /^_fbc$/, info: { vendor: 'Meta Pixel', role: 'click_id (fbclid)', firstPartyCommunication: false } },
  // TikTok Pixel — browser → analytics.tiktok.com
  { match: /^_ttp$/, info: { vendor: 'TikTok Pixel', role: 'pixel id', firstPartyCommunication: false } },
  { match: /^_tt_enable_cookie$/, info: { vendor: 'TikTok Pixel', role: 'enable flag', firstPartyCommunication: false } },
  // Microsoft UET (Bing Ads) — browser → bat.bing.com
  { match: /^_uetsid$/, info: { vendor: 'Microsoft UET', role: 'session id', firstPartyCommunication: false } },
  { match: /^_uetvid$/, info: { vendor: 'Microsoft UET', role: 'visitor id', firstPartyCommunication: false } },
  { match: /^_uetmsclkid$/, info: { vendor: 'Microsoft UET', role: 'click id', firstPartyCommunication: false } },
  // LinkedIn — browser → linkedin.com / snap.licdn.com
  { match: /^li_fat_id$/, info: { vendor: 'LinkedIn Insight', role: 'ad click id', firstPartyCommunication: false } },
  { match: /^lidc$/, info: { vendor: 'LinkedIn', role: 'LiveReports routing', firstPartyCommunication: false } },
  { match: /^bcookie$/, info: { vendor: 'LinkedIn', role: 'browser id', firstPartyCommunication: false } },
  { match: /^AnalyticsSyncHistory$/, info: { vendor: 'LinkedIn', role: 'sync history', firstPartyCommunication: false } },
  // Snapchat — browser → sc-static.net
  { match: /^_scid$/, info: { vendor: 'Snapchat Pixel', role: 'session id', firstPartyCommunication: false } },
  { match: /^_scid_r$/, info: { vendor: 'Snapchat Pixel', role: 'refresh id', firstPartyCommunication: false } },
  // Pinterest — browser → pinterest.com
  { match: /^_pin_unauth$/, info: { vendor: 'Pinterest Tag', role: 'unauth id', firstPartyCommunication: false } },
  { match: /^_pinterest_sess$/, info: { vendor: 'Pinterest', role: 'session', firstPartyCommunication: false } },
  // Hotjar — browser → hotjar.com
  { match: /^_hjSessionUser_.*$/, info: { vendor: 'Hotjar', role: 'session user', firstPartyCommunication: false } },
  { match: /^_hjSession_.*$/, info: { vendor: 'Hotjar', role: 'session', firstPartyCommunication: false } },
  // Matomo — dépend du self-hosted vs cloud. Défaut : on assume self-hosted
  // (first-party). Le caller peut override via identifyCookieVendorWithContext.
  { match: /^_pk_id\..*$/, info: { vendor: 'Matomo', role: 'visitor id', firstPartyCommunication: true } },
  { match: /^_pk_ses\..*$/, info: { vendor: 'Matomo', role: 'session', firstPartyCommunication: true } },
  { match: /^_pk_ref\..*$/, info: { vendor: 'Matomo', role: 'referrer', firstPartyCommunication: true } },
  { match: /^_pk_cvar\..*$/, info: { vendor: 'Matomo', role: 'custom vars', firstPartyCommunication: true } },
];

export function identifyCookieVendor(name: string): CookieVendorInfo | null {
  for (const entry of COOKIE_VENDORS) {
    if (entry.match.test(name)) return entry.info;
  }
  return null;
}

/**
 * Variante context-aware : override Matomo en third-party si on détecte que
 * le script Matomo est chargé depuis Matomo Cloud (domaine externe).
 */
export function identifyCookieVendorWithContext(
  name: string,
  scripts: string[],
): CookieVendorInfo | null {
  const base = identifyCookieVendor(name);
  if (!base) return null;
  if (base.vendor === 'Matomo') {
    const isMatomoCloud = scripts.some((s) =>
      s.includes('.matomo.cloud') || s.includes('cloud.matomo.cloud')
    );
    if (isMatomoCloud) return { ...base, firstPartyCommunication: false };
  }
  return base;
}

export function isTrackerCookie(name: string): boolean {
  return identifyCookieVendor(name) !== null;
}
