import type { CheckModule, ScanContext } from '../types.js';

export const capiMetaCheck: CheckModule = {
  id: 'capi-meta',
  category: 'serverside',
  name: 'Meta Conversions API (CAPI)',
  impact: 'high',
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

    const hasFbp = ctx.cookies.some((c) => c.name === '_fbp' && !c.isThirdParty);
    const hasFbc = ctx.cookies.some((c) => c.name === '_fbc' && !c.isThirdParty);

    const rawData = { hasMetaPixel: true, hasEventId, hasFbp, hasFbc };

    // Important context: CAPI itself is server-to-server and invisible to a browser scan.
    // We can only infer its likely presence from the client-side contract (eventID for dedup).

    if (hasEventId) {
      return {
        status: 'pass',
        description: `Déduplication eventID active côté client — CAPI probablement configurée en parallèle (dédup client/serveur en place).${hasFbp ? ' Cookie _fbp présent pour le matching.' : ''}`,
        rawData,
      };
    }

    return {
      status: 'warning',
      description: 'Meta Pixel détecté sans eventID pour la déduplication. Si CAPI est activée, les events seront comptés en double ; sinon CAPI n\'est probablement pas en place.',
      businessNote: 'Sans eventID dans vos fbq(\'track\', ...), impossible de dédupliquer les events entre le Pixel (client) et CAPI (serveur). Vous perdez 30-50% des conversions Meta Ads si CAPI n\'est pas activée, ou vous double-comptez si elle l\'est sans dedup.',
      rawData,
    };
  },
};
