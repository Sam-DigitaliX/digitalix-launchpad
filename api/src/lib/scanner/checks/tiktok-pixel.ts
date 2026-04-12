import type { CheckModule, ScanContext } from '../types.js';

const TTQ_LOAD_PATTERN = /ttq\.load\s*\(\s*['"]([A-Z0-9]+)['"]/;

export const tiktokPixelCheck: CheckModule = {
  id: 'tiktok',
  category: 'tracking',
  name: 'TikTok Pixel',
  impact: 'low',
  gated: true,
  run(ctx: ScanContext) {
    const hasTiktokScript = ctx.scripts.some(
      (s) => s.includes('analytics.tiktok.com') && s.includes('events.js')
    );

    let pixelId: string | null = null;
    for (const script of ctx.inlineScripts) {
      const match = TTQ_LOAD_PATTERN.exec(script);
      if (match) {
        pixelId = match[1];
        break;
      }
    }

    if (hasTiktokScript || pixelId) {
      return {
        status: 'pass',
        description: pixelId
          ? `TikTok Pixel detecte : ${pixelId}.`
          : 'TikTok Pixel detecte.',
        rawData: { pixelId, hasScript: hasTiktokScript },
      };
    }

    return {
      status: 'info',
      description: 'TikTok Pixel non detecte.',
      rawData: { pixelId: null },
    };
  },
};
