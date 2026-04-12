import type { CheckModule, ScanContext } from '../types.js';

const GTAG_CONFIG_PATTERN = /gtag\s*\(\s*['"]config['"]\s*,\s*['"](G-[A-Z0-9]+)['"]/g;
const GTAG_SCRIPT_PATTERN = /googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9]+)/;

function findGa4Ids(ctx: ScanContext): string[] {
  const ids = new Set<string>();

  for (const src of ctx.scripts) {
    const match = GTAG_SCRIPT_PATTERN.exec(src);
    if (match) ids.add(match[1]);
  }

  for (const script of ctx.inlineScripts) {
    let m: RegExpExecArray | null;
    while ((m = GTAG_CONFIG_PATTERN.exec(script)) !== null) {
      ids.add(m[1]);
    }
    GTAG_CONFIG_PATTERN.lastIndex = 0;
  }

  return [...ids];
}

export const ga4Check: CheckModule = {
  id: 'ga4',
  category: 'tracking',
  name: 'Google Analytics 4',
  impact: 'high',
  gated: false,
  run(ctx: ScanContext) {
    const ids = findGa4Ids(ctx);

    if (ids.length > 0) {
      return {
        status: 'pass',
        description: `GA4 detecte : ${ids.join(', ')}.`,
        rawData: { measurementIds: ids },
      };
    }

    // GTM present but no direct GA4 — likely loaded via GTM
    const hasGtm = ctx.scripts.some((s) => s.includes('googletagmanager.com/gtm.js'));
    if (hasGtm) {
      return {
        status: 'info',
        description: 'GA4 non detecte en direct mais GTM est present — GA4 est probablement charge via GTM.',
        rawData: { measurementIds: [], viaGtm: true },
      };
    }

    return {
      status: 'fail',
      description: 'Aucune implementation GA4 detectee.',
      rawData: { measurementIds: [] },
    };
  },
};
