import type { CheckModule, ScanContext } from '../types.js';
import { detectServerManagedCookies } from '../server-managed-cookies.js';

const GTM_SCRIPT_PATTERN = /(?:https?:)?\/\/([^/]+)\/gtm\.js\?id=GTM-/;

function isFirstPartyDomain(gtmDomain: string, siteDomain: string): boolean {
  const cleanGtm = gtmDomain.replace(/^www\./, '');
  return cleanGtm.endsWith(siteDomain) || siteDomain.endsWith(cleanGtm);
}

const GOOGLE_COLLECT_HOSTS = ['google-analytics.com', 'analytics.google.com', 'googletagmanager.com'];

/**
 * Does this request look like a GA4 collection hit? Catches both the plain form
 * (`/g/collect`) and the Stape custom-loader obfuscated form, where the path is a
 * random hash and the `/g/collect?...` payload is base64-encoded inside a query
 * param value (e.g. dgx.digitalix.xyz/dd8qqdhbapwnu?<hash>=<base64>).
 */
function looksLikeGa4Collect(url: string): boolean {
  if (url.includes('/g/collect') || url.includes('/j/collect')) return true;
  try {
    const u = new URL(url);
    for (const [, value] of u.searchParams) {
      if (value.length < 24) continue;
      try {
        const decoded = Buffer.from(decodeURIComponent(value), 'base64').toString('utf8');
        if (decoded.includes('/g/collect') || decoded.includes('tid=G-')) return true;
      } catch {
        // not base64 — ignore
      }
    }
  } catch {
    // bad URL
  }
  return false;
}

/**
 * GA4 collection routed server-side: a collection hit to a host that is first-party
 * to the site but NOT a Google domain → the hits are processed by the user's own
 * server container (e.g. dgx.digitalix.xyz), incl. obfuscated custom-loader hits.
 * Direct server-side signal, independent of the FPID cookie.
 */
export function detectServerSideCollect(ctx: ScanContext): string | null {
  for (const session of ctx.sessions) {
    for (const req of session.networkRequests) {
      let host: string;
      try {
        host = new URL(req.url).hostname;
      } catch {
        continue;
      }
      if (GOOGLE_COLLECT_HOSTS.some((g) => host.includes(g))) continue;
      if (!isFirstPartyDomain(host.replace(/^www\./, ''), ctx.domain)) continue;
      if (looksLikeGa4Collect(req.url)) return host;
    }
  }
  return null;
}

function findGtmDomain(ctx: ScanContext): string | null {
  // 1. Real network requests from Playwright sessions
  for (const session of ctx.sessions) {
    for (const req of session.networkRequests) {
      if (req.url.includes('/gtm.js?id=GTM-')) {
        try {
          return new URL(req.url).hostname;
        } catch {
          // continue
        }
      }
    }
  }

  // 2. Fallback: scripts from HTML
  for (const src of ctx.scripts) {
    const match = GTM_SCRIPT_PATTERN.exec(src);
    if (match) return match[1];
  }

  for (const script of ctx.inlineScripts) {
    const match = GTM_SCRIPT_PATTERN.exec(script);
    if (match) return match[1];
  }

  return null;
}

