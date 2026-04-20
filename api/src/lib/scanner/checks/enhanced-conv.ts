import type { CheckModule, ScanContext } from '../types.js';

// Strict inline signatures (narrow, minimizes false positives from unrelated code)
const GTAG_SET_USER_DATA = /gtag\s*\(\s*['"]set['"]\s*,\s*['"]user_data['"]/;
const ENHANCED_CONVERSIONS_CONFIG = /allow_enhanced_conversions|enhanced_conversions\s*:\s*true/;

interface NetworkSignal {
  pagead: boolean;       // /pagead/conversion with em/em_hash params (client EC)
  gCollect: boolean;     // /g/collect with user_data.em_hash params (GA4 EC)
  sampleUrl: string | null;
}

function scanNetworkForEc(ctx: ScanContext): NetworkSignal {
  let pagead = false;
  let gCollect = false;
  let sampleUrl: string | null = null;

  for (const session of ctx.sessions) {
    for (const req of session.networkRequests) {
      const url = req.url;

      // Google Ads conversion endpoint carrying Enhanced Conversions payload
      const isPagead = url.includes('/pagead/conversion') || url.includes('/pagead/viewthroughconversion');
      if (isPagead) {
        try {
          const params = new URL(url).searchParams;
          // `em` or `em_hash` (email hashed SHA-256) is the Enhanced Conversions signal
          if (params.has('em') || params.has('em_hash') || [...params.keys()].some((k) => k.startsWith('em.'))) {
            pagead = true;
            sampleUrl ??= url;
          }
        } catch {
          // invalid URL, skip
        }
      }

      // GA4 /g/collect with user_data.em_hash (EC relayed via GA4)
      if (url.includes('/g/collect') || url.includes('/j/collect')) {
        try {
          const params = new URL(url).searchParams;
          if ([...params.keys()].some((k) => k === 'em' || k.startsWith('em.') || k.includes('user_data') || k === 'uid')) {
            gCollect = true;
            sampleUrl ??= url;
          }
        } catch {
          // invalid URL, skip
        }
      }
    }
  }

  return { pagead, gCollect, sampleUrl };
}

export const enhancedConvCheck: CheckModule = {
  id: 'enhanced-conv',
  category: 'tracking',
  name: 'Enhanced Conversions',
  impact: 'high',
  gated: true,
  run(ctx: ScanContext) {
    // Strict inline scan
    let hasGtagSetUserData = false;
    let hasEcConfigPattern = false;
    for (const script of ctx.inlineScripts) {
      if (GTAG_SET_USER_DATA.test(script)) hasGtagSetUserData = true;
      if (ENHANCED_CONVERSIONS_CONFIG.test(script)) hasEcConfigPattern = true;
    }

    // Network scan — the authoritative signal (hashed PII travelling with the conversion hit)
    const network = scanNetworkForEc(ctx);

    // Cross-reference other checks' signals
    const gtmSrc = ctx.scripts.find((s) => s.includes('gtm.js?id=GTM-'));
    const hasSgtm = gtmSrc ? !gtmSrc.includes('googletagmanager.com') : false;
    const hasGtm = !!gtmSrc;

    const rawData = {
      hasGtagSetUserData,
      hasEcConfigPattern,
      networkPagead: network.pagead,
      networkGCollect: network.gCollect,
      sampleUrl: network.sampleUrl,
      hasGtm,
      hasSgtm,
    };

    // Strongest signal: real EC payload in outgoing conversion requests
    if (network.pagead || network.gCollect) {
      const channel = network.pagead && network.gCollect
        ? 'Google Ads + GA4'
        : network.pagead ? 'Google Ads' : 'GA4';
      return {
        status: 'pass',
        description: `Enhanced Conversions détecté dans les requêtes ${channel} (donnée utilisateur hashée transmise avec la conversion).`,
        rawData,
      };
    }

    // Inline signatures — clean setup without sGTM
    if (hasGtagSetUserData || hasEcConfigPattern) {
      return {
        status: 'pass',
        description: 'Enhanced Conversions configuré côté client (gtag set user_data détecté).',
        rawData,
      };
    }

    // sGTM or GTM present — EC might be configured server-side (opaque to scan)
    if (hasSgtm) {
      return {
        status: 'info',
        description: 'Enhanced Conversions non détecté côté client. sGTM présent — EC peut être configuré server-side (non visible depuis un audit externe). Vérification manuelle dans votre container sGTM recommandée.',
        businessNote: 'Si vos conversions Google Ads ne reçoivent pas de user_data hashé, vous perdez 15-30% d\'attribution. Activez Enhanced Conversions for Web dans votre tag Google Ads (sGTM ou GTM).',
        rawData,
      };
    }

    if (hasGtm) {
      return {
        status: 'info',
        description: 'Enhanced Conversions non détecté dans les requêtes sortantes. GTM présent — EC peut être configuré dans un tag GTM déclenché sur une page non scannée (ex. confirmation de commande).',
        businessNote: 'Si vos conversions Google Ads ne reçoivent pas de user_data hashé, vous perdez 15-30% d\'attribution. Activez Enhanced Conversions for Web dans GTM.',
        rawData,
      };
    }

    return {
      status: 'fail',
      description: 'Enhanced Conversions non détecté (ni dans les scripts, ni dans les requêtes de conversion). Aucun tag GTM ou sGTM non plus.',
      businessNote: 'Sans Enhanced Conversions, Google Ads perd 15-30% des données de conversion — campagnes sous-optimisées, moins de signaux pour le machine learning.',
      rawData,
    };
  },
};
