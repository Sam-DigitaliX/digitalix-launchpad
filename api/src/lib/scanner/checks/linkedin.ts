import type { CheckModule, ScanContext } from '../types.js';

const PARTNER_ID_PATTERN = /_linkedin_partner_id\s*=\s*['"](\d+)['"]/;

export const linkedinCheck: CheckModule = {
  id: 'linkedin',
  category: 'tracking',
  name: 'LinkedIn Insight Tag',
  impact: 'low',
  gated: true,
  run(ctx: ScanContext) {
    const hasLinkedinScript = ctx.scripts.some(
      (s) => s.includes('snap.licdn.com') && s.includes('li.lms-analytics')
    );

    let partnerId: string | null = null;
    for (const script of ctx.inlineScripts) {
      const match = PARTNER_ID_PATTERN.exec(script);
      if (match) {
        partnerId = match[1];
        break;
      }
    }

    if (hasLinkedinScript || partnerId) {
      return {
        status: 'pass',
        description: partnerId
          ? `LinkedIn Insight Tag detecte : partner ID ${partnerId}.`
          : 'LinkedIn Insight Tag detecte.',
        rawData: { partnerId, hasScript: hasLinkedinScript },
      };
    }

    return {
      status: 'info',
      description: 'LinkedIn Insight Tag non detecte.',
      rawData: { partnerId: null },
    };
  },
};
