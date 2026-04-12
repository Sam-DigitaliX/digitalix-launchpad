import type { CheckModule, ScanContext } from '../types.js';

interface CmpSignature {
  name: string;
  patterns: string[];
}

const CMP_SIGNATURES: CmpSignature[] = [
  { name: 'Cookiebot', patterns: ['consent.cookiebot.com', 'Cookiebot'] },
  { name: 'Didomi', patterns: ['sdk.privacy-center.org', 'didomi'] },
  { name: 'OneTrust', patterns: ['cdn.cookielaw.org', 'onetrust', 'optanon'] },
  { name: 'Axeptio', patterns: ['static.axept.io', 'axeptio'] },
  { name: 'Sirdata', patterns: ['sirdata', 'sddan.com'] },
  { name: 'Iubenda', patterns: ['iubenda.com'] },
  { name: 'TarteAuCitron', patterns: ['tarteaucitron'] },
  { name: 'Quantcast', patterns: ['quantcast.com', 'quantcast'] },
  { name: 'Commanders Act', patterns: ['commander1.com', 'tc-privacy'] },
  { name: 'Usercentrics', patterns: ['usercentrics.eu', 'usercentrics'] },
  { name: 'CookieYes', patterns: ['cookieyes.com', 'cookieyes'] },
  { name: 'Complianz', patterns: ['complianz'] },
  { name: 'CookieFirst', patterns: ['cookiefirst.com'] },
  { name: 'Consentmanager', patterns: ['consentmanager.net'] },
];

function detectCmp(ctx: ScanContext): { provider: string | null; tcfDetected: boolean } {
  const allContent = [...ctx.scripts, ...ctx.inlineScripts, ctx.html];

  for (const sig of CMP_SIGNATURES) {
    for (const pattern of sig.patterns) {
      if (allContent.some((s) => s.toLowerCase().includes(pattern.toLowerCase()))) {
        const tcfDetected = ctx.inlineScripts.some(
          (s) => s.includes('__tcfapi') || s.includes('__cmp')
        );
        return { provider: sig.name, tcfDetected };
      }
    }
  }

  const tcfDetected = ctx.inlineScripts.some(
    (s) => s.includes('__tcfapi') || s.includes('__cmp')
  );

  if (tcfDetected) {
    return { provider: 'TCF (fournisseur inconnu)', tcfDetected: true };
  }

  return { provider: null, tcfDetected: false };
}

export const cmpCheck: CheckModule = {
  id: 'cmp',
  category: 'privacy',
  name: 'Consent Management Platform (CMP)',
  impact: 'critical',
  gated: false,
  run(ctx: ScanContext) {
    const { provider, tcfDetected } = detectCmp(ctx);

    if (provider) {
      return {
        status: 'pass',
        description: `CMP detecte : ${provider}${tcfDetected ? ' (compatible TCF)' : ''}.`,
        rawData: { provider, tcfDetected },
      };
    }

    return {
      status: 'fail',
      description: 'Aucune CMP detectee — risque de non-conformite RGPD/CNIL. Un bandeau de consentement est obligatoire.',
      rawData: { provider: null, tcfDetected: false },
    };
  },
};
