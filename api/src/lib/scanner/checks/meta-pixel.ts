import type { CheckModule, ScanContext } from '../types.js';

const FBQ_INIT_PATTERN = /fbq\s*\(\s*['"]init['"]\s*,\s*['"](\d+)['"]/g;

function findPixelFromNetwork(ctx: ScanContext): { hasScript: boolean; pixelIds: string[] } {
  let hasScript = false;
  const pixelIds = new Set<string>();

  for (const session of ctx.sessions) {
    for (const req of session.networkRequests) {
      if (req.url.includes('connect.facebook.net') && req.url.includes('fbevents.js')) {
        hasScript = true;
      }
      // Track pixel fires
      if (req.url.includes('facebook.com/tr/?')) {
        try {
          const params = new URL(req.url).searchParams;
          const id = params.get('id');
          if (id) pixelIds.add(id);
        } catch {
          // continue
        }
      }
    }
  }

  return { hasScript, pixelIds: [...pixelIds] };
}

export const metaPixelCheck: CheckModule = {
  id: 'meta-pixel',
  category: 'tracking',
  name: 'Meta (Facebook) Pixel',
  impact: 'high',
  gated: false,
  run(ctx: ScanContext) {
    // Network-based detection
    const network = findPixelFromNetwork(ctx);

    // HTML-based detection
    const htmlIds: string[] = [];
    for (const script of ctx.inlineScripts) {
      let m: RegExpExecArray | null;
      while ((m = FBQ_INIT_PATTERN.exec(script)) !== null) {
        htmlIds.push(m[1]);
      }
      FBQ_INIT_PATTERN.lastIndex = 0;
    }
    const hasFbScript = ctx.scripts.some(
      (s) => s.includes('connect.facebook.net') && s.includes('fbevents.js')
    );

    const allIds = [...new Set([...network.pixelIds, ...htmlIds])];
    const detected = network.hasScript || hasFbScript || allIds.length > 0;

    if (detected) {
      return {
        status: 'pass',
        description: allIds.length > 0
          ? `Meta Pixel détecté : ${allIds.join(', ')}.`
          : 'Meta Pixel détecté (script fbevents.js présent).',
        rawData: { pixelIds: allIds, hasScript: network.hasScript || hasFbScript },
      };
    }

    const hasGtm = ctx.sessions.some((s) => s.networkRequests.some((r) => r.url.includes('/gtm.js?id=GTM-')));
    if (hasGtm) {
      return {
        status: 'info',
        description: 'Meta Pixel non détecté en direct. Il peut être chargé via GTM.',
        rawData: { pixelIds: [], viaGtm: true },
      };
    }

    return {
      status: 'info',
      description: 'Aucun Meta Pixel détecté.',
      businessNote: 'Sans le Pixel Meta, vous ne pouvez pas mesurer ni optimiser vos campagnes Facebook/Instagram Ads.',
      rawData: { pixelIds: [] },
    };
  },
};
