import type { CheckModule, ScanContext } from '../types.js';

const ANALYTICS_COOKIE_PREFIXES = ['_ga', '_gid', '_fbp', '_fbc', '_gcl', '_ttp', '_li_'];
const TRACKING_DOMAINS = [
  'google-analytics.com', 'analytics.google.com',
  'facebook.com/tr', 'connect.facebook.net',
  'analytics.tiktok.com', 'snap.licdn.com',
  'bat.bing.com', 'ads.linkedin.com',
];

export const preConsentViolationsCheck: CheckModule = {
  id: 'pre-consent-violations',
  category: 'privacy',
  name: 'Violations Pré-Consentement',
  impact: 'critical',
  gated: true,
  run(ctx: ScanContext) {
    const preConsent = ctx.sessions.find((s) => s.phase === 'pre-consent');

    if (!preConsent) {
      return {
        status: 'info',
        description: 'Session pré-consentement non disponible.',
        rawData: {},
      };
    }

    // Check cookies set before consent
    const violatingCookies = preConsent.cookies.filter((c) =>
      ANALYTICS_COOKIE_PREFIXES.some((prefix) => c.name.startsWith(prefix))
    );

    // Check tracking requests fired before consent
    const violatingRequests = preConsent.networkRequests.filter((r) =>
      TRACKING_DOMAINS.some((domain) => r.url.includes(domain))
    );

    const cookieNames = [...new Set(violatingCookies.map((c) => c.name))];
    const requestDomains = [...new Set(violatingRequests.map((r) => {
      try { return new URL(r.url).hostname; } catch { return r.url; }
    }))];

    if (cookieNames.length === 0 && requestDomains.length === 0) {
      return {
        status: 'pass',
        description: 'Aucun cookie analytics ni requête tracking avant consentement — conforme RGPD.',
        rawData: { violatingCookies: [], violatingRequests: [] },
      };
    }

    const issues: string[] = [];
    if (cookieNames.length > 0) {
      issues.push(`${cookieNames.length} cookie(s) analytics (${cookieNames.join(', ')})`);
    }
    if (requestDomains.length > 0) {
      issues.push(`${requestDomains.length} requête(s) tracking (${requestDomains.join(', ')})`);
    }

    return {
      status: 'fail',
      description: `Violation RGPD : ${issues.join(' et ')} détecté(s) AVANT consentement. Les données sont collectées sans accord de l'utilisateur.`,
      businessNote: 'Des trackers se lancent avant le consentement utilisateur. C\'est une violation RGPD détectable lors d\'un contrôle CNIL.',
      rawData: { violatingCookies: cookieNames, violatingRequests: requestDomains },
    };
  },
};
