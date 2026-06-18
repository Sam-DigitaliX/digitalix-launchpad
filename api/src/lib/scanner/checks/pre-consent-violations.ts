import type { CheckModule, ScanContext } from '../types.js';
import { decodeGcsList } from '../consent-signals.js';

const ANALYTICS_COOKIE_PREFIXES = ['_ga', '_gid', '_fbp', '_fbc', '_gcl', '_ttp', '_li_'];
const TRACKING_DOMAINS = [
  'google-analytics.com', 'analytics.google.com',
  'facebook.com/tr', 'connect.facebook.net',
  'analytics.tiktok.com', 'snap.licdn.com',
  'bat.bing.com', 'ads.linkedin.com',
];

function isProbe(url: string, method: string): boolean {
  // Adblocker-detection probes (a=adblocker_check) and HEAD requests carry no data.
  return method === 'HEAD' || url.includes('adblocker_check');
}

export const preConsentViolationsCheck: CheckModule = {
  id: 'pre-consent-violations',
  category: 'privacy',
  name: 'Signaux de consentement (avant consentement)',
  impact: 'high',
  gated: true,
  run(ctx: ScanContext) {
    const preConsent = ctx.sessions.find((s) => s.phase === 'pre-consent');
    const postAccept = ctx.sessions.find((s) => s.phase === 'post-accept');

    if (!preConsent) {
      return { status: 'info', description: 'Session pré-consentement non disponible.', rawData: {} };
    }

    const consentModeActive = ctx.sessions.some((s) => s.consentState.hasConsentMode);
    const gcsBefore = decodeGcsList(preConsent.consentState.gcsValues);
    const gcsAfterAccept = postAccept ? decodeGcsList(postAccept.consentState.gcsValues) : [];
    const gcdBefore = [...new Set(preConsent.consentState.gcdValues)];

    const cookieNames = [...new Set(
      preConsent.cookies.filter((c) => ANALYTICS_COOKIE_PREFIXES.some((p) => c.name.startsWith(p))).map((c) => c.name)
    )];
    const trackingReqs = preConsent.networkRequests.filter(
      (r) => TRACKING_DOMAINS.some((d) => r.url.includes(d)) && !isProbe(r.url, r.method)
    );
    const reqDomains = [...new Set(trackingReqs.map((r) => { try { return new URL(r.url).hostname; } catch { return r.url; } }))];

    const rawData = {
      consentModeActive,
      gcsBefore,
      gcsAfterAccept,
      gcdBefore,
      cookies: cookieNames,
      trackingRequests: reqDomains,
    };

    // Filet de sécurité : non-conformité flagrante = tracking identifiant avant
    // consentement ET aucun Consent Mode détecté. (Seul cas où on rend un verdict.)
    if (!consentModeActive && (cookieNames.length > 0 || reqDomains.length > 0)) {
      const bits: string[] = [];
      if (cookieNames.length) bits.push(`cookies analytics (${cookieNames.join(', ')})`);
      if (reqDomains.length) bits.push(`requêtes tracking (${reqDomains.join(', ')})`);
      return {
        status: 'warning',
        description: `Tracking identifiant avant consentement (${bits.join(' + ')}) ET aucun Consent Mode détecté. Point de conformité RGPD à corriger.`,
        businessNote: 'Des traceurs se lancent avant le consentement, sans Consent Mode pour les gater. À traiter en priorité (risque lors d\'un contrôle CNIL).',
        rawData,
      };
    }

    // Sinon : informatif, décodage pédagogique des signaux de consentement, sans verdict.
    const beforeStr = gcsBefore.length ? gcsBefore.map((d) => `${d.gcs} = ${d.label}`).join(' · ') : 'aucun signal gcs capté au scan';
    const afterStr = gcsAfterAccept.length ? gcsAfterAccept.map((d) => `${d.gcs} = ${d.label}`).join(' · ') : '—';
    const gcdStr = gcdBefore.length ? gcdBefore.join(', ') : '—';

    return {
      status: 'info',
      description: `Signaux de consentement (gcs) observés au scan — AVANT consentement : ${beforeStr}. APRÈS acceptation : ${afterStr}. gcd (défaut, brut) : ${gcdStr}.`,
      businessNote: `Lecture prudente : ces signaux reflètent l'environnement du scan, pas forcément un visiteur réel — le default de consentement (et donc les cookies posés avant interaction) dépend de la géolocalisation du visiteur.${consentModeActive ? ' Consent Mode v2 détecté : un gcs=G100 avant consentement = ping anonymisé (modélisation, toléré CNIL).' : ''} À confirmer en conditions réelles (DevTools, géo EU).`,
      rawData,
    };
  },
};
