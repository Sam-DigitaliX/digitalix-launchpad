import type { CheckModule, ScanContext } from '../types.js';

function classifyScripts(ctx: ScanContext) {
  const thirdPartyDomains = new Set<string>();
  let firstParty = 0;
  let thirdParty = 0;

  for (const src of ctx.scripts) {
    try {
      const scriptUrl = new URL(src, `https://${ctx.domain}`);
      const scriptDomain = scriptUrl.hostname.replace(/^www\./, '');

      if (scriptDomain === ctx.domain || ctx.domain.endsWith(scriptDomain) || scriptDomain.endsWith(ctx.domain)) {
        firstParty++;
      } else {
        thirdParty++;
        thirdPartyDomains.add(scriptDomain);
      }
    } catch {
      // Relative URL or malformed — count as first-party
      firstParty++;
    }
  }

  return { firstParty, thirdParty, domains: [...thirdPartyDomains] };
}

export const scriptsCheck: CheckModule = {
  id: 'scripts-count',
  category: 'performance',
  name: 'Scripts Tiers',
  impact: 'high',
  gated: true,
  run(ctx: ScanContext) {
    const { firstParty, thirdParty, domains } = classifyScripts(ctx);
    const total = firstParty + thirdParty;

    if (thirdParty < 8) {
      return {
        status: 'pass',
        description: `${thirdParty} script(s) tiers sur ${total} total — charge raisonnable.`,
        rawData: { total, firstParty, thirdParty, domains },
      };
    }

    if (thirdParty <= 15) {
      return {
        status: 'warning',
        description: `${thirdParty} scripts tiers detectes (${domains.length} domaines). Chaque script ajoute du temps de chargement.`,
        rawData: { total, firstParty, thirdParty, domains },
      };
    }

    return {
      status: 'fail',
      description: `${thirdParty} scripts tiers detectes — impact majeur sur le temps de chargement et la vie privee.`,
      rawData: { total, firstParty, thirdParty, domains },
    };
  },
};
