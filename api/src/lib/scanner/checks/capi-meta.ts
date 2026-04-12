import type { CheckModule, ScanContext } from '../types.js';

const EVENT_ID_PATTERN = /eventID\s*[:\s]\s*['"][^'"]+['"]/;
const FBQ_EVENT_ID_PATTERN = /fbq\s*\(\s*['"]track['"]\s*,\s*['"][^'"]+['"]\s*,\s*\{[^}]*\}\s*,\s*\{\s*eventID/;

export const capiMetaCheck: CheckModule = {
  id: 'capi-meta',
  category: 'serverside',
  name: 'Meta Conversions API (CAPI)',
  impact: 'critical',
  gated: true,
  run(ctx: ScanContext) {
    const hasMetaPixel = ctx.scripts.some(
      (s) => s.includes('connect.facebook.net') && s.includes('fbevents.js')
    ) || ctx.inlineScripts.some((s) => s.includes('fbq('));

    if (!hasMetaPixel) {
      return {
        status: 'info',
        description: 'Aucun Meta Pixel detecte — CAPI non applicable.',
        rawData: { hasMetaPixel: false },
      };
    }

    let hasEventId = false;
    for (const script of ctx.inlineScripts) {
      if (EVENT_ID_PATTERN.test(script) || FBQ_EVENT_ID_PATTERN.test(script)) {
        hasEventId = true;
        break;
      }
    }

    const fbpServerSet = ctx.cookies.some((c) => c.name === '_fbp' && !c.isThirdParty);

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
