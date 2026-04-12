export interface ParsedCookie {
  name: string;
  value: string;
  domain?: string;
  path?: string;
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: string;
  maxAge?: number;
  expires?: string;
  isThirdParty: boolean;
}

export interface ScanContext {
  url: string;
  finalUrl: string;
  domain: string;
  html: string;
  headers: Record<string, string>;
  cookies: ParsedCookie[];
  scripts: string[];
  inlineScripts: string[];
  fetchDurationMs: number;
  statusCode: number;
}

export interface CheckResult {
  status: 'pass' | 'fail' | 'warning' | 'info';
  description: string;
  rawData?: Record<string, unknown>;
}

export interface CheckModule {
  id: string;
  category: 'tracking' | 'serverside' | 'privacy' | 'performance';
  name: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  gated: boolean;
  run: (ctx: ScanContext) => CheckResult;
}
