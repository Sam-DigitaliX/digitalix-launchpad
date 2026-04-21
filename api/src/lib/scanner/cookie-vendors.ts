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
  /** True si le cookie est posé en server-managed (naming exclusif sGTM) */
  serverManaged?: boolean;
}

const COOKIE_VENDORS: { match: RegExp; info: CookieVendorInfo }[] = [
  // Google Analytics (GA4 + legacy)
  { match: /^_ga$/, info: { vendor: 'Google Analytics', role: 'GA4 client_id' } },
  { match: /^_ga_[A-Z0-9]+$/, info: { vendor: 'Google Analytics', role: 'GA4 session-stream' } },
  { match: /^_gid$/, info: { vendor: 'Google Analytics', role: 'session id (Universal)' } },
  { match: /^_gat(_.*)?$/, info: { vendor: 'Google Analytics', role: 'throttle' } },
  { match: /^_dc_gtm_.*$/, info: { vendor: 'Google Tag Manager', role: 'throttle' } },
  // Google Ads
  { match: /^_gcl_au$/, info: { vendor: 'Google Ads', role: 'conversion linker' } },
  { match: /^_gcl_aw$/, info: { vendor: 'Google Ads', role: 'AW conversion' } },
  { match: /^_gcl_dc$/, info: { vendor: 'Google DoubleClick', role: 'DoubleClick conversion' } },
  { match: /^_gcl_gb$/, info: { vendor: 'Google Ads', role: 'gbraid (iOS)' } },
  { match: /^_gcl_gs$/, info: { vendor: 'Google Ads', role: 'gs conversion' } },
  // Google server-managed (sGTM)
  { match: /^FPID$/, info: { vendor: 'Google Analytics (sGTM)', role: 'server-managed client_id', serverManaged: true } },
  { match: /^FPLC$/, info: { vendor: 'Google Analytics (sGTM)', role: 'linker companion', serverManaged: true } },
  { match: /^FPGCLAW$/, info: { vendor: 'Google Ads (sGTM)', role: 'server-managed conversion', serverManaged: true } },
  { match: /^FPGCLDC$/, info: { vendor: 'Google DoubleClick (sGTM)', role: 'server-managed DoubleClick', serverManaged: true } },
  { match: /^FPGCLGB$/, info: { vendor: 'Google Ads (sGTM)', role: 'server-managed gbraid', serverManaged: true } },
  // Meta Pixel
  { match: /^_fbp$/, info: { vendor: 'Meta (Facebook)', role: 'Pixel browser_id' } },
  { match: /^_fbc$/, info: { vendor: 'Meta (Facebook)', role: 'Pixel click_id (fbclid)' } },
  // TikTok Pixel
  { match: /^_ttp$/, info: { vendor: 'TikTok', role: 'Pixel id' } },
  { match: /^_tt_enable_cookie$/, info: { vendor: 'TikTok', role: 'enable flag' } },
  // Microsoft UET (Bing Ads)
  { match: /^_uetsid$/, info: { vendor: 'Microsoft UET', role: 'session id' } },
  { match: /^_uetvid$/, info: { vendor: 'Microsoft UET', role: 'visitor id' } },
  { match: /^_uetmsclkid$/, info: { vendor: 'Microsoft UET', role: 'click id' } },
  // LinkedIn
  { match: /^li_fat_id$/, info: { vendor: 'LinkedIn Insight', role: 'first-party ad id' } },
  { match: /^lidc$/, info: { vendor: 'LinkedIn', role: 'LiveReports routing' } },
  { match: /^bcookie$/, info: { vendor: 'LinkedIn', role: 'browser id' } },
  { match: /^AnalyticsSyncHistory$/, info: { vendor: 'LinkedIn', role: 'sync history' } },
  // Snapchat
  { match: /^_scid$/, info: { vendor: 'Snapchat', role: 'session id' } },
  { match: /^_scid_r$/, info: { vendor: 'Snapchat', role: 'refresh id' } },
  // Pinterest
  { match: /^_pin_unauth$/, info: { vendor: 'Pinterest', role: 'Tag unauth id' } },
  { match: /^_pinterest_sess$/, info: { vendor: 'Pinterest', role: 'session' } },
  // Hotjar
  { match: /^_hjSessionUser_.*$/, info: { vendor: 'Hotjar', role: 'session user' } },
  { match: /^_hjSession_.*$/, info: { vendor: 'Hotjar', role: 'session' } },
  // Matomo
  { match: /^_pk_id\..*$/, info: { vendor: 'Matomo', role: 'visitor id' } },
  { match: /^_pk_ses\..*$/, info: { vendor: 'Matomo', role: 'session' } },
];

export function identifyCookieVendor(name: string): CookieVendorInfo | null {
  for (const entry of COOKIE_VENDORS) {
    if (entry.match.test(name)) return entry.info;
  }
  return null;
}

/**
 * True si le cookie est un traceur tiers identifié (par son nom), peu importe
 * qu'il soit stocké sur un domaine first-party ou tiers. Définition alignée
 * CNIL : un cookie tiers est déposé par un tiers pour son propre compte.
 */
export function isTrackerCookie(name: string): boolean {
  return identifyCookieVendor(name) !== null;
}
