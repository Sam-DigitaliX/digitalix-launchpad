import type { CheckModule, ScanContext } from '../types.js';

const ECOMMERCE_EVENTS = ['purchase', 'begin_checkout', 'add_to_cart', 'view_item', 'add_payment_info', 'view_item_list'];

export const datalayerCheck: CheckModule = {
  id: 'datalayer',
  category: 'tracking',
  name: 'Data Layer',
  impact: 'high',
  gated: true,
  run(ctx: ScanContext) {
    // Use real dataLayer from Playwright sessions if available
    const allPushes = ctx.sessions.flatMap((s) => s.dataLayerPushes);
    const hasRealData = allPushes.length > 0;

    if (hasRealData) {
      const events: string[] = [];
      for (const push of allPushes) {
        const event = (push as Record<string, unknown>).event;
        if (typeof event === 'string') events.push(event);
      }

      const uniqueEvents = [...new Set(events)];
      const ecommerceEvents = uniqueEvents.filter((e) => ECOMMERCE_EVENTS.includes(e));

      if (uniqueEvents.length === 0) {
        return {
          status: 'warning',
          description: `dataLayer actif (${allPushes.length} push(es)) mais aucun event nommé détecté.`,
          rawData: { pushCount: allPushes.length, events: [], source: 'playwright' },
        };
      }

      if (ecommerceEvents.length > 0) {
        return {
          status: 'pass',
          description: `dataLayer actif avec ${uniqueEvents.length} event(s) dont ${ecommerceEvents.length} e-commerce : ${ecommerceEvents.join(', ')}.`,
          rawData: { pushCount: allPushes.length, events: uniqueEvents, ecommerceEvents, source: 'playwright' },
        };
      }

      const ecomNote = ctx.ecommercePlatform
        ? `mais aucun event e-commerce détecté (${ctx.ecommercePlatform} identifié).`
        : '(site vitrine — events e-commerce non attendus).';
      return {
        status: ctx.ecommercePlatform ? 'warning' : 'pass',
        description: `dataLayer actif avec ${uniqueEvents.length} event(s) (${uniqueEvents.slice(0, 5).join(', ')}${uniqueEvents.length > 5 ? '...' : ''}) ${ecomNote}`,
        rawData: { pushCount: allPushes.length, events: uniqueEvents, ecommerceEvents: [], source: 'playwright' },
      };
    }

    // Fallback: HTML-based detection
    let hasDataLayer = false;
    let pushCount = 0;
    const detectedEvents: string[] = [];

    for (const script of ctx.inlineScripts) {
      if (script.includes('dataLayer')) hasDataLayer = true;
      const pushMatches = script.match(/dataLayer\.push\s*\(/g);
      if (pushMatches) pushCount += pushMatches.length;

      for (const event of ECOMMERCE_EVENTS) {
        if (script.includes(`'${event}'`) || script.includes(`"${event}"`)) {
          detectedEvents.push(event);
        }
      }
    }

    if (!hasDataLayer) {
      return {
        status: 'fail',
        description: 'Aucun dataLayer détecté. Les données structurées ne sont pas transmises à GTM.',
        rawData: { hasDataLayer: false, pushCount: 0, events: [], source: 'html' },
      };
    }

    const uniqueDetected = [...new Set(detectedEvents)];

    if (uniqueDetected.length > 0) {
      return {
        status: 'pass',
        description: `dataLayer actif avec ${pushCount} push(es) et ${uniqueDetected.length} event(s) e-commerce : ${uniqueDetected.join(', ')}.`,
        rawData: { hasDataLayer: true, pushCount, events: uniqueDetected, source: 'html' },
      };
    }

    const ecomFallbackNote = ctx.ecommercePlatform
      ? `mais aucun event e-commerce détecté (${ctx.ecommercePlatform} identifié).`
      : '(site vitrine — events e-commerce non attendus).';
    return {
      status: ctx.ecommercePlatform ? 'warning' : 'pass',
      description: `dataLayer présent avec ${pushCount} push(es) ${ecomFallbackNote}`,
      rawData: { hasDataLayer: true, pushCount, events: [], source: 'html' },
    };
  },
};
