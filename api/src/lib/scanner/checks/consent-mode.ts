import type { CheckModule, ScanContext } from '../types.js';

const V2_PARAMS = ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage'];

export const consentModeCheck: CheckModule = {
  id: 'consent-mode',
  category: 'privacy',
  name: 'Google Consent Mode v2',
  impact: 'critical',
  gated: true,
  run(ctx: ScanContext) {
    // Use real consent state from Playwright sessions
    const preConsent = ctx.sessions.find((s) => s.phase === 'pre-consent');
    const postAccept = ctx.sessions.find((s) => s.phase === 'post-accept');
    const postReject = ctx.sessions.find((s) => s.phase === 'post-reject');

    const hasConsentMode = ctx.sessions.some((s) => s.consentState.hasConsentMode);

    if (hasConsentMode && preConsent) {
      const defaultParams = preConsent.consentState.defaultParameters;
      const foundDefault = V2_PARAMS.filter((p) => p in defaultParams);
      const missingDefault = V2_PARAMS.filter((p) => !(p in defaultParams));

      // Check if consent updates properly after accept
      const updatedAfterAccept = postAccept?.consentState.updatedParameters ?? {};
      const grantedAfterAccept = V2_PARAMS.filter((p) => updatedAfterAccept[p] === 'granted');

      // Check gcs values for advanced vs basic mode
      const preGcs = preConsent.consentState.gcsValues;
      const hasAdvancedMode = preGcs.some((g) => g.startsWith('G1'));

      if (foundDefault.length === V2_PARAMS.length) {
        const details: string[] = ['Consent Mode v2 configuré avec les 4 paramètres requis'];

        if (grantedAfterAccept.length > 0) {
          details.push(`${grantedAfterAccept.length} paramètre(s) passé(s) à "granted" après acceptation`);
        }

        if (hasAdvancedMode) {
          details.push('mode Advanced détecté (pings anonymisés sans consentement)');
        }

        // Verify post-reject behavior
        if (postReject) {
          const rejectGcs = postReject.consentState.gcsValues;
          const stillDenied = rejectGcs.every((g) => !g.startsWith('G11'));
          if (stillDenied) {
            details.push('vérification post-refus OK');
          }
        }

        return {
          status: 'pass',
          description: details.join('. ') + '.',
          rawData: { defaultParams, updatedAfterAccept, gcsValues: preGcs, hasAdvancedMode },
        };
      }

      return {
        status: 'warning',
        description: `Consent Mode détecté mais incomplet — paramètre(s) manquant(s) : ${missingDefault.join(', ')}. La v2 requiert les 4 paramètres.`,
        businessNote: 'Consent Mode v2 incomplet — certains paramètres obligatoires sont manquants.',
        rawData: { defaultParams, foundDefault, missingDefault, hasAdvancedMode },
      };
    }

    // Fallback: check inline scripts for consent default pattern
    const CONSENT_DEFAULT_PATTERN = /gtag\s*\(\s*['"]consent['"]\s*,\s*['"]default['"]/;

    for (const script of ctx.inlineScripts) {
      if (CONSENT_DEFAULT_PATTERN.test(script)) {
        const foundParams = V2_PARAMS.filter((p) => script.includes(p));
        const missingParams = V2_PARAMS.filter((p) => !script.includes(p));

        if (missingParams.length === 0) {
          return {
            status: 'pass',
            description: 'Consent Mode v2 détecté avec les 4 paramètres requis (détection HTML).',
            rawData: { parameters: foundParams, detectionMethod: 'html' },
          };
        }

        return {
          status: 'warning',
          description: `Consent Mode détecté mais incomplet — paramètre(s) manquant(s) : ${missingParams.join(', ')}.`,
          businessNote: 'Consent Mode v2 incomplet — certains paramètres obligatoires sont manquants.',
          rawData: { parameters: foundParams, missingParams, detectionMethod: 'html' },
        };
      }
    }

    return {
      status: 'fail',
      description: 'Google Consent Mode non détecté — requis depuis mars 2024 pour Google Ads. Les conversions ne sont pas modélisées.',
      businessNote: 'Sans Consent Mode v2, Google Ads ne peut pas modéliser les conversions des utilisateurs qui refusent les cookies.',
      rawData: { hasConsentMode: false },
    };
  },
};
