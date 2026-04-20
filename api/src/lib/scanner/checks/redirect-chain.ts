import type { CheckModule, ScanContext } from '../types.js';

const TRACKING_PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'dclid'];

function getTrackingParams(url: string): string[] {
  try {
    const params = new URL(url).searchParams;
    return TRACKING_PARAMS.filter((p) => params.has(p));
  } catch {
    return [];
  }
}

export const redirectChainCheck: CheckModule = {
  id: 'redirect-chain',
  category: 'performance',
  name: 'Chaîne de redirections HTTP',
  impact: 'medium',
  gated: true,
  run(ctx: ScanContext) {
    const chain = ctx.redirectChain ?? [];

    // Chain includes the final 200 response, so hops = chain.length - 1
    const hops = Math.max(0, chain.length - 1);

    const entryParams = getTrackingParams(ctx.url);
    const finalParams = getTrackingParams(ctx.finalUrl);
    const droppedParams = entryParams.filter((p) => !finalParams.includes(p));
    const queryParamsDropped = entryParams.length > 0 && droppedParams.length > 0;

    const rawData = {
      hops,
      chain: chain.map((h) => ({ url: h.url, statusCode: h.statusCode })),
      entryUrl: ctx.url,
      finalUrl: ctx.finalUrl,
      trackingParamsPresent: entryParams,
      trackingParamsDropped: droppedParams,
    };

    if (chain.length === 0) {
      return {
        status: 'info',
        description: 'Chaîne de redirections non capturée (scan en mode dégradé).',
        rawData,
      };
    }

    // Any dropped tracking param is an immediate fail (UTM/GCLID loss = attribution break)
    if (queryParamsDropped) {
      return {
        status: 'fail',
        description: `${hops} redirection${hops > 1 ? 's' : ''} détectée${hops > 1 ? 's' : ''} et paramètre(s) de tracking perdus : ${droppedParams.join(', ')}.`,
        businessNote: 'Les redirections cassent vos UTM/GCLID. Google Ads perd l\'attribution, vos campagnes remontent en "direct". Fix serveur (Apache/Nginx) pour préserver les query params.',
        rawData,
      };
    }

    if (hops === 0) {
      return {
        status: 'pass',
        description: 'Aucune redirection — la page se charge directement.',
        rawData,
      };
    }

    if (hops === 1) {
      return {
        status: 'pass',
        description: `1 redirection (${chain[0].statusCode} → ${chain[1].url}). Acceptable.`,
        rawData,
      };
    }

    if (hops === 2) {
      return {
        status: 'warning',
        description: `${hops} redirections avant d'atteindre la page finale. Chaque hop ajoute 100-300ms de latence.`,
        businessNote: 'Consolidez votre config serveur : redirigez directement vers l\'URL canonique (https + www ou non-www + trailing slash) en un seul 301.',
        rawData,
      };
    }

    return {
      status: 'fail',
      description: `${hops} redirections successives avant la page finale — impact direct sur le TTFB et le score Landing Page Experience de Google Ads.`,
      businessNote: 'Une chaîne de 3+ redirections dégrade le SEO, le quality score Google Ads, et peut casser des cookies/sessions. Consolidez en un seul 301 vers l\'URL canonique.',
      rawData,
    };
  },
};
