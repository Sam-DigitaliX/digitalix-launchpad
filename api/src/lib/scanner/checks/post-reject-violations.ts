import type { CheckModule, ScanContext } from '../types.js';
import { decodeGcsList } from '../consent-signals.js';

const ANALYTICS_COOKIE_PREFIXES = ['_ga', '_gid', '_fbp', '_fbc', '_gcl', '_ttp', '_li_'];

export const postRejectViolationsCheck: CheckModule = {
  id: 'post-reject-violations',
  category: 'privacy',
  name: 'Signaux de consentement (après refus)',
  impact: 'high',
  gated: true,
  run(ctx: ScanContext) {
    const postReject = ctx.sessions.find((s) => s.phase === 'post-reject');

    if (!postReject) {
      return {
        status: 'info',
        description: ctx.degradedMode
          ? 'Pas de CMP détectée — vérification post-refus impossible.'
          : 'Session post-refus non disponible.',
        rawData: {},
      };
    }

    const consentModeActive = ctx.sessions.some((s) => s.consentState.hasConsentMode);
    const gcsAfterReject = decodeGcsList(postReject.consentState.gcsValues);
    const gcdAfterReject = [...new Set(postReject.consentState.gcdValues)];

    const cookieNames = [...new Set(
      postReject.cookies.filter((c) => ANALYTICS_COOKIE_PREFIXES.some((p) => c.name.startsWith(p))).map((c) => c.name)
    )];
    // gcs avec une storage "granted" après refus (≠ G100).
    const grantedAfterReject = postReject.consentState.gcsValues.some((g) => /^G1[01][01]$/.test(g) && g !== 'G100');

    const rawData = {
      consentModeActive,
      gcsAfterReject,
      gcdAfterReject,
      cookies: cookieNames,
      grantedAfterReject,
    };

    // Filet de sécurité : refus manifestement ignoré ET aucun Consent Mode → verdict.
    if (!consentModeActive && (cookieNames.length > 0 || grantedAfterReject)) {
      const bits: string[] = [];
      if (cookieNames.length) bits.push(`cookies analytics (${cookieNames.join(', ')})`);
      if (grantedAfterReject) bits.push('pings Google en mode "granted"');
      return {
        status: 'warning',
        description: `Après refus : ${bits.join(' + ')}, ET aucun Consent Mode détecté. Le refus ne semble pas appliqué — point de conformité RGPD à corriger.`,
        businessNote: 'Des traceurs persistent après un refus, sans Consent Mode. À traiter en priorité (risque lors d\'un contrôle CNIL).',
        rawData,
      };
    }

    // Sinon : informatif, décodage pédagogique, sans verdict.
    const gcsStr = gcsAfterReject.length ? gcsAfterReject.map((d) => `${d.gcs} = ${d.label}`).join(' · ') : 'aucun signal gcs capté au scan';
    const gcdStr = gcdAfterReject.length ? gcdAfterReject.join(', ') : '—';

    return {
      status: 'info',
      description: `Signaux de consentement (gcs) après refus : ${gcsStr}. gcd (brut) : ${gcdStr}.`,
      businessNote: `Lecture prudente : ces signaux reflètent l'environnement du scan, pas forcément un visiteur réel.${consentModeActive ? ' Consent Mode v2 détecté : un gcs=G100 après refus = comportement attendu (pings anonymisés, aucun tracking identifiant).' : ''} À confirmer en conditions réelles (DevTools, géo EU, après refus).`,
      rawData,
    };
  },
};
