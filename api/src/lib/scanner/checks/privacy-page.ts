import type { CheckModule, ScanContext } from '../types.js';

const PRIVACY_PATTERNS = [
  'politique-de-confidentialite',
  'privacy-policy',
  'privacy',
  'confidentialite',
  'donnees-personnelles',
  'personal-data',
  'data-protection',
];

const LEGAL_PATTERNS = [
  'mentions-legales',
  'legal-notice',
  'legal',
  'cgv',
  'cgu',
];

export const privacyPageCheck: CheckModule = {
  id: 'privacy-page',
  category: 'privacy',
  name: 'Page Politique de Confidentialite',
  impact: 'medium',
  gated: true,
  run(ctx: ScanContext) {
    const htmlLower = ctx.html.toLowerCase();

    const hasPrivacyLink = PRIVACY_PATTERNS.some((p) => htmlLower.includes(`href`) && htmlLower.includes(p));
    const hasLegalLink = LEGAL_PATTERNS.some((p) => htmlLower.includes(`href`) && htmlLower.includes(p));

    if (hasPrivacyLink) {
      return {
        status: 'pass',
        description: 'Lien vers une page de politique de confidentialite detecte.',
        rawData: { hasPrivacyLink, hasLegalLink },
      };
    }

    if (hasLegalLink) {
      return {
        status: 'warning',
        description: 'Page de mentions legales detectee mais pas de politique de confidentialite dediee. Le RGPD recommande une page separee.',
        rawData: { hasPrivacyLink: false, hasLegalLink },
      };
    }

    return {
      status: 'fail',
      description: 'Aucun lien vers une page de confidentialite ou mentions legales detecte.',
      rawData: { hasPrivacyLink: false, hasLegalLink: false },
    };
  },
};
