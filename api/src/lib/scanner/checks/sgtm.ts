import type { CheckModule, ScanContext } from '../types.js';

const GTM_SCRIPT_PATTERN = /(?:https?:)?\/\/([^/]+)\/gtm\.js\?id=GTM-/;

function findGtmScriptDomain(ctx: ScanContext): string | null {
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

function isFirstPartyDomain(gtmDomain: string, siteDomain: string): boolean {
  const cleanGtm = gtmDomain.replace(/^www\./, '');
  return cleanGtm.endsWith(siteDomain) || siteDomain.endsWith(cleanGtm);
}

export const sgtmCheck: CheckModule = {
  id: 'sgtm',
  category: 'serverside',
  name: 'Server-Side GTM',
  impact: 'critical',
  gated: false,
  run(ctx: ScanContext) {
    const gtmDomain = findGtmScriptDomain(ctx);

    if (!gtmDomain) {
      return {
        status: 'info',
        description: 'Aucun script GTM detecte — impossible d\'evaluer le server-side.',
        rawData: { gtmDomain: null },
      };
    }

    const isGoogle = gtmDomain.includes('googletagmanager.com');

    if (!isGoogle && isFirstPartyDomain(gtmDomain, ctx.domain)) {
      return {
        status: 'pass',
        description: `GTM charge depuis un domaine first-party (${gtmDomain}) — server-side GTM detecte.`,
        rawData: { gtmDomain, isFirstParty: true },
      };
    }

    if (!isGoogle) {
      return {
        status: 'pass',
        description: `GTM charge depuis un domaine custom (${gtmDomain}) — server-side GTM probable.`,
        rawData: { gtmDomain, isFirstParty: false },
      };
    }

    return {
      status: 'fail',
      description: 'GTM charge depuis googletagmanager.com — pas de server-side. Donnees vulnerables aux adblockers et ITP.',
      rawData: { gtmDomain, isFirstParty: false },
    };
  },
};
