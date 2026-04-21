import type { CheckModule, ScanContext } from '../types.js';
import { detectServerManagedCookies } from '../server-managed-cookies.js';

const GTM_SCRIPT_PATTERN = /(?:https?:)?\/\/([^/]+)\/gtm\.js\?id=GTM-/;

function isFirstPartyDomain(gtmDomain: string, siteDomain: string): boolean {
  const cleanGtm = gtmDomain.replace(/^www\./, '');
  return cleanGtm.endsWith(siteDomain) || siteDomain.endsWith(cleanGtm);
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

    const isGoogleLibDomain = gtmDomain?.includes('googletagmanager.com') ?? true;
    const libProxied = gtmDomain !== null && !isGoogleLibDomain;
    const libFirstParty = libProxied && gtmDomain ? isFirstPartyDomain(gtmDomain, ctx.domain) : false;

    // Niveau de maturité 0 / 1 / 2 (niveau 3 = + CAPI, géré par les checks dédiés)
    let maturityLevel: 0 | 1 | 2 = 0;
    if (smc.hasFpid || smc.hasFpgclaw) maturityLevel = 2;
    else if (libProxied) maturityLevel = 1;

    const rawData = {
      gtmDomain,
      libProxied,
      libFirstParty,
      maturityLevel,
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

    // Niveau 1 — librairie proxifiée mais cookies JS-managed
    if (maturityLevel === 1) {
      const legacyList = [smc.hasLegacyGa ? '_ga' : null, smc.hasLegacyGclAu ? '_gcl_au' : null].filter(Boolean).join(', ');
      const proxiedNote = libFirstParty ? 'first-party' : 'custom';
      return {
        status: 'warning',
        description: `Container web proxifié (${gtmDomain}, ${proxiedNote}) mais cookies toujours en JS-managed${legacyList ? ' (' + legacyList + ')' : ''}. Durée de vie cappée à 7 jours sur Safari (ITP). Niveau 1/2.`,
        businessNote: 'Vous avez proxifié la librairie GTM (bon début, bypass adblockers) mais le client GA4 dans sGTM reste en "JavaScript-managed cookies". Activez "Server-managed cookies" dans votre tag GA4 pour passer en Niveau 2 et préserver la durée de vie des cookies (2 ans).',
        rawData,
      };
    }

    // Niveau 2 — server-managed complet
    const transitionNote = smc.hasLegacyGa || smc.hasLegacyGclAu
      ? ` (cohabitation avec ${[smc.hasLegacyGa ? '_ga' : null, smc.hasLegacyGclAu ? '_gcl_au' : null].filter(Boolean).join(', ')} — possible migration en cours, vérifier l'absence de double-comptage)`
      : '';
    return {
      status: 'pass',
      description: `sGTM en mode server-managed cookies détecté (${smc.detected.join(', ')}) via ${gtmDomain}. Setup Niveau 2/2${transitionNote}.`,
      rawData,
    };
  },
};
