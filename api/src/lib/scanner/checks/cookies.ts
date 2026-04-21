import type { CheckModule, ScanContext } from '../types.js';
import { detectServerManagedCookies, GOOGLE_FP_COOKIES } from '../server-managed-cookies.js';
import { identifyCookieVendor } from '../cookie-vendors.js';

const ANALYTICS_COOKIES = ['_ga', '_gid', '_fbp', '_fbc', '_gcl_au', '_gcl_aw'];

export const cookiesCheck: CheckModule = {
  id: 'first-party-cookies',
  category: 'serverside',
  name: 'Cookies First-Party (Server-Set)',
  impact: 'high',
  gated: true,
  run(ctx: ScanContext) {
    const postAccept = ctx.sessions.find((s) => s.phase === 'post-accept');
    const cookiesToAnalyze = postAccept?.cookies ?? ctx.cookies;
    const smc = detectServerManagedCookies(ctx);

    // SIGNAL LE PLUS FORT : famille FP* (FPID, FPLC, FPGCLAW, FPGCLDC, FPGCLGB)
    // Ces noms sont exclusifs aux setups sGTM server-managed — preuve définitive.
    if (smc.detected.length > 0) {
      const labels = smc.detected.map((n) => `${n} (${GOOGLE_FP_COOKIES[n] ?? ''})`);
      const legacyNote = smc.hasLegacyGa || smc.hasLegacyGclAu
        ? ` Cohabitation avec ${[smc.hasLegacyGa ? '_ga' : null, smc.hasLegacyGclAu ? '_gcl_au' : null].filter(Boolean).join(', ')} — possible migration en cours.`
        : '';
      return {
        status: 'pass',
        description: `Cookies server-managed détectés : ${smc.detected.join(', ')} — le naming FP* prouve qu'ils sont posés par sGTM via HTTP Set-Cookie (durée 2 ans préservée, bypass ITP).${legacyNote}`,
        rawData: {
          serverManagedFamily: smc.detected,
          labels,
          hasLegacyGa: smc.hasLegacyGa,
          hasLegacyGclAu: smc.hasLegacyGclAu,
        },
      };
    }

    // Signal httpOnly : définitif pour un Set-Cookie server-side, mais rare
    // pour les cookies analytics (ils doivent être lus par JS pour fonctionner).
    const httpOnlyServerCookies: string[] = [];
    const trackerCookiesFound: { name: string; vendor: string; role: string }[] = [];

    for (const cookie of cookiesToAnalyze) {
      if (!ANALYTICS_COOKIES.some((name) => cookie.name.startsWith(name))) continue;
      if (cookie.httpOnly) httpOnlyServerCookies.push(cookie.name);

      const info = identifyCookieVendor(cookie.name);
      if (info) trackerCookiesFound.push({ name: cookie.name, vendor: info.vendor, role: info.role });
    }

    const rawData = {
      serverManagedFamily: [],
      httpOnlyServerCookies,
      trackerCookiesFound,
      sessionUsed: postAccept?.phase ?? null,
    };

    if (httpOnlyServerCookies.length > 0) {
      return {
        status: 'pass',
        description: `Cookies analytics posés via Set-Cookie HTTP (httpOnly) : ${httpOnlyServerCookies.join(', ')} — inaccessibles au JavaScript, résistants à l'ITP Safari.`,
        rawData,
      };
    }

    if (trackerCookiesFound.length === 0) {
      return {
        status: 'info',
        description: 'Aucun cookie analytics détecté après acceptation. Les cookies sont peut-être posés côté client uniquement, ou le scan n\'a pas pu déclencher leur écriture.',
        rawData,
      };
    }

    // Cookies analytics présents mais aucun signal server-managed → warning pédagogique
    const summary = trackerCookiesFound.map((c) => `${c.name} (${c.vendor})`).join(', ');
    return {
      status: 'warning',
      description: `Aucun cookie server-managed détecté. Les cookies analytics présents (${summary}) sont posés par JavaScript — durée cappée à 7 jours sur Safari (ITP) et vulnérables aux adblockers. Ces traceurs déposés par des tiers apparaissent aussi dans la carte "Cookies Tiers".`,
      businessNote: 'Activez "Server-managed cookies" dans le client GA4 / tag Google Ads de sGTM pour générer FPID / FPGCLAW — durée 2 ans préservée, résistance aux bloqueurs, et meilleure conformité CNIL (cookie réellement first-party au sens légal).',
      rawData,
    };
  },
};
