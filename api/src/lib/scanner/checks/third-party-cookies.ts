import type { CheckModule, ScanContext } from '../types.js';

export const thirdPartyCookiesCheck: CheckModule = {
  id: 'third-party-cookies',
  category: 'privacy',
  name: 'Cookies Tiers',
  impact: 'high',
  gated: true,
  run(ctx: ScanContext) {
    // Use post-accept session for most complete cookie picture
    const postAccept = ctx.sessions.find((s) => s.phase === 'post-accept');
    const cookiesToAnalyze = postAccept?.cookies ?? ctx.cookies;

    const thirdParty = cookiesToAnalyze.filter((c) => c.isThirdParty);
    const domains = [...new Set(thirdParty.map((c) => c.domain).filter(Boolean))] as string[];
    const count = thirdParty.length;

    if (count === 0) {
      return {
        status: 'pass',
        description: 'Aucun cookie tiers détecté après acceptation.',
        rawData: { count: 0, domains: [] },
      };
    }

    if (count <= 2) {
      return {
        status: 'pass',
        description: `${count} cookie(s) tiers détecté(s) — niveau acceptable.`,
        rawData: { count, domains },
      };
    }

    if (count <= 10) {
      return {
        status: 'warning',
        description: `${count} cookies tiers détectés (domaines : ${domains.join(', ')}). Risque de non-conformité RGPD sans consentement.`,
        businessNote: 'Des cookies tiers sont déposés sur votre site. Assurez-vous qu\'ils sont couverts par le consentement utilisateur.',
        rawData: { count, domains },
      };
    }

    return {
      status: 'fail',
      description: `${count} cookies tiers détectés — nombre excessif. Impact sur la conformité et la vie privée des utilisateurs.`,
      businessNote: 'Trop de cookies tiers sont déposés sur votre site. Assurez-vous qu\'ils sont couverts par le consentement utilisateur.',
      rawData: { count, domains },
    };
  },
};
