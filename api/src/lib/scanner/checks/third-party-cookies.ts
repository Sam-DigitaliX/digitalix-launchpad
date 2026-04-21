import type { CheckModule, ScanContext, ParsedCookie } from '../types.js';
import { identifyCookieVendorWithContext } from '../cookie-vendors.js';

interface CookieEntry {
  name: string;
  vendor: string;
  role: string;
  /** Domaine sur lequel le cookie est posé (pour contexte) */
  domain: string;
  /** Durée estimée sur Safari ITP en jours */
  safariDurationDays: number;
  /** État Safari : "capped" (7j) ou "blocked" (domaine tiers, bloqué entièrement) */
  safariState: 'capped' | 'blocked';
}

export const thirdPartyCookiesCheck: CheckModule = {
  id: 'third-party-cookies',
  category: 'privacy',
  name: 'Cookies Tiers',
  impact: 'high',
  gated: true,
  run(ctx: ScanContext) {
    const postAccept = ctx.sessions.find((s) => s.phase === 'post-accept');
    const cookies: ParsedCookie[] = postAccept?.cookies ?? ctx.cookies;

    const thirdPartyCookies: CookieEntry[] = [];

    for (const c of cookies) {
      // Cas 1 : vendor identifié qui communique directement avec un tiers
      const info = identifyCookieVendorWithContext(c.name, ctx.scripts);
      if (info && !info.firstPartyCommunication) {
        thirdPartyCookies.push({
          name: c.name,
          vendor: info.vendor,
          role: info.role,
          domain: c.domain ?? '—',
          safariDurationDays: 7,
          safariState: 'capped',
        });
        continue;
      }

      // Cas 2 : cookie posé sur un domaine techniquement tiers (ex: .doubleclick.net)
      if (c.isThirdParty) {
        thirdPartyCookies.push({
          name: c.name,
          vendor: info?.vendor ?? 'Inconnu',
          role: info?.role ?? 'cookie tiers',
          domain: c.domain ?? '—',
          safariDurationDays: 0,
          safariState: 'blocked',
        });
      }
    }

    const count = thirdPartyCookies.length;
    const cappedCount = thirdPartyCookies.filter((c) => c.safariState === 'capped').length;
    const blockedCount = thirdPartyCookies.filter((c) => c.safariState === 'blocked').length;

    const rawData = {
      cookies: thirdPartyCookies,
      count,
      cappedCount,
      blockedCount,
      safariPedagogy: 'Safari bloque ou cap ces cookies à 7 jours. Ça concerne ≈ 25% de votre trafic EU.',
    };

    if (count === 0) {
      return {
        status: 'pass',
        description: 'Aucun cookie tiers détecté après acceptation.',
        rawData,
      };
    }

    if (count <= 2) {
      return {
        status: 'pass',
        description: `${count} cookie(s) tiers détecté(s) — niveau acceptable.`,
        rawData,
      };
    }

    if (count <= 10) {
      return {
        status: 'warning',
        description: `${count} cookies tiers détectés — nécessitent le consentement utilisateur.`,
        businessNote: 'Vérifiez que ces traceurs sont bloqués avant consentement. Pour préserver l\'attribution sur Safari (≈ 25% du trafic EU), basculez les essentiels (GA4, Google Ads) en server-managed via sGTM.',
        rawData,
      };
    }

    return {
      status: 'fail',
      description: `${count} cookies tiers — nombre élevé, risque RGPD et attribution dégradée.`,
      businessNote: 'Consentement strict obligatoire + audit des tags. Bascule sGTM server-managed fortement recommandée pour préserver l\'attribution Safari.',
      rawData,
    };
  },
};
