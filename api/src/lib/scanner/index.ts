import { fetchPage } from './fetcher.js';
import { allChecks, fetchPageSpeedMetrics, checkLcp, checkCls, checkInp } from './checks/index.js';
import type { CheckResult, CheckModule, OnProgress } from './types.js';

interface AuditCheck {
  id: string;
  category: string;
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'info';
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  gated: boolean;
}

interface AuditCategorySummary {
  id: string;
  name: string;
  score: number;
}

export interface ScanResult {
  url: string;
  status: 'completed' | 'failed';
  overallScore: number;
  categories: AuditCategorySummary[];
  checks: AuditCheck[];
  errorMessage?: string;
  domain: string;
}

const CATEGORY_NAMES: Record<string, string> = {
  tracking: 'Tracking Setup',
  serverside: 'Server-Side',
  privacy: 'Privacy & Consent',
  performance: 'Performance',
};

const CATEGORY_WEIGHTS: Record<string, number> = {
  tracking: 0.30,
  serverside: 0.25,
  privacy: 0.30,
  performance: 0.15,
};

const IMPACT_WEIGHTS: Record<string, number> = {
  critical: 3,
  high: 2,
  medium: 1,
  low: 0.5,
};

function toAuditCheck(module: CheckModule, result: CheckResult): AuditCheck {
  return {
    id: module.id,
    category: module.category,
    name: module.name,
    status: result.status,
    description: result.description,
    impact: module.impact,
    gated: module.gated,
  };
}

function computeCategoryScores(checks: AuditCheck[]): AuditCategorySummary[] {
  const categories = Object.keys(CATEGORY_NAMES);

  return categories.map((catId) => {
    const catChecks = checks.filter((c) => c.category === catId);

    let earnedWeight = 0;
    let totalWeight = 0;

    for (const check of catChecks) {
      const weight = IMPACT_WEIGHTS[check.impact] ?? 1;

      if (check.status === 'info') continue;

      totalWeight += weight;

      if (check.status === 'pass') {
        earnedWeight += weight;
      } else if (check.status === 'warning') {
        earnedWeight += weight * 0.5;
      }
    }

    const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 100;

    return {
      id: catId,
      name: CATEGORY_NAMES[catId],
      score,
    };
  });
}

function computeOverallScore(categories: AuditCategorySummary[]): number {
  let weighted = 0;
  let totalWeight = 0;

  for (const cat of categories) {
    const weight = CATEGORY_WEIGHTS[cat.id] ?? 0;
    weighted += cat.score * weight;
    totalWeight += weight;
  }

  return totalWeight > 0 ? Math.round(weighted / totalWeight) : 0;
}

const noopProgress: OnProgress = () => {};

export async function scanUrl(url: string, onProgress: OnProgress = noopProgress): Promise<ScanResult> {
  // Launch Playwright scan and PageSpeed in parallel
  const [ctxResult, pageSpeedResult] = await Promise.allSettled([
    fetchPage(url, onProgress),
    fetchPageSpeedMetrics(url),
  ]);

  if (ctxResult.status === 'rejected') {
    const errorMessage = ctxResult.reason instanceof Error
      ? ctxResult.reason.message
      : 'Impossible de charger la page.';

    onProgress({ type: 'error', label: errorMessage });

    return {
      url,
      status: 'failed',
      overallScore: 0,
      categories: [],
      checks: [],
      errorMessage,
      domain: extractDomain(url),
    };
  }

  const ctx = ctxResult.value;
  const pageSpeed = pageSpeedResult.status === 'fulfilled'
    ? pageSpeedResult.value
    : { lcp: null, cls: null, inp: null };

  onProgress({ type: 'step_done', label: 'Exécution des vérifications...' });

  // Run all synchronous checks against the ScanContext
  const checks: AuditCheck[] = allChecks.map((module) => {
    const result = module.run(ctx);
    return toAuditCheck(module, result);
  });

  // Add PageSpeed checks
  const lcpResult = checkLcp(pageSpeed.lcp);
  checks.push({
    id: 'lcp',
    category: 'performance',
    name: 'LCP (Largest Contentful Paint)',
    status: lcpResult.status,
    description: lcpResult.description,
    impact: 'high',
    gated: false,
  });

  const clsResult = checkCls(pageSpeed.cls);
  checks.push({
    id: 'cls',
    category: 'performance',
    name: 'CLS (Cumulative Layout Shift)',
    status: clsResult.status,
    description: clsResult.description,
    impact: 'medium',
    gated: true,
  });

  const inpResult = checkInp(pageSpeed.inp);
  checks.push({
    id: 'inp',
    category: 'performance',
    name: 'INP (Interaction to Next Paint)',
    status: inpResult.status,
    description: inpResult.description,
    impact: 'medium',
    gated: true,
  });

  // Compute scores
  const categories = computeCategoryScores(checks);
  const overallScore = computeOverallScore(categories);

  onProgress({ type: 'scan_complete', label: `Score final : ${overallScore}/100` });

  return {
    url,
    status: 'completed',
    overallScore,
    categories,
    checks,
    domain: ctx.domain,
  };
}

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
