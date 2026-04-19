import type { CheckModule, ScanContext } from '../types.js';

export const capiGoogleCheck: CheckModule = {
  id: 'capi-google',
  category: 'serverside',
  name: 'Google Ads server-side (Enhanced Conversions)',
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
        description: 'sGTM + _gcl_au first-party + Enhanced Conversions détectés — routing Google Ads server-side complet.',
        rawData: { hasSgtm, gclAuServerSet, hasUserData },
      };
    }

    if (hasSgtm && gclAuServerSet) {
      return {
        status: 'pass',
        description: 'sGTM + _gcl_au first-party détectés — Google Ads routé server-side. Enhanced Conversions non détectées (recommandé pour enrichir le matching).',
        rawData: { hasSgtm, gclAuServerSet, hasUserData },
      };
    }

    if (hasSgtm) {
      return {
        status: 'warning',
        description: 'sGTM détecté mais _gcl_au n\'est pas posé en first-party — les conversions Google Ads ne transitent pas par votre serveur.',
        businessNote: 'Configurez le tag Google Ads dans votre container sGTM pour propager _gcl_au en first-party (résiste aux bloqueurs et au capping ITP).',
        rawData: { hasSgtm, gclAuServerSet, hasUserData },
      };
    }

    return {
      status: 'fail',
      description: 'Pas de sGTM détecté — les conversions Google Ads partent en client-side uniquement (vulnérables aux bloqueurs et à ITP).',
      businessNote: 'Mettez en place sGTM avec le tag Google Ads pour routing server-side : meilleure qualité de signal, conversions résistantes aux bloqueurs.',
      rawData: { hasSgtm: false, gclAuServerSet, hasUserData },
    };
  },
};
