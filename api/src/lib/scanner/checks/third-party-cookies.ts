import type { CheckModule, ScanContext } from '../types.js';

export const thirdPartyCookiesCheck: CheckModule = {
  id: 'third-party-cookies',
  category: 'privacy',
  name: 'Cookies Tiers',
  impact: 'high',
  gated: true,
  run(ctx: ScanContext) {
    const thirdParty = ctx.cookies.filter((c) => c.isThirdParty);
    const domains = [...new Set(thirdParty.map((c) => c.domain).filter(Boolean))];
    const count = thirdParty.length;

    if (count === 0) {
      return {
        status: 'pass',
        description: 'Aucun cookie tiers detecte dans les headers HTTP.',
        rawData: { count: 0, domains: [] },
      };
    }

    if (count <= 2) {
      return {
        status: 'pass',
        description: `${count} cookie(s) tiers detecte(s) — niveau acceptable.`,
        rawData: { count, domains },
      };
    }

    if (count <= 10) {
      return {
        status: 'warning',
        description: `${count} cookies tiers detectes (domaines : ${domains.join(', ')}). Risque de non-conformite RGPD sans consentement.`,
        rawData: { count, domains },
      };
    }

    return {
      status: 'fail',
      description: `${count} cookies tiers detectes — nombre excessif. Impact sur la conformite et la vie privee des utilisateurs.`,
      rawData: { count, domains },
    };
  },
};
