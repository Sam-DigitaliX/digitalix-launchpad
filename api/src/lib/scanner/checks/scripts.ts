import type { CheckModule, ScanContext } from '../types.js';

function classifyScripts(ctx: ScanContext) {
  // Use real loaded scripts from Playwright sessions if available
  const postAccept = ctx.sessions.find((s) => s.phase === 'post-accept');
  const scriptUrls = postAccept?.scriptsLoaded ?? ctx.scripts;

  const thirdPartyDomains = new Set<string>();
  let firstParty = 0;
  let thirdParty = 0;

  for (const src of scriptUrls) {
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
    const hasPlaywrightData = ctx.sessions.some((s) => s.scriptsLoaded.length > 0);
    const source = hasPlaywrightData ? 'analyse navigateur' : 'HTML';

    if (thirdParty < 8) {
      return {
        status: 'pass',
        description: `${thirdParty} script(s) tiers sur ${total} total — charge raisonnable (${source}).`,
        rawData: { total, firstParty, thirdParty, domains, source },
      };
    }

    if (thirdParty <= 15) {
      return {
        status: 'warning',
        description: `${thirdParty} scripts tiers detectes via ${source} (${domains.length} domaines). Chaque script ajoute du temps de chargement.`,
        rawData: { total, firstParty, thirdParty, domains, source },
      };
    }

    return {
      status: 'fail',
      description: `${thirdParty} scripts tiers detectes — impact majeur sur le temps de chargement et la vie privee.`,
      rawData: { total, firstParty, thirdParty, domains, source },
    };
  },
};
