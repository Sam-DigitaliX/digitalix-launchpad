import type { CheckModule, ScanContext } from '../types.js';

const ANALYTICS_COOKIES = ['_ga', '_gid', '_fbp', '_fbc', '_gcl_au', '_gcl_aw'];

export const cookiesCheck: CheckModule = {
  id: 'first-party-cookies',
  category: 'serverside',
  name: 'Cookies First-Party (Server-Set)',
  impact: 'critical',
  gated: true,
  run(ctx: ScanContext) {
    const postAccept = ctx.sessions.find((s) => s.phase === 'post-accept');

    // Use post-accept session cookies if available (most complete)
    const cookiesToAnalyze = postAccept?.cookies ?? ctx.cookies;

    const serverCookies: string[] = [];
    const clientCookies: string[] = [];

    for (const cookie of cookiesToAnalyze) {
      if (ANALYTICS_COOKIES.some((name) => cookie.name.startsWith(name))) {
        if (cookie.httpOnly || (!cookie.isThirdParty && cookie.expires)) {
          // Server-set indicators: httpOnly flag, or first-party with explicit expiry
          serverCookies.push(cookie.name);
        } else {
          clientCookies.push(cookie.name);
        }
      }
    }

    const total = serverCookies.length + clientCookies.length;

    if (total === 0) {
      return {
        status: 'info',
        description: 'Aucun cookie analytics détecté après acceptation. Les cookies sont peut-être posés côté client uniquement.',
        rawData: { serverCookies: [], clientOnlyCookies: [], sessionUsed: !!postAccept },
      };
    }

    if (serverCookies.length > 0 && clientCookies.length === 0) {
      return {
        status: 'pass',
        description: `Cookies analytics posés en server-side : ${serverCookies.join(', ')}. Durée de vie préservée (bypass ITP Safari).`,
        rawData: { serverCookies, clientOnlyCookies: [] },
      };
    }

    if (serverCookies.length > 0) {
      return {
        status: 'warning',
        description: `Mix server/client : ${serverCookies.join(', ')} en server-side, ${clientCookies.join(', ')} en client-side.`,
        rawData: { serverCookies, clientOnlyCookies: clientCookies },
      };
    }

    return {
      status: 'fail',
      description: `Cookies analytics (${clientCookies.join(', ')}) posés uniquement côté client — durée de vie limitée par ITP Safari (7 jours max).`,
      rawData: { serverCookies: [], clientOnlyCookies: clientCookies },
    };
  },
};
