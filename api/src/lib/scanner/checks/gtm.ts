import type { CheckModule, ScanContext } from '../types.js';

const GTM_SCRIPT_PATTERN = /googletagmanager\.com\/gtm\.js\?id=(GTM-[A-Z0-9]+)/g;
const GTM_INLINE_PATTERN = /GTM-[A-Z0-9]{6,}/g;

function findGtmIds(ctx: ScanContext): string[] {
  const ids = new Set<string>();

  for (const src of ctx.scripts) {
    const match = GTM_SCRIPT_PATTERN.exec(src);
    if (match) ids.add(match[1]);
    GTM_SCRIPT_PATTERN.lastIndex = 0;
  }

  for (const script of ctx.inlineScripts) {
    if (script.includes('gtm.start') || script.includes('googletagmanager.com/gtm.js')) {
      let m: RegExpExecArray | null;
      while ((m = GTM_INLINE_PATTERN.exec(script)) !== null) {
        ids.add(m[0]);
      }
      GTM_INLINE_PATTERN.lastIndex = 0;
    }
  }

  return [...ids];
}

export const gtmCheck: CheckModule = {
  id: 'gtm',
  category: 'tracking',
  name: 'Google Tag Manager',
  impact: 'critical',
  gated: false,
  run(ctx: ScanContext) {
    const ids = findGtmIds(ctx);

    if (ids.length === 0) {
      return {
        status: 'fail',
        description: 'Aucun container Google Tag Manager detecte.',
        rawData: { containerIds: [] },
      };
    }

    if (ids.length > 1) {
      return {
        status: 'warning',
        description: `${ids.length} containers GTM detectes (${ids.join(', ')}). Plusieurs containers peuvent causer des conflits.`,
        rawData: { containerIds: ids },
      };
    }

    return {
      status: 'pass',
      description: `Container GTM detecte : ${ids[0]}.`,
      rawData: { containerIds: ids },
    };
  },
};
