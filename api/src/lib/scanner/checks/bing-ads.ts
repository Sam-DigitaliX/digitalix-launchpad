import type { CheckModule, ScanContext } from '../types.js';

const UET_INLINE_PATTERN = /window\.uetq\s*=|uetq\.push\s*\(|new\s+UET\s*\(/;

function findUetFromNetwork(ctx: ScanContext): string[] {
  const ids = new Set<string>();

  for (const session of ctx.sessions) {
    for (const req of session.networkRequests) {
      if (!req.url.includes('bat.bing.com')) continue;
      try {
        const params = new URL(req.url).searchParams;
        const ti = params.get('ti');
        if (ti) ids.add(ti);
      } catch {
        // invalid URL, skip
      }
    }
  }

  return [...ids];
}

export const bingAdsCheck: CheckModule = {
  id: 'bing-ads',
  category: 'tracking',
  name: 'Microsoft Ads (Bing)',
  impact: 'low',
  gated: false,
  run(ctx: ScanContext) {
    const networkIds = findUetFromNetwork(ctx);
    const hasBatScript = ctx.scripts.some((s) => s.includes('bat.bing.com/bat.js'));
    const hasUetqInline = ctx.inlineScripts.some((s) => UET_INLINE_PATTERN.test(s));

    if (networkIds.length > 0) {
      return {
        status: 'pass',
        description: `Microsoft UET détecté : tag ID ${networkIds.join(', ')}.`,
        rawData: { uetIds: networkIds, hasBatScript, hasUetqInline },
      };
    }

    if (hasBatScript || hasUetqInline) {
      return {
        status: 'pass',
        description: 'Microsoft UET détecté (script ou inline) — tag ID non capturé durant le scan.',
        rawData: { uetIds: [], hasBatScript, hasUetqInline },
      };
    }

    return {
      status: 'info',
      description: 'Microsoft Ads (Bing) non détecté.',
      rawData: { uetIds: [], hasBatScript: false, hasUetqInline: false },
    };
  },
};
