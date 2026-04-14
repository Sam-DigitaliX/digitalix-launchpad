import type { CheckModule, ScanContext } from '../types.js';

export const cmpCheck: CheckModule = {
  id: 'cmp',
  category: 'privacy',
  name: 'Consent Management Platform (CMP)',
  impact: 'critical',
  gated: false,
  run(ctx: ScanContext) {
    // Use Playwright CMP detection if available
    if (ctx.cmp) {
      const tcfDetected = ctx.sessions.some((s) =>
        s.dataLayerPushes.some((p) => JSON.stringify(p).includes('__tcfapi'))
      ) || ctx.inlineScripts.some((s) => s.includes('__tcfapi') || s.includes('__cmp'));

      const details: string[] = [`CMP détectée : ${ctx.cmp.name}`];
      if (tcfDetected) details.push('compatible TCF');
      details.push(`apparition en ${(ctx.cmp.appearanceDelayMs / 1000).toFixed(1)}s`);

      const issues: string[] = [];
      if (!ctx.cmp.acceptButtonFound) issues.push('bouton "Accepter" non trouvé');
      if (!ctx.cmp.rejectButtonFound) issues.push('bouton "Refuser" non trouvé — non-conforme RGPD/CNIL');

      if (issues.length > 0) {
        return {
          status: 'warning',
          description: `${details.join(', ')}. Attention : ${issues.join(', ')}.`,
          businessNote: 'Sans bandeau de consentement conforme, vous êtes en infraction RGPD. Risque d\'amende CNIL jusqu\'à 4% du chiffre d\'affaires.',
          rawData: { provider: ctx.cmp.name, tcfDetected, ...ctx.cmp },
        };
      }

      return {
        status: 'pass',
        description: `${details.join(', ')}. Boutons accepter et refuser détectés.`,
        rawData: { provider: ctx.cmp.name, tcfDetected, ...ctx.cmp },
      };
    }

    // Fallback: HTML-based detection
    const CMP_PATTERNS = [
      { name: 'Cookiebot', p: ['consent.cookiebot.com'] },
      { name: 'Didomi', p: ['sdk.privacy-center.org', 'didomi'] },
      { name: 'OneTrust', p: ['cdn.cookielaw.org', 'onetrust'] },
      { name: 'Axeptio', p: ['static.axept.io', 'axeptio'] },
      { name: 'Sirdata', p: ['sirdata', 'sddan.com'] },
      { name: 'TarteAuCitron', p: ['tarteaucitron'] },
      { name: 'Usercentrics', p: ['usercentrics'] },
      { name: 'CookieYes', p: ['cookieyes'] },
    ];

    const allContent = [...ctx.scripts, ...ctx.inlineScripts].join(' ').toLowerCase();
    for (const sig of CMP_PATTERNS) {
      if (sig.p.some((p) => allContent.includes(p.toLowerCase()))) {
        return {
          status: 'pass',
          description: `CMP détectée : ${sig.name} (détection HTML).`,
          rawData: { provider: sig.name, detectionMethod: 'html' },
        };
      }
    }

    return {
      status: 'fail',
      description: 'Aucune CMP détectée — risque de non-conformité RGPD/CNIL. Un bandeau de consentement est obligatoire.',
      businessNote: 'Sans bandeau de consentement, vous êtes en infraction RGPD. Risque d\'amende CNIL jusqu\'à 4% du chiffre d\'affaires.',
      rawData: { provider: null },
    };
  },
};
