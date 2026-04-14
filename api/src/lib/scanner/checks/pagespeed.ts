import type { CheckResult } from '../types.js';

const PAGESPEED_API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const TIMEOUT_MS = 30000;

interface PageSpeedMetrics {
  lcp: number | null;
  cls: number | null;
  inp: number | null;
}

export async function fetchPageSpeedMetrics(url: string): Promise<PageSpeedMetrics> {
  const params = new URLSearchParams({
    url,
    strategy: 'mobile',
    category: 'performance',
    key: process.env.PAGESPEED_API_KEY ?? '',
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${PAGESPEED_API}?${params}`, {
      signal: controller.signal,
    });

    if (!response.ok) {
      return { lcp: null, cls: null, inp: null };
    }

    const data = await response.json() as Record<string, unknown>;
    const audits = (data as { lighthouseResult?: { audits?: Record<string, { numericValue?: number }> } })
      .lighthouseResult?.audits;

    if (!audits) {
      return { lcp: null, cls: null, inp: null };
    }

    return {
      lcp: audits['largest-contentful-paint']?.numericValue ?? null,
      cls: audits['cumulative-layout-shift']?.numericValue ?? null,
      inp: audits['interaction-to-next-paint']?.numericValue ?? null,
    };
  } catch {
    return { lcp: null, cls: null, inp: null };
  } finally {
    clearTimeout(timeout);
  }
}

export function checkLcp(lcp: number | null): CheckResult {
  if (lcp === null) {
    return {
      status: 'info',
      description: 'LCP non disponible — impossible de contacter l\'API PageSpeed Insights.',
      rawData: { lcp: null },
    };
  }

  const seconds = (lcp / 1000).toFixed(1);

  if (lcp < 2500) {
    return {
      status: 'pass',
      description: `LCP : ${seconds}s — bon (objectif : < 2.5s).`,
      rawData: { lcpMs: lcp },
    };
  }

  if (lcp < 4000) {
    return {
      status: 'warning',
      description: `LCP : ${seconds}s — amélioration nécessaire (objectif : < 2.5s).`,
      businessNote: 'Le LCP est améliorable — optimisez les images et le chargement des ressources critiques.',
      rawData: { lcpMs: lcp },
    };
  }

  return {
    status: 'fail',
    description: `LCP : ${seconds}s — mauvais. Impact direct sur le taux de rebond et le SEO.`,
    businessNote: 'Un LCP supérieur à 4 secondes dégrade votre SEO et votre taux de conversion.',
    rawData: { lcpMs: lcp },
  };
}

export function checkCls(cls: number | null): CheckResult {
  if (cls === null) {
    return {
      status: 'info',
      description: 'CLS non disponible — impossible de contacter l\'API PageSpeed Insights.',
      rawData: { cls: null },
    };
  }

  const value = cls.toFixed(2);

  if (cls < 0.1) {
    return {
      status: 'pass',
      description: `CLS : ${value} — bon (objectif : < 0.1).`,
      rawData: { cls },
    };
  }

  if (cls < 0.25) {
    return {
      status: 'warning',
      description: `CLS : ${value} — amélioration nécessaire (objectif : < 0.1). Les éléments de la page bougent pendant le chargement.`,
      businessNote: 'Des éléments bougent pendant le chargement — ajoutez des dimensions fixes aux images et embeds.',
      rawData: { cls },
    };
  }

  return {
    status: 'fail',
    description: `CLS : ${value} — mauvais. Instabilité visuelle importante, impact sur l'expérience utilisateur.`,
    businessNote: 'Une instabilité visuelle importante dégrade l\'expérience utilisateur et le score SEO.',
    rawData: { cls },
  };
}

export function checkInp(inp: number | null): CheckResult {
  if (inp === null) {
    return {
      status: 'info',
      description: 'INP non disponible — impossible de contacter l\'API PageSpeed Insights.',
      rawData: { inp: null },
    };
  }

  const ms = Math.round(inp);

  if (inp < 200) {
    return {
      status: 'pass',
      description: `INP : ${ms}ms — bon (objectif : < 200ms).`,
      rawData: { inpMs: inp },
    };
  }

  if (inp < 500) {
    return {
      status: 'warning',
      description: `INP : ${ms}ms — amélioration nécessaire (objectif : < 200ms). Les interactions sont lentes.`,
      businessNote: 'Les interactions pourraient être plus réactives. Réduisez le JavaScript bloquant.',
      rawData: { inpMs: inp },
    };
  }

  return {
    status: 'fail',
    description: `INP : ${ms}ms — mauvais. Les interactions avec la page sont très lentes.`,
    businessNote: 'Les interactions sont très lentes — vos visiteurs risquent d\'abandonner avant de convertir.',
    rawData: { inpMs: inp },
  };
}
