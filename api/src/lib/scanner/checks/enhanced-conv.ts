import type { CheckModule, ScanContext } from '../types.js';

export const enhancedConvCheck: CheckModule = {
  id: 'enhanced-conv',
  category: 'tracking',
  name: 'Enhanced Conversions',
  impact: 'critical',
  gated: true,
  run(ctx: ScanContext) {
    let hasUserData = false;
    let hasEnhancedConversions = false;
    let hasGtagSetUserData = false;

    for (const script of ctx.inlineScripts) {
      if (script.includes('enhanced_conversions')) hasEnhancedConversions = true;
      if (script.includes('user_data')) hasUserData = true;
      if (/gtag\s*\(\s*['"]set['"]\s*,\s*['"]user_data['"]/.test(script)) hasGtagSetUserData = true;
    }

    if (hasGtagSetUserData || hasEnhancedConversions) {
      return {
        status: 'pass',
        description: 'Enhanced Conversions configure — les donnees utilisateur sont transmises pour ameliorer l\'attribution.',
        rawData: { hasEnhancedConversions, hasUserData, hasGtagSetUserData },
      };
    }

    // If GTM is present, it may be configured server-side
    const hasGtm = ctx.scripts.some((s) => s.includes('googletagmanager.com/gtm.js'));
    if (hasGtm && hasUserData) {
      return {
        status: 'info',
        description: 'Donnees user_data detectees avec GTM — Enhanced Conversions probablement configure dans GTM.',
        rawData: { hasEnhancedConversions, hasUserData, hasGtagSetUserData, viaGtm: true },
      };
    }

    return {
      status: 'fail',
      description: 'Enhanced Conversions non detecte — perte potentielle de donnees d\'attribution Google Ads.',
      rawData: { hasEnhancedConversions: false, hasUserData: false, hasGtagSetUserData: false },
    };
  },
};
