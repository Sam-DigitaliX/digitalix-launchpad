import type { CheckModule, ScanContext } from '../types.js';

const ANALYTICS_COOKIES = ['_ga', '_gid', '_fbp', '_fbc', '_gcl_au', '_gcl_aw'];
const ITP_LIMITED_DURATION_DAYS = 7;

export const cookiesCheck: CheckModule = {
  id: 'first-party-cookies',
  category: 'serverside',
  name: 'Cookies First-Party (Server-Set)',
  impact: 'high',
  gated: true,
  run(ctx: ScanContext) {
    const postAccept = ctx.sessions.find((s) => s.phase === 'post-accept');
    const cookiesToAnalyze = postAccept?.cookies ?? ctx.cookies;

    // We can only RELIABLY detect httpOnly (definitive server-set indicator).
    // For analytics cookies, httpOnly is rarely true because the tracker JS
    // needs to read them — but presence proves server origin when set.
    const httpOnlyServerCookies: string[] = [];
    const firstPartyCookies: { name: string; longLived: boolean; expiresAt: string | null }[] = [];

    for (const cookie of cookiesToAnalyze) {
      if (!ANALYTICS_COOKIES.some((name) => cookie.name.startsWith(name))) continue;
      if (cookie.isThirdParty) continue;

      if (cookie.httpOnly) {
        httpOnlyServerCookies.push(cookie.name);
      }

      // Long-lived = expires more than ITP's 7-day cap. If a first-party
      // analytics cookie persists beyond 7 days on Safari, it had to come
      // from an HTTP response (server-set) — JS document.cookie writes get
      // capped to 7 days by ITP. This is a real signal.
      let longLived = false;
      let expiresAt: string | null = null;
      if (cookie.expires) {
        const expDate = new Date(cookie.expires);
        const daysFromNow = (expDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
        longLived = daysFromNow > ITP_LIMITED_DURATION_DAYS;
        expiresAt = cookie.expires;
      } else if (cookie.maxAge) {
        longLived = cookie.maxAge / (60 * 60 * 24) > ITP_LIMITED_DURATION_DAYS;
      }

      firstPartyCookies.push({ name: cookie.name, longLived, expiresAt });
    }

    const total = firstPartyCookies.length;
    const longLivedCount = firstPartyCookies.filter((c) => c.longLived).length;

    const rawData = {
      httpOnlyServerCookies,
      firstPartyCookies,
      longLivedCount,
      sessionUsed: postAccept?.phase ?? null,
    };

    if (total === 0) {
      return {
        status: 'info',
        description: 'Aucun cookie analytics first-party détecté après acceptation. Les cookies sont peut-être posés côté client uniquement, ou le scan n\'a pas pu déclencher leur écriture.',
        rawData,
      };
    }

    // Strongest signal: any httpOnly first-party cookie = definitive server-set
    if (httpOnlyServerCookies.length > 0) {
      return {
        status: 'pass',
        description: `Cookies analytics posés en server-side (httpOnly) : ${httpOnlyServerCookies.join(', ')} — résistants à ITP et accessibles seulement au serveur.`,
        rawData,
      };
    }

    // Long-lived first-party cookies (>7 days) are likely server-set
    // because Safari's ITP caps JS-set cookies at 7 days
    if (longLivedCount > 0) {
      const longLivedNames = firstPartyCookies.filter((c) => c.longLived).map((c) => c.name);
      return {
        status: 'pass',
        description: `Cookies analytics first-party détectés avec durée > 7j : ${longLivedNames.join(', ')}. Indicateur fort qu'ils sont posés en HTTP server-side (durée préservée sur Safari/ITP).`,
        rawData,
      };
    }

    // First-party cookies but all short-lived → likely JS-set, capped by ITP
    const names = firstPartyCookies.map((c) => c.name);
    return {
      status: 'warning',
      description: `Cookies analytics first-party détectés : ${names.join(', ')} — durée ≤ 7j ou non spécifiée. Probablement posés par JavaScript et donc soumis à la limite ITP Safari (7 jours max).`,
      businessNote: 'Sur Safari (ITP), les cookies analytics posés par JavaScript sont capés à 7 jours. Posez-les en HTTP server-side (via sGTM) pour préserver leur durée de vie réelle (2 ans pour _ga, 3 mois pour _fbp).',
      rawData,
    };
  },
};
