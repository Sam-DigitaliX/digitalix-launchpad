import type { CheckModule, ScanContext } from '../types.js';

const AW_CONFIG_PATTERN = /gtag\s*\(\s*['"]config['"]\s*,\s*['"](AW-[0-9]+)['"]/g;
const AW_SCRIPT_PATTERN = /googletagmanager\.com\/gtag\/js\?id=(AW-[0-9]+)/;

interface NetworkScan {
  clientIds: string[];
  serverIds: string[];
}

function findAwFromNetwork(ctx: ScanContext): NetworkScan {
  const clientIds = new Set<string>();
  const serverIds = new Set<string>();

  for (const session of ctx.sessions) {
    for (const req of session.networkRequests) {
      const url = req.url;

      // Client-side Google Ads conversion endpoints
      if (
        url.includes('googleads.g.doubleclick.net/pagead/conversion') ||
        url.includes('www.google.com/pagead/viewthroughconversion') ||
        url.includes('www.google.com/pagead/conversion')
      ) {
        const match = url.match(/\/pagead\/(?:viewthroughconversion|conversion)\/(\d+)/);
        if (match) clientIds.add(`AW-${match[1]}`);
        continue;
      }

      // Direct gtag.js load for AW-XXX → client
      const scriptMatch = AW_SCRIPT_PATTERN.exec(url);
      if (scriptMatch) {
        clientIds.add(scriptMatch[1]);
        AW_SCRIPT_PATTERN.lastIndex = 0;
        continue;
      }

      // Server-side (first-party) proxy: sGTM endpoint on non-Google host carrying AW id
      if (
        (url.includes('/g/collect') || url.includes('/gtag/destination') || url.includes('/conv/')) &&
        !url.includes('google-analytics.com') &&
        !url.includes('googletagmanager.com') &&
        !url.includes('googleads.g.doubleclick.net')
      ) {
        try {
          const urlObj = new URL(url);
          const tid = urlObj.searchParams.get('tid') ?? urlObj.searchParams.get('id');
          if (tid?.startsWith('AW-')) serverIds.add(tid);
        } catch {
          // invalid URL, skip
        }
      }
    }
  }

  return { clientIds: [...clientIds], serverIds: [...serverIds] };
}

function findAwFromHtml(ctx: ScanContext): string[] {
  const ids = new Set<string>();

  for (const src of ctx.scripts) {
    const match = AW_SCRIPT_PATTERN.exec(src);
    if (match) ids.add(match[1]);
    AW_SCRIPT_PATTERN.lastIndex = 0;
  }

  for (const script of ctx.inlineScripts) {
    let m: RegExpExecArray | null;
    while ((m = AW_CONFIG_PATTERN.exec(script)) !== null) {
      ids.add(m[1]);
    }
    AW_CONFIG_PATTERN.lastIndex = 0;
  }

  return [...ids];
}

export const googleAdsCheck: CheckModule = {
  id: 'google-ads',
  category: 'tracking',
  name: 'Google Ads',
  impact: 'high',
  gated: false,
  run(ctx: ScanContext) {
    const { clientIds, serverIds } = findAwFromNetwork(ctx);
    const htmlIds = findAwFromHtml(ctx);
    const allIds = [...new Set([...clientIds, ...serverIds, ...htmlIds])];
    const hasGclAw = ctx.cookies.some((c) => c.name === '_gcl_aw');

    if (allIds.length === 0 && !hasGclAw) {
      return {
        status: 'info',
        description: 'Google Ads non détecté (aucune requête de conversion ni cookie _gcl_aw).',
        rawData: { ids: [], clientIds: [], serverIds: [], htmlIds: [], hasGclAw: false, mode: 'none' },
      };
    }

    const hasClient = clientIds.length > 0;
    const hasServer = serverIds.length > 0;

    if (hasClient && hasServer) {
      return {
        status: 'info',
        description: `Google Ads détecté en setup hybride : ${allIds.join(', ')}. Requêtes envoyées en parallèle côté client (googleads.g.doubleclick.net) et côté server via sGTM.`,
        businessNote: 'Setup hybride classique de transition client → server. Vérifiez qu\'il n\'y a pas de double-comptage des conversions dans Google Ads (dédup via order_id ou basculer 100% server-side).',
        rawData: { ids: allIds, clientIds, serverIds, htmlIds, hasGclAw, mode: 'hybrid' },
      };
    }

    if (hasServer) {
      return {
        status: 'pass',
        description: `Google Ads détecté : ${allIds.join(', ')} — conversions routées server-side via sGTM.`,
        rawData: { ids: allIds, clientIds, serverIds, htmlIds, hasGclAw, mode: 'server' },
      };
    }

    if (hasClient || htmlIds.length > 0) {
      return {
        status: 'pass',
        description: `Google Ads détecté : ${allIds.join(', ')} — tracking côté client.`,
        rawData: { ids: allIds, clientIds, serverIds, htmlIds, hasGclAw, mode: 'client' },
      };
    }

    // Only _gcl_aw cookie, no AW ID captured
    return {
      status: 'info',
      description: 'Cookie _gcl_aw présent mais aucune requête de conversion capturée durant le scan (tag Ads peut ne se déclencher que sur page de confirmation).',
      rawData: { ids: [], clientIds: [], serverIds: [], htmlIds: [], hasGclAw: true, mode: 'cookie-only' },
    };
  },
};
