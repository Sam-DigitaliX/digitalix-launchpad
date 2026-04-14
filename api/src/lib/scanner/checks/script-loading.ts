import * as cheerio from 'cheerio';
import type { CheckModule, ScanContext } from '../types.js';

function analyzeLoading(ctx: ScanContext) {
  const $ = cheerio.load(ctx.html);
  let blocking = 0;
  let async = 0;
  let defer = 0;

  $('script[src]').each((_, el) => {
    const hasAsync = $(el).attr('async') !== undefined;
    const hasDefer = $(el).attr('defer') !== undefined;

    if (hasAsync) {
      async++;
    } else if (hasDefer) {
      defer++;
    } else {
      blocking++;
    }
  });

  return { blocking, async, defer, total: blocking + async + defer };
}

export const scriptLoadingCheck: CheckModule = {
  id: 'script-loading',
  category: 'performance',
  name: 'Stratégie de Chargement des Scripts',
  impact: 'medium',
  gated: true,
  run(ctx: ScanContext) {
    const { blocking, async: asyncCount, defer, total } = analyzeLoading(ctx);

    if (total === 0) {
      return {
        status: 'info',
        description: 'Aucun script externe détecté.',
        rawData: { blocking: 0, async: 0, defer: 0, total: 0 },
      };
    }

    if (blocking === 0) {
      return {
        status: 'pass',
        description: `Tous les scripts (${total}) utilisent async ou defer — aucun script bloquant.`,
        rawData: { blocking, async: asyncCount, defer, total },
      };
    }

    const blockingRatio = blocking / total;

    if (blockingRatio <= 0.3) {
      return {
        status: 'warning',
        description: `${blocking} script(s) bloquant(s) sur ${total}. Les scripts sans async/defer retardent le rendu de la page.`,
        rawData: { blocking, async: asyncCount, defer, total },
      };
    }

    return {
      status: 'fail',
      description: `${blocking} scripts bloquants sur ${total} — la majorité des scripts ralentissent le rendu. Ajoutez async ou defer.`,
      rawData: { blocking, async: asyncCount, defer, total },
    };
  },
};
