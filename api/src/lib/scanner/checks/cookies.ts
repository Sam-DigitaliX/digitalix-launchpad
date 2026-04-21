import type { CheckModule, ScanContext } from '../types.js';
import { identifyCookieVendorWithContext, type CookieVendorInfo } from '../cookie-vendors.js';

interface CookieEntry {
  name: string;
  vendor: string;
  role: string;
  /** Durée estimée sur Safari ITP en jours (730 = 2 ans préservés, 7 = cappé) */
  safariDurationDays: number;
  /** Raison qui justifie la durée (server-managed, httpOnly, JS-set, etc.) */
  reason: string;
}

export const cookiesCheck: CheckModule = {
  id: 'first-party-cookies',
  category: 'serverside',
  name: 'Cookies First-Party',
  impact: 'high',
  gated: true,
  run(ctx: ScanContext) {
    const postAccept = ctx.sessions.find((s) => s.phase === 'post-accept');
    const cookies = postAccept?.cookies ?? ctx.cookies;
    const firstPartyCookies: CookieEntry[] = [];

    for (const c of cookies) {
      const info: CookieVendorInfo | null = identifyCookieVendorWithContext(c.name, ctx.scripts);
      if (!info) continue;
      if (!info.firstPartyCommunication) continue;

      // FP* family et cookies en first-party communication : durée préservée si
      // posés via HTTP Set-Cookie (notre sGTM / backend). On assume 2 ans.
      firstPartyCookies.push({
        name: c.name,
        vendor: info.vendor,
        role: info.role,
        safariDurationDays: 730,
        reason: c.httpOnly ? 'httpOnly (HTTP Set-Cookie)' : 'server-managed (sGTM)',
      });
    }

    const rawData = {
      cookies: firstPartyCookies,
      count: firstPartyCookies.length,
      safariPedagogy: 'Ces cookies server-managed résistent à Safari ITP et aux adblockers.',
    };

    if (firstPartyCookies.length === 0) {
      return {
        status: 'info',
        description: 'Aucun cookie server-managed détecté. Vos traceurs analytics/ads sont posés côté client (voir carte "Cookies Tiers").',
        businessNote: 'Pour préserver la durée des cookies sur Safari (cappée à 7 jours pour les cookies JS), activez "Server-managed cookies" dans votre sGTM (GA4 client + tags Google Ads). Génère FPID / FPGCLAW posés via HTTP Set-Cookie.',
        rawData,
      };
    }

    return {
      status: 'pass',
      description: `${firstPartyCookies.length} cookie(s) first-party détecté(s) — setup sGTM server-managed actif.`,
      rawData,
    };
  },
};
