import type { CheckModule, ScanContext } from '../types.js';

const ANALYTICS_COOKIES = ['_ga', '_gid', '_fbp', '_fbc', '_gcl_au', '_gcl_aw'];

export const cookiesCheck: CheckModule = {
  id: 'first-party-cookies',
  category: 'serverside',
  name: 'Cookies First-Party (Server-Set)',
  impact: 'critical',
  gated: true,
  run(ctx: ScanContext) {
    const serverCookies: string[] = [];
    const allDetected: string[] = [];

    for (const cookie of ctx.cookies) {
      if (ANALYTICS_COOKIES.includes(cookie.name)) {
        allDetected.push(cookie.name);
        if (!cookie.isThirdParty) {
          serverCookies.push(cookie.name);
        }
      }
    }

    if (serverCookies.length === 0 && allDetected.length === 0) {
      return {
        status: 'info',
        description: 'Aucun cookie analytics detecte dans les headers HTTP. Les cookies sont probablement poses cote client.',
        rawData: { serverCookies: [], clientOnlyCookies: [] },
      };
    }

    const clientOnly = allDetected.filter((c) => !serverCookies.includes(c));

    if (serverCookies.length > 0 && clientOnly.length === 0) {
      return {
        status: 'pass',
        description: `Cookies analytics poses en server-side : ${serverCookies.join(', ')}. Duree de vie preservee (bypass ITP Safari).`,
        rawData: { serverCookies, clientOnlyCookies: clientOnly },
      };
    }

    if (serverCookies.length > 0) {
      return {
        status: 'warning',
        description: `Mix server/client : ${serverCookies.join(', ')} en server-side, ${clientOnly.join(', ')} en client-side.`,
        rawData: { serverCookies, clientOnlyCookies: clientOnly },
      };
    }

    return {
      status: 'fail',
      description: `Cookies analytics (${allDetected.join(', ')}) poses uniquement cote client — duree de vie limitee par ITP Safari (7 jours max).`,
      rawData: { serverCookies: [], clientOnlyCookies: allDetected },
    };
  },
};
