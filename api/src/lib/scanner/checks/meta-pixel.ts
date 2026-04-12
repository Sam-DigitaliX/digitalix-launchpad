import type { CheckModule, ScanContext } from '../types.js';

const FBQ_INIT_PATTERN = /fbq\s*\(\s*['"]init['"]\s*,\s*['"](\d+)['"]/g;

function findPixelIds(ctx: ScanContext): string[] {
  const ids = new Set<string>();

  for (const script of ctx.inlineScripts) {
    let m: RegExpExecArray | null;
    while ((m = FBQ_INIT_PATTERN.exec(script)) !== null) {
      ids.add(m[1]);
    }
    FBQ_INIT_PATTERN.lastIndex = 0;
  }

  return [...ids];
}

export const metaPixelCheck: CheckModule = {
  id: 'meta-pixel',
  category: 'tracking',
  name: 'Meta (Facebook) Pixel',
  impact: 'high',
  gated: false,
  run(ctx: ScanContext) {
    const hasFbScript = ctx.scripts.some(
      (s) => s.includes('connect.facebook.net') && s.includes('fbevents.js')
    );
    const ids = findPixelIds(ctx);

    if (hasFbScript || ids.length > 0) {
      return {
        status: 'pass',
        description: ids.length > 0
          ? `Meta Pixel detecte : ${ids.join(', ')}.`
          : 'Meta Pixel detecte (script fbevents.js present).',
        rawData: { pixelIds: ids, hasScript: hasFbScript },
      };
    }

    // Check if loaded via GTM
    const hasGtm = ctx.scripts.some((s) => s.includes('googletagmanager.com/gtm.js'));
    if (hasGtm) {
      return {
        status: 'info',
        description: 'Meta Pixel non detecte en direct. Il peut etre charge via GTM.',
        rawData: { pixelIds: [], viaGtm: true },
      };
    }

    return {
      status: 'info',
      description: 'Aucun Meta Pixel detecte.',
      rawData: { pixelIds: [] },
    };
  },
};
