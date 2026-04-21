import type { CheckModule, ScanContext } from '../types.js';
import { detectServerManagedCookies } from '../server-managed-cookies.js';

// Match GTM container ID from any URL serving gtm.js (works for googletagmanager.com AND proxified custom domains)
const GTM_SCRIPT_URL_ANY = /\/gtm\.js\?id=(GTM-[A-Z0-9]+)/;
const GTM_INLINE_PATTERN = /GTM-[A-Z0-9]{6,}/g;

function findGtmIds(ctx: ScanContext): string[] {
  const ids = new Set<string>();

  // 1. Any external script URL serving gtm.js (proxified or not)
  for (const src of ctx.scripts) {
    const match = GTM_SCRIPT_URL_ANY.exec(src);
    if (match) ids.add(match[1]);
  }

  // 2. Inline scripts — relaxed guard: gtm.start, gtm.js, or a 'GTM-XXX' string literal
  for (const script of ctx.inlineScripts) {
    const looksLikeGtm =
      /gtm\.(start|js)/.test(script) ||
      /['"`]GTM-[A-Z0-9]+['"`]/.test(script);
    if (!looksLikeGtm) continue;
    let m: RegExpExecArray | null;
    while ((m = GTM_INLINE_PATTERN.exec(script)) !== null) {
      ids.add(m[0]);
    }
    GTM_INLINE_PATTERN.lastIndex = 0;
  }

  // 3. Network requests — a custom loader may fetch gtm.js itself even if HTML doesn't expose it
  for (const session of ctx.sessions) {
    for (const req of session.networkRequests) {
      const match = GTM_SCRIPT_URL_ANY.exec(req.url);
      if (match) ids.add(match[1]);
    }
  }

  return [...ids];
}

export const gtmCheck: CheckModule = {
  id: 'gtm',
  category: 'tracking',
  name: 'Google Tag Manager',
  impact: 'critical',
  gated: false,
  run(ctx: ScanContext) {
    const ids = findGtmIds(ctx);

    if (ids.length === 0) {
      // Fallback : signaux indirects que GTM EST actif mais masqué (custom loader + first-party)
      const smc = detectServerManagedCookies(ctx);
      const pushCount = ctx.sessions.reduce((acc, s) => acc + s.dataLayerPushes.length, 0);
      const hasDataLayer = pushCount > 0;

      // Cookies server-managed FP* = preuve forte que sGTM tourne, donc qu'un container GTM existe
      if (smc.hasFpid || smc.hasFpgclaw) {
        return {
          status: 'pass',
          description: `Container GTM non visible directement (chargement first-party + custom loader masquant l'appel à gtm.js) — détecté indirectement via cookies server-managed (${smc.detected.join(', ')}). Setup avancé, container ID non récupérable côté client.`,
          rawData: {
            containerIds: [],
            indirectDetection: 'server-managed-cookies',
            indirectSignals: smc.detected,
          },
        };
      }

      // dataLayer actif sans GTM visible : signal probable mais pas certain (peut être Tealium / Adobe Launch / autre)
      if (hasDataLayer) {
        return {
          status: 'info',
          description: `dataLayer actif (${pushCount} push${pushCount > 1 ? 'es' : ''}) mais aucun container GTM identifié dans les scripts. Possible custom loader, ou tag manager alternatif (Tealium, Adobe Launch). Vérification manuelle recommandée.`,
          rawData: {
            containerIds: [],
            indirectDetection: 'datalayer-active',
            pushCount,
          },
        };
      }

      return {
        status: 'fail',
        description: 'Aucun container Google Tag Manager détecté (ni script direct, ni cookies server-managed, ni dataLayer actif).',
        businessNote: 'Sans Google Tag Manager, vous ne pouvez pas gérer vos tags marketing de manière centralisée. Chaque modification nécessite un développeur.',
        rawData: { containerIds: [] },
      };
    }

    if (ids.length > 1) {
      return {
        status: 'warning',
        description: `${ids.length} containers GTM détectés (${ids.join(', ')}). Plusieurs containers peuvent causer des conflits.`,
        rawData: { containerIds: ids },
      };
    }

    return {
      status: 'pass',
      description: `Container GTM détecté : ${ids[0]}.`,
      rawData: { containerIds: ids },
    };
  },
};
