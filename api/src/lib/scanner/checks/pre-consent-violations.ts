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

    // Analytics cookies set before consent = identifying storage = real violation.
    const violatingCookies = preConsent.cookies.filter((c) =>
      ANALYTICS_COOKIE_PREFIXES.some((prefix) => c.name.startsWith(prefix))
    );

    // Tracking requests before consent — BUT a Google Consent Mode "fully denied"
    // ping (gcs=G100: ad+analytics storage denied) is cookieless & anonymous
    // (modeling), NOT a violation. Only count requests that are NOT anonymized.
    const trackingRequests = preConsent.networkRequests.filter((r) =>
      TRACKING_DOMAINS.some((domain) => r.url.includes(domain))
    );
    const anonymizedPings: string[] = [];
    const violatingRequests = trackingRequests.filter((r) => {
      // Adblocker-detection probes (a=adblocker_check) and HEAD requests carry no
      // data and aren't tracking — never a violation.
      if (r.method === 'HEAD' || r.url.includes('a=adblocker_check') || r.url.includes('adblocker_check')) return false;
      let gcs: string | null = null;
      try { gcs = new URL(r.url).searchParams.get('gcs'); } catch { /* keep null */ }
      if (gcs === 'G100') {
        try { anonymizedPings.push(new URL(r.url).hostname); } catch { /* ignore */ }
        return false; // anonymized Consent Mode ping — conforme
      }
      return true; // no gcs, or a storage granted before consent → real violation
    });

    const consentModeActive = ctx.sessions.some((s) => s.consentState.hasConsentMode);

    const cookieNames = [...new Set(violatingCookies.map((c) => c.name))];
    const requestDomains = [...new Set(violatingRequests.map((r) => {
      try { return new URL(r.url).hostname; } catch { return r.url; }
    }))];

    if (cookieNames.length === 0 && requestDomains.length === 0) {
      const anon = [...new Set(anonymizedPings)];
      if (anon.length > 0) {
        return {
          status: 'pass',
          description: `Conforme. Aucun cookie ni hit identifiant avant consentement. Les pings Google observés sont anonymisés (Consent Mode v2, gcs=G100 : sans cookie ni identifiant — modélisation tolérée CNIL).`,
          rawData: { violatingCookies: [], violatingRequests: [], anonymizedPings: anon },
        };
      }
      return {
        status: 'pass',
        description: 'Aucun cookie analytics ni requête tracking avant consentement — conforme RGPD.',
        rawData: { violatingCookies: [], violatingRequests: [], anonymizedPings: [] },
      };
    }

    const rawDataOut = {
      violatingCookies: cookieNames,
      violatingRequests: requestDomains,
      anonymizedPings: [...new Set(anonymizedPings)],
      consentModeActive,
    };

    // Real tracking requests (non-probe, non-anonymized) before consent = hard violation.
    if (requestDomains.length > 0) {
      const issues: string[] = [];
      if (cookieNames.length > 0) issues.push(`${cookieNames.length} cookie(s) analytics (${cookieNames.join(', ')})`);
      issues.push(`${requestDomains.length} requête(s) tracking (${requestDomains.join(', ')})`);
      return {
        status: 'fail',
        description: `Violation RGPD : ${issues.join(' et ')} AVANT consentement. Données collectées sans accord de l'utilisateur.`,
        businessNote: 'Des trackers se lancent avant le consentement. Violation RGPD détectable lors d\'un contrôle CNIL. (Pings anonymisés Consent Mode gcs=G100 et sondes adblocker non comptés.)',
        rawData: rawDataOut,
      };
    }

    // Cookie-only findings under an active Consent Mode v2 : un cookie analytics observé
    // avant consentement peut refléter le default de consentement (géo) de l'environnement
    // de scan — un visiteur EU "denied" n'en obtient pas. Warning nuancé, pas un fail dur.
    if (consentModeActive) {
      return {
        status: 'warning',
        description: `Cookies analytics observés avant consentement (${cookieNames.join(', ')}) — mais Consent Mode v2 est actif. Peut refléter le default de consentement de l'environnement de scan (géo) plutôt qu'une vraie fuite : un visiteur EU (default "denied") n'obtient normalement pas ces cookies. À vérifier en conditions réelles (DevTools EU, avant consentement).`,
        businessNote: 'En Consent Mode v2 "denied" strict, gtag ne doit pas écrire de cookie analytics avant consentement. Vérifiez en conditions réelles EU : si c\'est le cas pour de vrais visiteurs, à corriger côté CMP ; sinon c\'est un artefact d\'environnement de scan.',
        rawData: rawDataOut,
      };
    }

    return {
      status: 'fail',
      description: `Violation RGPD : ${cookieNames.length} cookie(s) analytics (${cookieNames.join(', ')}) posé(s) AVANT consentement, sans Consent Mode pour les gater.`,
      businessNote: 'Des cookies analytics sont posés avant le consentement, sans Consent Mode. Violation RGPD détectable lors d\'un contrôle CNIL.',
      rawData: rawDataOut,
    };
  },
};
