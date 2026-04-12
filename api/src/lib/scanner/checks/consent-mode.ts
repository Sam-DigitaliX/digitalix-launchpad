import type { CheckModule, ScanContext } from '../types.js';

const CONSENT_DEFAULT_PATTERN = /gtag\s*\(\s*['"]consent['"]\s*,\s*['"]default['"]/;
const V2_PARAMS = ['ad_storage', 'ad_user_data', 'ad_personalization', 'analytics_storage'];
const WAIT_FOR_UPDATE_PATTERN = /wait_for_update/;

export const consentModeCheck: CheckModule = {
  id: 'consent-mode',
  category: 'privacy',
  name: 'Google Consent Mode v2',
  impact: 'critical',
  gated: true,
  run(ctx: ScanContext) {
    let hasConsentDefault = false;
    const foundParams: string[] = [];
    let hasWaitForUpdate = false;

    for (const script of ctx.inlineScripts) {
      if (CONSENT_DEFAULT_PATTERN.test(script)) {
        hasConsentDefault = true;

        for (const param of V2_PARAMS) {
          if (script.includes(param)) {
            foundParams.push(param);
          }
        }

        if (WAIT_FOR_UPDATE_PATTERN.test(script)) {
          hasWaitForUpdate = true;
        }
      }
    }

    const uniqueParams = [...new Set(foundParams)];

    if (!hasConsentDefault) {
      return {
        status: 'fail',
        description: 'Google Consent Mode non detecte — requis depuis mars 2024 pour Google Ads. Les conversions ne sont pas modelisees.',
        rawData: { hasConsentDefault: false, parameters: [], hasWaitForUpdate: false },
      };
    }

    const missingParams = V2_PARAMS.filter((p) => !uniqueParams.includes(p));

    if (missingParams.length === 0) {
      return {
        status: 'pass',
        description: `Consent Mode v2 configure avec les 4 parametres requis.${hasWaitForUpdate ? ' wait_for_update actif.' : ''}`,
        rawData: { hasConsentDefault: true, parameters: uniqueParams, hasWaitForUpdate },
      };
    }

    return {
      status: 'warning',
      description: `Consent Mode detecte mais incomplet — parametre(s) manquant(s) : ${missingParams.join(', ')}. La v2 requiert les 4 parametres.`,
      rawData: { hasConsentDefault: true, parameters: uniqueParams, missingParams, hasWaitForUpdate },
    };
  },
};
