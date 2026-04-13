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
        description: 'Aucun Meta Pixel detecte — CAPI non applicable.',
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
        description: 'Meta CAPI detecte : deduplication (eventID) active et _fbp pose en server-side.',
        rawData: { hasEventId, fbpServerSet },
      };
    }

    if (hasEventId) {
      return {
        status: 'warning',
        description: 'Deduplication eventID detectee mais _fbp non pose en server-side. CAPI partiellement configure.',
        rawData: { hasEventId, fbpServerSet },
      };
    }

    return {
      status: 'fail',
      description: 'Meta Pixel present sans deduplication eventID — CAPI probablement non implementee. Perte de donnees de conversion.',
      rawData: { hasEventId: false, fbpServerSet },
    };
  },
};