export const sgtmCheck: CheckModule = {
  id: 'sgtm',
  category: 'serverside',
  name: 'Server-Side GTM',
  impact: 'high',
  gated: false,
  run(ctx: ScanContext) {
    const gtmDomain = findGtmDomain(ctx);
    const smc = detectServerManagedCookies(ctx);
    const serverSideCollectHost = detectServerSideCollect(ctx);
    const serverSideCollect = serverSideCollectHost !== null;

    const isGoogleLibDomain = gtmDomain?.includes('googletagmanager.com') ?? true;
    const libProxied = gtmDomain !== null && !isGoogleLibDomain;
    const libFirstParty = libProxied && gtmDomain ? isFirstPartyDomain(gtmDomain, ctx.domain) : false;

    // Niveau de maturité 0 / 1 / 2 (niveau 3 = + CAPI, géré par les checks dédiés).
    // Niveau 2 = server-side réel : soit cookies server-managed confirmés (FPID),
    // soit collecte GA4 routée vers le domaine first-party (le routage server-side EST
    // l'accomplissement ; le mode cookie est un raffinement non observable au scan).
    let maturityLevel: 0 | 1 | 2 = 0;
    if (smc.hasFpid || smc.hasFpgclaw) maturityLevel = 2;
    else if (serverSideCollect) maturityLevel = 2;
    else if (libProxied) maturityLevel = 1;

    const rawData = {
      gtmDomain,
      libProxied,
      libFirstParty,
      maturityLevel,
      serverSideCollect,
      serverSideCollectHost,
      serverManagedCookies: smc.detected,
      hasFpid: smc.hasFpid,
      hasFpgclaw: smc.hasFpgclaw,
      hasLegacyGa: smc.hasLegacyGa,
      hasLegacyGclAu: smc.hasLegacyGclAu,
    };

    // No GTM at all
    if (!gtmDomain) {
      return {
        status: 'info',
        description: 'Aucun script GTM détecté — impossible d\'évaluer le server-side.',
        rawData,
      };
    }

    // EDGE CASE : gtm.js NON proxifié mais FP* cookies présents
    if (!libProxied && (smc.hasFpid || smc.hasFpgclaw)) {
      return {
        status: 'warning',
        description: `Configuration inhabituelle : cookies server-managed détectés (${smc.detected.join(', ')}) mais gtm.js chargé depuis googletagmanager.com — le container web n'est pas proxifié. Setup fragmenté à investiguer manuellement.`,
        businessNote: 'Vos cookies sont posés server-side (bien) mais la librairie GTM reste sur les serveurs Google → vulnérable aux adblockers. Proxifiez la librairie via sGTM Web Container ou Google Tag Gateway.',
        rawData,
      };
    }

    // Niveau 0 — 100% client-side
    if (maturityLevel === 0) {
      return {
        status: 'fail',
        description: 'GTM chargé depuis googletagmanager.com — pas de server-side (Niveau 0/2). Librairie vulnérable aux adblockers, cookies JS-managed cappés à 7 jours sur Safari (ITP).',
        businessNote: 'Vos données sont vulnérables aux adblockers et à l\'ITP Safari. Vous perdez 20-40% de vos données analytics et conversions. Mettez en place sGTM (container web proxifié + server-managed cookies).',
        rawData,
      };
    }

    // Niveau 1 — librairie proxifiée mais PAS de collecte server-side ni FP* cookies
    if (maturityLevel === 1) {
      const proxiedNote = libFirstParty ? 'first-party' : 'custom';
      return {
        status: 'warning',
        description: `Container web proxifié (${gtmDomain}, ${proxiedNote}) mais aucune collecte GA4 routée server-side détectée, ni cookies server-managed. Niveau 1/2.`,
        businessNote: 'Vous avez proxifié la librairie GTM (bon début, bypass adblockers) mais la collecte ne semble pas routée vers un conteneur serveur. Configurez le server_container_url + un client GA4 server-managed pour passer en Niveau 2.',
        rawData,
      };
    }

    // Niveau 2 — cookies server-managed confirmés (FPID)
    if (smc.hasFpid || smc.hasFpgclaw) {
      const transitionNote = smc.hasLegacyGa || smc.hasLegacyGclAu
        ? ` (cohabitation avec ${[smc.hasLegacyGa ? '_ga' : null, smc.hasLegacyGclAu ? '_gcl_au' : null].filter(Boolean).join(', ')} — possible migration en cours, vérifier l'absence de double-comptage)`
        : '';
      return {
        status: 'pass',
        description: `sGTM en mode server-managed cookies détecté (${smc.detected.join(', ')}) via ${gtmDomain}. Setup Niveau 2/2${transitionNote}.`,
        rawData,
      };
    }

    // Niveau 2 — server-side confirmé via collecte routée first-party (mode cookie non observable au scan)
    return {
      status: 'pass',
      description: `Server-side confirmé : librairie proxifiée (${gtmDomain}) + collecte GA4 routée vers votre domaine first-party (${serverSideCollectHost}). Niveau 2/2. Le mode des cookies (server-managed FPID, httpOnly) n'est pas vérifiable au scan — les conteneurs serveur bloquent souvent le trafic bot/headless de l'audit. À confirmer en DevTools (cookie FPID sur votre domaine).`,
      businessNote: 'Votre tracking est bien en server-side : librairie proxifiée + hits GA4 traités par votre propre conteneur serveur (résistant aux adblockers). Seul point non vérifiable automatiquement : si les cookies sont posés en server-managed (FPID httpOnly, 2 ans, résistants à l\'ITP Safari) — à confirmer manuellement.',
      rawData,
    };
  },
};
