import type { CheckModule, ScanContext } from '../types.js';

const DATALAYER_PUSH_PATTERN = /dataLayer\.push\s*\(/g;
const ECOMMERCE_EVENTS = ['purchase', 'begin_checkout', 'add_to_cart', 'view_item', 'add_payment_info', 'view_item_list'];

function analyzeDataLayer(ctx: ScanContext) {
  let hasDataLayer = false;
  let pushCount = 0;
  const detectedEvents: string[] = [];

  for (const script of ctx.inlineScripts) {
    if (script.includes('dataLayer')) {
      hasDataLayer = true;
    }

    while (DATALAYER_PUSH_PATTERN.exec(script) !== null) {
      pushCount++;
    }
    DATALAYER_PUSH_PATTERN.lastIndex = 0;

    for (const event of ECOMMERCE_EVENTS) {
      if (script.includes(`'${event}'`) || script.includes(`"${event}"`)) {
        detectedEvents.push(event);
      }
    }
  }

  return { hasDataLayer, pushCount, detectedEvents: [...new Set(detectedEvents)] };
}

export const datalayerCheck: CheckModule = {
  id: 'datalayer',
  category: 'tracking',
  name: 'Data Layer',
  impact: 'high',
  gated: true,
  run(ctx: ScanContext) {
    const { hasDataLayer, pushCount, detectedEvents } = analyzeDataLayer(ctx);

    if (!hasDataLayer) {
      return {
        status: 'fail',
        description: 'Aucun dataLayer detecte. Les donnees structurees ne sont pas transmises a GTM.',
        rawData: { hasDataLayer: false, pushCount: 0, events: [] },
      };
    }

    if (detectedEvents.length > 0) {
      return {
        status: 'pass',
        description: `dataLayer actif avec ${pushCount} push(es) et ${detectedEvents.length} event(s) e-commerce detecte(s) : ${detectedEvents.join(', ')}.`,
        rawData: { hasDataLayer: true, pushCount, events: detectedEvents },
      };
    }

    return {
      status: 'warning',
      description: `dataLayer present avec ${pushCount} push(es) mais aucun event e-commerce detecte.`,
      rawData: { hasDataLayer: true, pushCount, events: [] },
    };
  },
};
