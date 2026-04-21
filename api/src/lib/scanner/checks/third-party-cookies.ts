import type { CheckModule, ScanContext, ParsedCookie } from '../types.js';
import { identifyCookieVendor, type CookieVendorInfo } from '../cookie-vendors.js';

interface TrackerEntry {
  name: string;
  domain: string;
  vendor: string;
  role: string;
  /** True si le cookie est sur le domaine first-party (déposé par un script tiers) */
  firstPartyDomain: boolean;
  serverManaged?: boolean;
}

function classify(cookies: ParsedCookie[]): {
  trueThirdParty: ParsedCookie[];        // cookies sur domaine tiers (classification technique)
  trackersOnFirstParty: TrackerEntry[];  // traceurs tiers déposés sur domaine first-party
  identifiedTrackers: TrackerEntry[];    // tous les traceurs identifiés (technique + fonctionnel)
} {
  const trueThirdParty: ParsedCookie[] = [];
  const trackersOnFirstParty: TrackerEntry[] = [];
  const identifiedTrackers: TrackerEntry[] = [];

  for (const c of cookies) {
    const info: CookieVendorInfo | null = identifyCookieVendor(c.name);
    const isTechThirdParty = c.isThirdParty;

    if (info) {
      const entry: TrackerEntry = {
        name: c.name,
        domain: c.domain ?? '(no domain)',
        vendor: info.vendor,
        role: info.role,
        firstPartyDomain: !isTechThirdParty,
        serverManaged: info.serverManaged,
      };
      identifiedTrackers.push(entry);
      if (!isTechThirdParty) trackersOnFirstParty.push(entry);
    }

    if (isTechThirdParty) trueThirdParty.push(c);
  }

  return { trueThirdParty, trackersOnFirstParty, identifiedTrackers };
}

export const thirdPartyCookiesCheck: CheckModule = {
  id: 'third-party-cookies',
  category: 'privacy',
  name: 'Cookies Tiers',
  impact: 'high',
  gated: true,
  run(ctx: ScanContext) {
    const postAccept = ctx.sessions.find((s) => s.phase === 'post-accept');
    const cookies = postAccept?.cookies ?? ctx.cookies;
    const { trueThirdParty, trackersOnFirstParty, identifiedTrackers } = classify(cookies);

    // Définition CNIL : un cookie tiers est déposé par un tiers pour son propre
    // compte, indépendamment du domaine technique. On agrège :
    //  1) les cookies sur domaine techniquement tiers
    //  2) les traceurs identifiés par nom (Google, Meta, TikTok, LinkedIn, MS...)
    //     même s'ils sont sur le domaine first-party (car c'est un script tiers
    //     qui les pose)
    const thirdPartyDomains = [...new Set(
      trueThirdParty.map((c) => c.domain).filter((d): d is string => Boolean(d))
    )];
    const trackerVendors = [...new Set(identifiedTrackers.map((t) => t.vendor))];

    // Dédup : un traceur first-party ne doit pas être compté en double avec sa version tiers
    const trackerNames = new Set(identifiedTrackers.map((t) => t.name));
    const trueThirdPartyNotAlreadyTracker = trueThirdParty.filter((c) => !trackerNames.has(c.name));
    const total = identifiedTrackers.length + trueThirdPartyNotAlreadyTracker.length;

    const rawData = {
      total,
      identifiedTrackers,
      trackersOnFirstPartyCount: trackersOnFirstParty.length,
      trueThirdPartyDomains: thirdPartyDomains,
      trueThirdPartyCount: trueThirdParty.length,
      vendors: trackerVendors,
    };

    if (total === 0) {
      return {
        status: 'pass',
        description: 'Aucun cookie tiers détecté après acceptation.',
        rawData,
      };
    }

    // Construction de la description lisible
    const parts: string[] = [];
    if (trackersOnFirstParty.length > 0) {
      const byVendor = [...new Set(trackersOnFirstParty.map((t) => t.vendor))];
      parts.push(`${trackersOnFirstParty.length} traceur(s) tiers déposé(s) sur votre domaine (scripts ${byVendor.join(', ')})`);
    }
    if (thirdPartyDomains.length > 0) {
      parts.push(`${trueThirdParty.length} cookie(s) sur domaine(s) tiers : ${thirdPartyDomains.join(', ')}`);
    }
    const summary = parts.join(' ; ');

    // Safari impact note — added to warning/fail cases to inform prospects
    // about the real-world lifetime of these cookies beyond our Chromium scan.
    const safariImpact = thirdPartyDomains.length > 0 && trackersOnFirstParty.length > 0
      ? 'Impact Safari (≈ 20-25% du trafic EU) : cookies sur domaines tiers **bloqués entièrement** depuis 2020 (ITP 2.3) ; traceurs first-party posés par JavaScript **cappés à 7 jours max**.'
      : thirdPartyDomains.length > 0
      ? 'Impact Safari (≈ 20-25% du trafic EU) : cookies sur domaines tiers **bloqués entièrement** depuis 2020 (ITP 2.3).'
      : 'Impact Safari (≈ 20-25% du trafic EU) : traceurs posés par JavaScript **cappés à 7 jours max** (ITP 2.1+).';

    if (total <= 2) {
      return {
        status: 'pass',
        description: `${summary} — niveau acceptable. ${safariImpact}`,
        rawData,
      };
    }

    if (total <= 10) {
      return {
        status: 'warning',
        description: `${summary}. Au sens CNIL, ces cookies sont considérés comme tiers (déposés pour le compte d'un tiers) et nécessitent le consentement utilisateur. ${safariImpact}`,
        businessNote: 'Double enjeu. Côté RGPD : vérifiez que tous ces traceurs sont couverts par votre bandeau de consentement (aucune écriture avant acceptation explicite). Côté attribution : passez les traceurs Google en server-managed (FPID / FPGCLAW via sGTM) pour bypass la limite ITP 7j de Safari — sinon vous perdez 20-25% de fenêtre d\'attribution sur iOS/macOS.',
        rawData,
      };
    }

    return {
      status: 'fail',
      description: `${summary}. Nombre élevé de traceurs tiers — impact direct sur la conformité RGPD et la vie privée. ${safariImpact}`,
      businessNote: 'Trop de traceurs tiers. Activez un consentement strict avant toute écriture de cookie, auditez régulièrement vos tags, et basculez les essentiels (GA4, Google Ads) en server-managed via sGTM pour préserver l\'attribution sur Safari (≈ 20-25% du trafic EU).',
      rawData,
    };
  },
};
