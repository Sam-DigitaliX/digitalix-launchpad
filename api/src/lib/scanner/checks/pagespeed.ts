import type { CheckResult } from '../types.js';

const PAGESPEED_API = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
const TIMEOUT_MS = 90000;

interface PageSpeedMetrics {
  lcp: number | null;
  cls: number | null;
  inp: number | null;
  error: string | null;
}

export async function fetchPageSpeedMetrics(url: string): Promise<PageSpeedMetrics> {
  const apiKey = process.env.PAGESPEED_API_KEY ?? '';
  const hasKey = apiKey.length > 0;

  const params = new URLSearchParams({
    url,
    strategy: 'mobile',
    category: 'performance',
    key: apiKey,
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const startedAt = Date.now();

  console.log(`[pagespeed] Start url=${url} hasKey=${hasKey} timeoutMs=${TIMEOUT_MS}`);

  try {
    const response = await fetch(`${PAGESPEED_API}?${params}`, {
      signal: controller.signal,
    });

    const elapsed = Date.now() - startedAt;

    if (!response.ok) {
      const body = await response.text().catch(() => '<unreadable>');
      const snippet = body.slice(0, 200).replace(/\s+/g, ' ');
      const error = `HTTP ${response.status} after ${elapsed}ms${hasKey ? '' : ' (no API key)'} — ${snippet}`;
      console.error(`[pagespeed] ${error}`);
      return { lcp: null, cls: null, inp: null, error };
    }

    const data = await response.json() as Record<string, unknown>;
    const audits = (data as { lighthouseResult?: { audits?: Record<string, { numericValue?: number }> } })
      .lighthouseResult?.audits;

    if (!audits) {
      const error = `Réponse sans lighthouseResult.audits (clés: ${Object.keys(data).join(',')})`;
      console.error(`[pagespeed] ${error}`);
      return { lcp: null, cls: null, inp: null, error };
    }

    const metrics = {
      lcp: audits['largest-contentful-paint']?.numericValue ?? null,
      cls: audits['cumulative-layout-shift']?.numericValue ?? null,
      inp: audits['interaction-to-next-paint']?.numericValue ?? null,
      error: null,
    };

    console.log(`[pagespeed] OK in ${elapsed}ms — lcp=${metrics.lcp} cls=${metrics.cls} inp=${metrics.inp}`);
    return metrics;
  } catch (err) {
    const elapsed = Date.now() - startedAt;
    const isAbort = err instanceof Error && err.name === 'AbortError';
    const reason = isAbort ? `timeout after ${TIMEOUT_MS}ms` : (err instanceof Error ? `${err.name}: ${err.message}` : String(err));
    const error = `${reason}${hasKey ? '' : ' (no API key)'} — elapsed ${elapsed}ms`;
    console.error(`[pagespeed] ${error}`);
    return { lcp: null, cls: null, inp: null, error };
  } finally {
    clearTimeout(timeout);
  }
}

export function checkLcp(lcp: number | null, error: string | null = null): CheckResult {
  if (lcp === null) {
    return {
      status: 'info',
      description: `LCP non disponible — PageSpeed Insights : ${error ?? 'erreur inconnue'}.`,
      rawData: { lcp: null, pagespeedError: error },
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

export function checkCls(cls: number | null, error: string | null = null): CheckResult {
  if (cls === null) {
    return {
      status: 'info',
      description: `CLS non disponible — PageSpeed Insights : ${error ?? 'erreur inconnue'}.`,
      rawData: { cls: null, pagespeedError: error },
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

export function checkInp(inp: number | null, error: string | null = null): CheckResult {
  if (inp === null) {
    return {
      status: 'info',
      description: `INP non disponible — PageSpeed Insights : ${error ?? 'erreur inconnue'}.`,
      rawData: { inp: null, pagespeedError: error },
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
