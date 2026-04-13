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
          description: 'Pas de CMP detectee — verification post-refus impossible.',
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

    // Check Consent Mode: if gcs starts with G1, pings are anonymized (OK for Advanced mode)
    const gcsValues = postReject.consentState.gcsValues;
    const hasAnonymizedPings = gcsValues.some((g) => g.startsWith('G1'));
    const hasGrantedPings = gcsValues.some((g) => g.includes('11'));

    const cookieNames = [...new Set(violatingCookies.map((c) => c.name))];

    if (cookieNames.length === 0 && !hasGrantedPings) {
      if (hasAnonymizedPings) {
        return {
          status: 'pass',
          description: 'Refus respecte. Consent Mode Advanced actif : pings Google anonymises (sans identifiant), aucun cookie analytics.',
          rawData: { violatingCookies: [], gcsValues, hasAnonymizedPings: true },
        };
      }

      return {
        status: 'pass',
        description: 'Refus respecte. Aucun cookie analytics ni ping tracking apres refus — conforme RGPD.',
        rawData: { violatingCookies: [], gcsValues },
      };
    }

    const issues: string[] = [];
    if (cookieNames.length > 0) {
      issues.push(`${cookieNames.length} cookie(s) analytics encore present(s) : ${cookieNames.join(', ')}`);
    }
    if (hasGrantedPings) {
      issues.push('pings Google en mode "granted" malgre le refus');
    }

    return {
      status: 'fail',
      description: `Violation RGPD : ${issues.join('. ')}. Le refus de consentement n'est pas correctement applique.`,
      rawData: { violatingCookies: cookieNames, gcsValues, hasGrantedPings },
    };
  },
};
