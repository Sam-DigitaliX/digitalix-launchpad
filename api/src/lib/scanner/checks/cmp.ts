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

      const rawData = { provider: ctx.cmp.name, tcfDetected, ...ctx.cmp };

      // Branch 1: Reject button completely missing → hard warning
      if (!ctx.cmp.rejectButtonFound) {
        const missing: string[] = ['bouton "Refuser" introuvable'];
        if (!ctx.cmp.acceptButtonFound) missing.push('bouton "Accepter" également introuvable');
        return {
          status: 'warning',
          description: `${details.join(', ')}. ${missing.join(', ')} — non-conforme RGPD/CNIL.`,
          businessNote: 'La CNIL exige un bouton "Refuser" au même niveau visuel que "Accepter". Sans cela, vous êtes en infraction RGPD — risque d\'amende CNIL jusqu\'à 4% du chiffre d\'affaires.',
          rawData,
        };
      }

      // Branch 2: Reject is "Continuer sans accepter" style → tolerated but not recommended
      if (ctx.cmp.rejectIsContinueWithout) {
        return {
          status: 'warning',
          description: `${details.join(', ')}. Mécanisme de refus via "${ctx.cmp.rejectButtonLabel}" — toléré depuis l'arrêt Google 2022 mais non-optimal.`,
          businessNote: 'La CNIL recommande un bouton "Refuser" explicite au même niveau visuel que "Accepter". "Continuer sans accepter" reste un dark pattern qui peut être contesté lors d\'un contrôle.',
          rawData,
        };
      }

      // Branch 3: Accept missing (edge case — reject exists but not accept)
      if (!ctx.cmp.acceptButtonFound) {
        return {
          status: 'warning',
          description: `${details.join(', ')}. Bouton "Accepter" non trouvé.`,
          rawData,
        };
      }

      // Branch 4: Clean — explicit accept + explicit reject
      const labelNote = ctx.cmp.rejectButtonLabel
        ? ` (bouton refus : "${ctx.cmp.rejectButtonLabel}")`
        : '';
      return {
        status: 'pass',
        description: `${details.join(', ')}. Boutons "Accepter" et "Refuser" détectés${labelNote}.`,
        rawData,
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
