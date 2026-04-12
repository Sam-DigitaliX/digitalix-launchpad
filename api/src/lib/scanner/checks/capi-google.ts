import type { CheckModule, ScanContext } from '../types.js';

export const capiGoogleCheck: CheckModule = {
  id: 'capi-google',
  category: 'serverside',
  name: 'Google Server-Side API',
  impact: 'high',
  gated: true,
  run(ctx: ScanContext) {
    // Detect sGTM: GTM loaded from non-Google domain
    const gtmSrc = ctx.scripts.find((s) => s.includes('gtm.js?id=GTM-'));
    const hasSgtm = gtmSrc ? !gtmSrc.includes('googletagmanager.com') : false;

    const gclAuServerSet = ctx.cookies.some((c) => c.name === '_gcl_au' && !c.isThirdParty);

    let hasUserData = false;
    for (const script of ctx.inlineScripts) {
      if (script.includes('user_data') || script.includes('enhanced_conversions')) {
        hasUserData = true;
        break;
      }
    }

    if (hasSgtm && gclAuServerSet && hasUserData) {
      return {
        status: 'pass',
        description: 'sGTM detecte avec _gcl_au server-side et enhanced conversions — tracking Google server-side complet.',
        rawData: { hasSgtm, gclAuServerSet, hasUserData },
      };
    }

    if (hasSgtm && gclAuServerSet) {
      return {
        status: 'pass',
        description: 'sGTM detecte avec _gcl_au pose en server-side.',
        rawData: { hasSgtm, gclAuServerSet, hasUserData },
      };
    }

    if (hasSgtm) {
      return {
        status: 'warning',
        description: 'sGTM detecte mais _gcl_au non pose en server-side. Configuration incomplete.',
        rawData: { hasSgtm, gclAuServerSet, hasUserData },
      };
    }

    return {
      status: 'fail',
      description: 'Pas de tracking Google server-side detecte.',
      rawData: { hasSgtm: false, gclAuServerSet, hasUserData },
    };
  },
};
