import type { CheckModule, ScanContext } from '../types.js';

const TRACKING_PATTERNS: { name: string; pattern: string }[] = [
  { name: 'Google Analytics', pattern: '/g/collect' },
  { name: 'Google Analytics', pattern: '/j/collect' },
  { name: 'GTM', pattern: 'gtm.js' },
  { name: 'Meta Pixel', pattern: 'facebook.com/tr' },
  { name: 'Meta Pixel', pattern: 'fbevents.js' },
  { name: 'TikTok', pattern: 'analytics.tiktok.com' },
  { name: 'LinkedIn', pattern: 'snap.licdn.com' },
  { name: 'Google Ads', pattern: 'googleads.g.doubleclick.net' },
  { name: 'Floodlight', pattern: 'fls.doubleclick.net' },
];

export const tagFiringOrderCheck: CheckModule = {
  id: 'tag-firing-order',
  category: 'tracking',
  name: 'Ordre de Déclenchement des Tags',
  impact: 'medium',
  gated: true,
  run(ctx: ScanContext) {
    const postAccept = ctx.sessions.find((s) => s.phase === 'post-accept');
    const preConsent = ctx.sessions.find((s) => s.phase === 'pre-consent');

    if (!postAccept && !preConsent) {
      return {
        status: 'info',
        description: 'Données de session non disponibles pour l\'analyse de l\'ordre des tags.',
        rawData: {},
      };
    }

    // Analyze post-accept session (most complete tracking)
    const session = postAccept ?? preConsent!;
    const trackingRequests = session.networkRequests
      .filter((r) => TRACKING_PATTERNS.some((p) => r.url.includes(p.pattern)))
      .sort((a, b) => a.timestamp - b.timestamp);

    if (trackingRequests.length === 0) {
      return {
        status: 'warning',
        description: 'Aucune requête tracking détectée après consentement.',
        businessNote: 'L\'ordre de déclenchement des tags n\'est pas optimal. Le consentement doit être vérifié avant tout déclenchement de tracking.',
        rawData: { firingOrder: [] },
      };
    }

    // Build firing order
    const firingOrder = trackingRequests.map((r) => {
      const matched = TRACKING_PATTERNS.find((p) => r.url.includes(p.pattern));
      return {
        name: matched?.name ?? 'Unknown',
        url: r.url.substring(0, 100),
        timestamp: r.timestamp,
      };
    });

    // Deduplicate by name (keep first occurrence)
    const seen = new Set<string>();
    const uniqueOrder = firingOrder.filter((f) => {
      if (seen.has(f.name)) return false;
      seen.add(f.name);
      return true;
    });

    const orderNames = uniqueOrder.map((f) => f.name);

    // Check if consent update fires before tracking (good practice)
    const consentUpdateTime = session.networkRequests
      .find((r) => r.url.includes('consent') || r.url.includes('gcs='))?.timestamp ?? 0;
    const firstTrackingTime = trackingRequests[0]?.timestamp ?? 0;

    const consentBeforeTracking = consentUpdateTime > 0 && consentUpdateTime <= firstTrackingTime;

    return {
      status: 'pass',
      description: `${uniqueOrder.length} outil(s) tracking détecté(s). Ordre : ${orderNames.join(' → ')}.${consentBeforeTracking ? ' Consentement géré avant le déclenchement.' : ''}`,
      rawData: { firingOrder: uniqueOrder, consentBeforeTracking, totalRequests: trackingRequests.length },
    };
  },
};
