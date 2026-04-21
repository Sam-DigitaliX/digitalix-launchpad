import type { CheckModule, ScanContext } from '../types.js';
import { detectServerManagedCookies } from '../server-managed-cookies.js';

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

    // Signal fort : FPGCLAW (Google Ads server-managed cookies, sGTM first-party mode)
    const smc = detectServerManagedCookies(ctx);
    const hasFpgclaw = smc.hasFpgclaw;

    let hasUserData = false;
    for (const script of ctx.inlineScripts) {
      if (script.includes('user_data') || script.includes('enhanced_conversions')) {
        hasUserData = true;
        break;
      }
    }

    const rawData = { hasSgtm, gclAuServerSet, hasFpgclaw, hasUserData };

    // FPGCLAW = preuve définitive de Google Ads en sGTM server-managed (plus fort que _gcl_au first-party)
    if (hasFpgclaw && hasUserData) {
      return {
        status: 'pass',
        description: 'FPGCLAW détecté (sGTM server-managed) + Enhanced Conversions — routing Google Ads server-side complet et au standard maximal.',
        rawData,
      };
    }

    if (hasFpgclaw) {
      return {
        status: 'pass',
        description: 'FPGCLAW détecté — conversions Google Ads en sGTM server-managed (durée 2 ans, bypass ITP). Enhanced Conversions non détectées côté client (peuvent être actives server-side, vérification manuelle recommandée).',
        rawData,
      };
    }

    if (hasSgtm && gclAuServerSet && hasUserData) {
      return {
        status: 'pass',
        description: 'sGTM + _gcl_au first-party + Enhanced Conversions détectés — routing Google Ads server-side. Note : passer en mode "Server-managed cookies" (FPGCLAW) pour durée préservée sur Safari ITP.',
        rawData,
      };
    }

    if (hasSgtm && gclAuServerSet) {
      return {
        status: 'pass',
        description: 'sGTM + _gcl_au first-party détectés — Google Ads routé server-side. Enhanced Conversions non détectées côté client.',
        rawData,
      };
    }

    if (hasSgtm) {
      return {
        status: 'warning',
        description: 'sGTM détecté mais ni _gcl_au first-party ni FPGCLAW — le tag Google Ads ne transite probablement pas par votre serveur.',
        businessNote: 'Configurez le tag Google Ads dans votre container sGTM pour propager _gcl_au en first-party, et activez "Server-managed cookies" pour générer FPGCLAW (résiste aux adblockers et à l\'ITP Safari).',
        rawData,
      };
    }

    return {
      status: 'fail',
      description: 'Pas de sGTM détecté — les conversions Google Ads partent en client-side uniquement (vulnérables aux adblockers, durée cappée à 7 jours sur Safari via ITP).',
      businessNote: 'Mettez en place sGTM avec le tag Google Ads en mode "Server-managed cookies" (FPGCLAW) : meilleure qualité de signal, conversions résistantes aux bloqueurs, durée 2 ans préservée.',
      rawData,
    };
  },
};
