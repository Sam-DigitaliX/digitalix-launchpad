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
        description: `Cookies server-managed détectés : ${smc.detected.join(', ')} — le naming FP* prouve qu'ils sont posés par sGTM via HTTP Set-Cookie. **Durée préservée sur Safari : jusqu'à 2 ans** (bypass ITP cap).${legacyNote}`,
        rawData: {
          serverManagedFamily: smc.detected,
          labels,
          hasLegacyGa: smc.hasLegacyGa,
          hasLegacyGclAu: smc.hasLegacyGclAu,
          safariDurationDays: 730,
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
        description: `Cookies analytics posés via Set-Cookie HTTP (httpOnly) : ${httpOnlyServerCookies.join(', ')} — inaccessibles au JavaScript, garantie de provenance server-side. **Durée préservée sur Safari : jusqu'à 2 ans** (ITP ne cap pas les cookies HTTP server-set sur même domaine).`,
        rawData: { ...rawData, safariDurationDays: 730 },
      };
    }

    if (trackerCookiesFound.length === 0) {
      return {
        status: 'info',
        description: 'Aucun cookie analytics détecté après acceptation. Les cookies sont peut-être posés côté client uniquement, ou le scan n\'a pas pu déclencher leur écriture.',
        rawData,
      };
    }

    // Cookies analytics présents mais aucun signal server-managed → warning pédagogique avec impact Safari
    const summary = trackerCookiesFound.map((c) => `${c.name} (${c.vendor})`).join(', ');
    return {
      status: 'warning',
      description: `Aucun cookie server-managed détecté. Les cookies analytics présents (${summary}) sont probablement posés par JavaScript (via gtag.js / fbevents.js / etc.). **Impact Safari : durée cappée à 7 jours max** (ITP 2.1+, depuis 2019). Safari représente environ 20-25% du trafic en Europe (iOS + macOS) — la fenêtre d'attribution est divisée pour ces utilisateurs. Ces traceurs apparaissent aussi dans la carte "Cookies Tiers" (au sens CNIL, déposés par des tiers).`,
      businessNote: 'Pour bypass la limite ITP 7j de Safari et préserver la durée réelle (2 ans pour _ga, 3 mois pour _fbp), activez "Server-managed cookies" dans le client GA4 / tag Google Ads de sGTM (génère FPID / FPGCLAW posés par HTTP Set-Cookie).',
      rawData: { ...rawData, safariDurationDays: 7 },
    };
  },
};
