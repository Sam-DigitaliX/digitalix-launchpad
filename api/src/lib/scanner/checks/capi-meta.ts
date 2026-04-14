import type { CheckModule, ScanContext } from '../types.js';

export const capiMetaCheck: CheckModule = {
  id: 'capi-meta',
  category: 'serverside',
  name: 'Meta Conversions API (CAPI)',
  impact: 'critical',
  gated: true,
  run(ctx: ScanContext) {
    // Check if Meta Pixel is present at all
    const hasMetaPixel = ctx.sessions.some((s) =>
      s.networkRequests.some((r) =>
        (r.url.includes('connect.facebook.net') && r.url.includes('fbevents.js'))
        || r.url.includes('facebook.com/tr/?')
      )
    ) || ctx.inlineScripts.some((s) => s.includes('fbq('));

    if (!hasMetaPixel) {
      return {
        status: 'info',
        description: 'Aucun Meta Pixel détecté — CAPI non applicable.',
        rawData: { hasMetaPixel: false },
      };
    }

    // Check for event deduplication (eventID) in network requests or inline scripts
    let hasEventId = false;

    for (const session of ctx.sessions) {
      for (const req of session.networkRequests) {
        if (req.url.includes('facebook.com/tr/') && req.url.includes('eid=')) {
          hasEventId = true;
          break;
        }
      }
      if (hasEventId) break;
    }

    if (!hasEventId) {
      for (const script of ctx.inlineScripts) {
        if (/eventID\s*[:\s]\s*['"][^'"]+['"]/.test(script) || /fbq\s*\([^)]*eventID/.test(script)) {
          hasEventId = true;
          break;
        }
      }
    }

    const fbpServerSet = ctx.cookies.some((c) => c.name === '_fbp' && !c.isThirdParty && c.httpOnly);

    if (hasEventId && fbpServerSet) {
      return {
        status: 'pass',
        description: 'Meta CAPI détecté : déduplication (eventID) active et _fbp posé en server-side.',
        rawData: { hasEventId, fbpServerSet },
      };
    }

    if (hasEventId) {
      return {
        status: 'warning',
        description: 'Déduplication eventID détectée mais _fbp non posé en server-side. CAPI partiellement configuré.',
        rawData: { hasEventId, fbpServerSet },
      };
    }

    return {
      status: 'fail',
      description: 'Meta Pixel présent sans déduplication eventID — CAPI probablement non implémentée. Perte de données de conversion.',
      rawData: { hasEventId: false, fbpServerSet },
    };
  },
};
