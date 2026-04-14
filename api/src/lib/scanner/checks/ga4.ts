import type { CheckModule, ScanContext } from '../types.js';

const GTAG_CONFIG_PATTERN = /gtag\s*\(\s*['"]config['"]\s*,\s*['"](G-[A-Z0-9]+)['"]/g;
const GTAG_SCRIPT_PATTERN = /googletagmanager\.com\/gtag\/js\?id=(G-[A-Z0-9]+)/;

function findGa4FromNetwork(ctx: ScanContext): string[] {
  const ids = new Set<string>();

  for (const session of ctx.sessions) {
    for (const req of session.networkRequests) {
      // Direct gtag.js loading
      const match = GTAG_SCRIPT_PATTERN.exec(req.url);
      if (match) ids.add(match[1]);

      // /g/collect or /j/collect requests contain tid parameter
      if (req.url.includes('/g/collect') || req.url.includes('/j/collect')) {
        try {
          const params = new URL(req.url).searchParams;
          const tid = params.get('tid');
          if (tid?.startsWith('G-')) ids.add(tid);
        } catch {
          // continue
        }
      }
    }
  }

  return [...ids];
}

function findGa4FromHtml(ctx: ScanContext): string[] {
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
    // Prefer network-based detection (more reliable)
    const networkIds = findGa4FromNetwork(ctx);
    const htmlIds = findGa4FromHtml(ctx);
    const allIds = [...new Set([...networkIds, ...htmlIds])];

    if (allIds.length > 0) {
      const source = networkIds.length > 0 ? 'requêtes réseau' : 'HTML';
      return {
        status: 'pass',
        description: `GA4 détecté : ${allIds.join(', ')} (via ${source}).`,
        rawData: { measurementIds: allIds, networkIds, htmlIds },
      };
    }

    // Check if GTM is present (GA4 likely loaded via GTM but no collect fired yet)
    const hasGtm = ctx.scripts.some((s) => s.includes('googletagmanager.com/gtm.js'))
      || ctx.sessions.some((s) => s.networkRequests.some((r) => r.url.includes('/gtm.js?id=GTM-')));

    if (hasGtm) {
      return {
        status: 'info',
        description: 'GA4 non détecté en direct mais GTM est présent — GA4 est probablement chargé via GTM.',
        rawData: { measurementIds: [], viaGtm: true },
      };
    }

    return {
      status: 'fail',
      description: 'Aucune implémentation GA4 détectée.',
      businessNote: 'Sans GA4, vous ne mesurez pas vos conversions ni le comportement de vos visiteurs.',
      rawData: { measurementIds: [] },
    };
  },
};
