import type { CheckModule, ScanContext } from '../types.js';

export const ecommerceCheck: CheckModule = {
  id: 'ecommerce',
  category: 'tracking',
  name: 'Plateforme E-commerce',
  impact: 'medium',
  gated: false,
  run(ctx: ScanContext) {
    if (ctx.ecommercePlatform) {
      return {
        status: 'info',
        description: `Plateforme e-commerce detectee : ${ctx.ecommercePlatform}. Les recommandations sont adaptees a cette plateforme.`,
        rawData: { platform: ctx.ecommercePlatform },
      };
    }

    return {
      status: 'info',
      description: 'Aucune plateforme e-commerce detectee (site vitrine ou CMS custom).',
      rawData: { platform: null },
    };
  },
};
