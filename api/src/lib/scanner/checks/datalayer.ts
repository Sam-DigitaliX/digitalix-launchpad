import type { CheckModule, ScanContext } from '../types.js';

const ECOMMERCE_EVENTS = ['purchase', 'begin_checkout', 'add_to_cart', 'view_item', 'add_payment_info', 'view_item_list', 'select_item', 'remove_from_cart', 'view_cart'];

/**
 * Signatures of e-commerce dataLayer plugins/integrations that push
 * standard GA4 ecommerce events on product/collection/checkout pages
 * (not on the homepage that we scan).
 */
const ECOM_DATALAYER_PLUGINS: { name: string; patterns: RegExp[] }[] = [
  { name: 'GTM4WP (WordPress)', patterns: [/gtm4wp/i, /gtm4wp_data/i] },
  { name: 'WooCommerce DataLayer', patterns: [/woocommerce[_-]?datalayer/i, /wc_add_to_cart_params/i] },
  { name: 'Shopify Pixels Manager', patterns: [/shopify_pixel/i, /analytics\.subscribe\s*\(/] },
  { name: 'Shopify Enhanced Ecommerce', patterns: [/ShopifyAnalytics/, /Shopify\.theme/] },
  { name: 'Magento Google Tag Manager', patterns: [/magento[_-]?gtm/i, /mp_gtm/i] },
  { name: 'PrestaShop GTM', patterns: [/prestashop[_-]?gtm/i, /ps_gtm/i] },
  { name: 'BigCommerce DataLayer', patterns: [/bigcommerce[_-]?datalayer/i] },
  { name: 'WooCommerce Google Analytics Pro', patterns: [/wc_google_analytics_pro/i] },
];

function detectEcomDatalayerPlugin(ctx: ScanContext): string | null {
  const haystack = [...ctx.scripts, ...ctx.inlineScripts].join('\n');
  for (const plugin of ECOM_DATALAYER_PLUGINS) {
    if (plugin.patterns.some((p) => p.test(haystack))) return plugin.name;
  }
  return null;
}

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

      // No e-commerce events found. This is EXPECTED on a homepage scan —
      // view_item / add_to_cart / purchase fire on product / cart / checkout pages.
      // Detect known e-commerce dataLayer plugins to reassure about downstream coverage.
      const ecomPlugin = detectEcomDatalayerPlugin(ctx);

      if (ctx.ecommercePlatform && ecomPlugin) {
        return {
          status: 'pass',
          description: `dataLayer actif avec ${uniqueEvents.length} event(s) (${uniqueEvents.slice(0, 5).join(', ')}${uniqueEvents.length > 5 ? '...' : ''}). Plugin ${ecomPlugin} détecté — les events e-commerce (view_item, add_to_cart, purchase...) sont attendus sur les pages produit / panier / checkout, non visitées par ce scan.`,
          rawData: { pushCount: allPushes.length, events: uniqueEvents, ecommerceEvents: [], ecomPlugin, source: 'playwright' },
        };
      }

      if (ctx.ecommercePlatform) {
        return {
          status: 'info',
          description: `dataLayer actif avec ${uniqueEvents.length} event(s) (${uniqueEvents.slice(0, 5).join(', ')}${uniqueEvents.length > 5 ? '...' : ''}). Plateforme ${ctx.ecommercePlatform} identifiée mais aucun plugin e-commerce dataLayer connu détecté — vérifier manuellement qu'un tag GA4 Ecommerce (view_item, add_to_cart, purchase) est configuré sur les pages produit/checkout.`,
          businessNote: 'Un dataLayer e-commerce est indispensable pour mesurer les conversions produit et le ROAS. Installez un plugin (GTM4WP, WooCommerce DataLayer, etc.) ou configurez les pushs manuellement dans votre thème.',
          rawData: { pushCount: allPushes.length, events: uniqueEvents, ecommerceEvents: [], ecomPlugin: null, source: 'playwright' },
        };
      }

      return {
        status: 'pass',
        description: `dataLayer actif avec ${uniqueEvents.length} event(s) (${uniqueEvents.slice(0, 5).join(', ')}${uniqueEvents.length > 5 ? '...' : ''}) — site vitrine, events e-commerce non attendus.`,
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
        businessNote: 'Sans dataLayer, vos outils tracking ne reçoivent pas de données structurées. Impossible de mesurer les actions utilisateur.',
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

    // No e-commerce events — expected on a homepage scan
    const ecomPluginHtml = detectEcomDatalayerPlugin(ctx);

    if (ctx.ecommercePlatform && ecomPluginHtml) {
      return {
        status: 'pass',
        description: `dataLayer présent avec ${pushCount} push(es). Plugin ${ecomPluginHtml} détecté — les events e-commerce pousheront sur les pages produit / panier / checkout (non visitées par ce scan).`,
        rawData: { hasDataLayer: true, pushCount, events: [], ecomPlugin: ecomPluginHtml, source: 'html' },
      };
    }

    if (ctx.ecommercePlatform) {
      return {
        status: 'info',
        description: `dataLayer présent avec ${pushCount} push(es). Plateforme ${ctx.ecommercePlatform} identifiée mais aucun plugin e-commerce dataLayer connu — vérifier manuellement qu'un tag GA4 Ecommerce est configuré sur les pages produit/checkout.`,
        businessNote: 'Un dataLayer e-commerce est indispensable pour mesurer les conversions produit et le ROAS. Installez un plugin (GTM4WP, WooCommerce DataLayer, etc.) ou configurez les pushs manuellement.',
        rawData: { hasDataLayer: true, pushCount, events: [], ecomPlugin: null, source: 'html' },
      };
    }

    return {
      status: 'pass',
      description: `dataLayer présent avec ${pushCount} push(es) — site vitrine, events e-commerce non attendus.`,
      rawData: { hasDataLayer: true, pushCount, events: [], source: 'html' },
    };
  },
};
