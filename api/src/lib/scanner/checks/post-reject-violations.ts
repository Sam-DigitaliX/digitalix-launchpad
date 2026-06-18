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
    const consentModeActive = ctx.sessions.some((s) => s.consentState.hasConsentMode);

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

    const rawDataOut = { violatingCookies: cookieNames, gcsValues, hasGrantedPings, consentModeActive };

    // Pings "granted" malgré le refus = vraie violation (le refus est ignoré pour les hits).
    if (hasGrantedPings) {
      const issues: string[] = [];
      if (cookieNames.length > 0) issues.push(`${cookieNames.length} cookie(s) analytics : ${cookieNames.join(', ')}`);
      issues.push('pings Google en mode "granted" malgré le refus');
      return {
        status: 'fail',
        description: `Violation RGPD : ${issues.join('. ')}. Le refus de consentement n'est pas appliqué.`,
        businessNote: 'Des hits Google partent en mode "granted" malgré le refus. Violation RGPD.',
        rawData: rawDataOut,
      };
    }

    // Cookies seuls après refus, sous Consent Mode v2 actif (pings non "granted") → warning
    // nuancé : peut refléter le default de consentement (géo) de l'environnement de scan.
    if (consentModeActive) {
      return {
        status: 'warning',
        description: `Cookies analytics observés après refus (${cookieNames.join(', ')}) — mais Consent Mode v2 est actif et les pings ne sont pas "granted". Peut refléter le default de consentement de l'environnement de scan (géo) : un visiteur EU qui refuse n'obtient normalement pas ces cookies. À vérifier en conditions réelles (DevTools EU, après refus).`,
        businessNote: 'Après un refus, gtag ne doit pas écrire de cookie analytics. Vérifiez en conditions réelles EU : si c\'est le cas, à corriger côté CMP ; sinon c\'est un artefact d\'environnement de scan.',
        rawData: rawDataOut,
      };
    }

    return {
      status: 'fail',
      description: `Violation RGPD : ${cookieNames.length} cookie(s) analytics encore présent(s) après refus (${cookieNames.join(', ')}), sans Consent Mode. Le refus n'est pas appliqué.`,
      businessNote: 'Des cookies analytics persistent après le refus de consentement, sans Consent Mode. Violation RGPD.',
      rawData: rawDataOut,
    };
  },
};
