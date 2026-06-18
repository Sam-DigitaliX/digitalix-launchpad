import type { CheckModule, ScanContext } from '../types.js';

const ANALYTICS_COOKIE_PREFIXES = ['_ga', '_gid', '_fbp', '_fbc', '_gcl', '_ttp', '_li_'];

export const postRejectViolationsCheck: CheckModule = {
  id: 'post-reject-violations',
  category: 'privacy',
  name: 'Respect du Refus de Consentement',
  impact: 'critical',
  gated: true,
  run(ctx: ScanContext) {
    const postReject = ctx.sessions.find((s) => s.phase === 'post-reject');

    if (!postReject) {
      if (ctx.degradedMode) {
        return {
          status: 'info',
          description: 'Pas de CMP détectée — vérification post-refus impossible.',
          rawData: {},
        };
      }
      return {
        status: 'info',
        description: 'Session post-refus non disponible.',
        rawData: {},
      };
    }

    // Check if analytics cookies persist after rejection
    const violatingCookies = postReject.cookies.filter((c) =>
      ANALYTICS_COOKIE_PREFIXES.some((prefix) => c.name.startsWith(prefix))
    );

    // Consent Mode gcs after reject: 'G100' = ad+analytics storage denied (anonymized,
    // cookieless modeling ping — conforme). Any other G1xx = a storage GRANTED despite
    // the reject → real violation. (Previous `includes('11')` was a buggy substring test.)
    const gcsValues = postReject.consentState.gcsValues;
    const hasAnonymizedPings = gcsValues.includes('G100');
    const hasGrantedPings = gcsValues.some((g) => /^G1[01][01]$/.test(g) && g !== 'G100');

    const cookieNames = [...new Set(violatingCookies.map((c) => c.name))];

    if (cookieNames.length === 0 && !hasGrantedPings) {
      if (hasAnonymizedPings) {
        return {
          status: 'pass',
          description: 'Refus respecté. Consent Mode v2 actif : pings Google anonymisés (gcs=G100, sans cookie ni identifiant — modélisation), aucun cookie analytics. Conforme RGPD.',
          rawData: { violatingCookies: [], gcsValues, hasAnonymizedPings: true },
        };
      }

      return {
        status: 'pass',
        description: 'Refus respecté. Aucun cookie analytics ni ping tracking après refus — conforme RGPD.',
        rawData: { violatingCookies: [], gcsValues },
      };
    }

    const issues: string[] = [];
    if (cookieNames.length > 0) {
      issues.push(`${cookieNames.length} cookie(s) analytics encore présent(s) : ${cookieNames.join(', ')}`);
    }
    if (hasGrantedPings) {
      issues.push('pings Google en mode "granted" malgré le refus');
    }

    return {
      status: 'fail',
      description: `Violation RGPD : ${issues.join('. ')}. Le refus de consentement n'est pas correctement appliqué.`,
      businessNote: 'Des cookies analytics persistent après le refus de consentement. C\'est une violation RGPD.',
      rawData: { violatingCookies: cookieNames, gcsValues, hasGrantedPings },
    };
  },
};
