export type AuditStatus = 'pending' | 'scanning' | 'completed' | 'failed';

export type CheckStatus = 'pass' | 'fail' | 'warning' | 'info';

export type CheckImpact = 'critical' | 'high' | 'medium' | 'low';

export interface AuditCheck {
  id: string;
  category: string;
  name: string;
  status: CheckStatus;
  description: string;
  impact: CheckImpact;
  /** true = requires email to see */
  gated: boolean;
}

export interface AuditCategorySummary {
  id: string;
  name: string;
  score: number;
}

export interface AuditResult {
  id: string;
  url: string;
  status: AuditStatus;
  overallScore: number;
  categories: AuditCategorySummary[];
  checks: AuditCheck[];
  createdAt: string;
  errorMessage?: string;
}
