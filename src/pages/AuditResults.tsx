import { useState, useEffect, useRef } from "react";
import { useLocation, useParams, useSearchParams, Link } from "react-router-dom";
import Header from "@/components/landing/Header";
import EvervaultGlow from "@/components/landing/EvervaultGlow";
import Footer from "@/components/landing/Footer";
import { startAudit, streamAuditProgress, getAudit, unlockAudit, trackAuditEmailClick, ApiError } from "@/lib/api";
import type { AuditProgressEvent } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BlockProgressLoader } from "@/components/ui/block-progress-loader";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Lock,
  Mail,
  ArrowRight,
  ExternalLink,
  Activity,
  Globe,
  Shield,
  Zap,
  Loader2,
  RefreshCw,
} from "lucide-react";
import type { AuditCheck, AuditResult, AuditCategorySummary } from "@/types/audit";

/* ══════════════════════════════════════════════════════════════════
   Score Circle (SVG)
   ══════════════════════════════════════════════════════════════════ */

const ScoreCircle = ({
  score,
  animate,
}: {
  score: number;
  animate: boolean;
}) => {
  const circumference = 2 * Math.PI * 54;
  const offset = animate
    ? circumference - (score / 100) * circumference
    : circumference;
  const color =
    score >= 90
      ? "text-emerald-400"
      : score >= 70
      ? "text-primary"
      : score >= 50
      ? "text-amber-400"
      : "text-destructive";

  return (
    <div className="relative w-36 h-36 md:w-44 md:h-44">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r="54"
          className="stroke-white/[0.08]"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="60"
          cy="60"
          r="54"
          className={`stroke-current ${color}`}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.5s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl md:text-5xl font-bold ${color}`}>
          {animate ? score : 0}
        </span>
        <span className="text-xs text-muted-foreground">/100</span>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   Status & Category helpers
   ══════════════════════════════════════════════════════════════════ */

const StatusIcon = ({ status }: { status: string }) => {
  switch (status) {
    case "pass":
      return <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />;
    case "fail":
      return <XCircle className="w-5 h-5 text-destructive shrink-0" />;
    case "warning":
      return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
    default:
      return <Info className="w-5 h-5 text-blue-400 shrink-0" />;
  }
};

const categoryIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  tracking: Activity,
  serverside: Globe,
  privacy: Shield,
  performance: Zap,
};

function getCategoryColor(score: number): string {
  if (score >= 70) return "text-emerald-400";
  if (score >= 50) return "text-amber-400";
  return "text-destructive";
}

/* ══════════════════════════════════════════════════════════════════
   Check Row
   ══════════════════════════════════════════════════════════════════ */

const IMPACT_LABELS: Record<string, string> = {
  critical: "Essentiel",
  high: "Important",
  medium: "Utile",
  low: "Mineur",
};

const IMPACT_COLORS: Record<string, string> = {
  critical: "bg-destructive/15 text-destructive",
  high: "bg-amber-500/15 text-amber-400",
  medium: "bg-primary/15 text-primary",
  low: "bg-muted text-muted-foreground",
};

const CheckRow = ({ check }: { check: AuditCheck }) => (
  <div className="ev-card p-4">
    <div className="relative z-10 flex items-start gap-4">
    <StatusIcon status={check.status} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className="font-semibold text-sm text-foreground">
          {check.name}
        </span>
        {check.status !== "pass" && (
          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${IMPACT_COLORS[check.impact] ?? IMPACT_COLORS.medium}`}>
            {IMPACT_LABELS[check.impact] ?? check.impact}
          </span>
        )}
      </div>
      <p className="text-sm text-muted-foreground">{check.description}</p>
      {check.businessNote && check.status !== "pass" && (
        <p className="text-xs text-amber-400/80 mt-1.5">{check.businessNote}</p>
      )}
    </div>
    </div>
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   Trackers Table
   ══════════════════════════════════════════════════════════════════ */

const TRACKER_IDS = ['gtm', 'ga4', 'meta-pixel', 'tiktok', 'linkedin', 'sgtm'];

const TRACKER_PLATFORMS: Record<string, string> = {
  gtm: 'Google',
  ga4: 'Google',
  'meta-pixel': 'Meta',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  sgtm: 'Google',
};

function getTrackerIds(check: AuditCheck): string {
  const raw = typeof check.rawData === 'string' ? JSON.parse(check.rawData) : (check.rawData ?? {});
  if (raw.containerIds?.length) return raw.containerIds.join(', ');
  if (raw.measurementIds?.length) return raw.measurementIds.join(', ');
  if (raw.networkIds?.length) return raw.networkIds.join(', ');
  if (raw.pixelIds?.length) return raw.pixelIds.join(', ');
  if (raw.pixelId) return raw.pixelId;
  if (raw.partnerId) return raw.partnerId;
  if (raw.gtmDomain) return raw.gtmDomain;
  return '—';
}

function getLoadingMethod(check: AuditCheck): string {
  const raw = typeof check.rawData === 'string' ? JSON.parse(check.rawData) : (check.rawData ?? {});
  if (check.id === 'sgtm') return raw.isFirstParty ? 'Server-side (1st party)' : 'Client-side';
  if (raw.viaGtm) return 'Via GTM';
  return 'Direct';
}

const TrackersTable = ({ checks }: { checks: AuditCheck[] }) => {
  const trackerChecks = TRACKER_IDS
    .map((id) => checks.find((c) => c.id === id))
    .filter((c): c is AuditCheck => c !== undefined);

  if (trackerChecks.length === 0) return null;

  return (
    <div className="ev-card overflow-hidden">
      <div className="relative z-10">
        <div className="px-5 py-4 border-b border-glass-border">
          <h3 className="text-sm font-bold text-foreground font-display">Trackers détectés</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-glass-border">
                <th className="px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Tracker</th>
                <th className="px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Plateforme</th>
                <th className="px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">ID</th>
                <th className="px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Méthode</th>
                <th className="px-5 py-3 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">Statut</th>
              </tr>
            </thead>
            <tbody>
              {trackerChecks.map((check) => (
                <tr key={check.id} className="border-b border-glass-border/40">
                  <td className="px-5 py-3 font-medium text-foreground">{check.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{TRACKER_PLATFORMS[check.id] ?? '—'}</td>
                  <td className="px-5 py-3 font-mono text-xs text-muted-foreground">{getTrackerIds(check)}</td>
                  <td className="px-5 py-3 text-muted-foreground">{getLoadingMethod(check)}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                      check.status === 'pass' ? 'text-emerald-400' :
                      check.status === 'fail' ? 'text-red-400' :
                      check.status === 'warning' ? 'text-amber-400' :
                      'text-muted-foreground'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        check.status === 'pass' ? 'bg-emerald-400' :
                        check.status === 'fail' ? 'bg-red-400' :
                        check.status === 'warning' ? 'bg-amber-400' :
                        'bg-muted-foreground'
                      }`} />
                      {check.status === 'pass' ? 'Détecté' :
                       check.status === 'fail' ? 'Non détecté' :
                       check.status === 'warning' ? 'Partiel' :
                       'Non détecté'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   Privacy & Consent Section
   ══════════════════════════════════════════════════════════════════ */

const PRIVACY_IDS = ['cmp', 'consent-mode', 'pre-consent-violations', 'post-reject-violations', 'third-party-cookies', 'privacy-page', 'first-party-cookies'];

function parseRawData(check: AuditCheck): Record<string, unknown> {
  if (!check.rawData) return {};
  return typeof check.rawData === 'string' ? JSON.parse(check.rawData) : check.rawData;
}

const PrivacySection = ({ checks }: { checks: AuditCheck[] }) => {
  const privacyChecks = PRIVACY_IDS
    .map((id) => checks.find((c) => c.id === id))
    .filter((c): c is AuditCheck => c !== undefined);

  if (privacyChecks.length === 0) return null;

  const cmp = privacyChecks.find((c) => c.id === 'cmp');
  const consentMode = privacyChecks.find((c) => c.id === 'consent-mode');
  const preConsent = privacyChecks.find((c) => c.id === 'pre-consent-violations');
  const postReject = privacyChecks.find((c) => c.id === 'post-reject-violations');
  const thirdParty = privacyChecks.find((c) => c.id === 'third-party-cookies');
  const firstParty = privacyChecks.find((c) => c.id === 'first-party-cookies');
  const privacyPage = privacyChecks.find((c) => c.id === 'privacy-page');

  const cmpRaw = cmp ? parseRawData(cmp) : {};
  const consentRaw = consentMode ? parseRawData(consentMode) : {};
  const preRaw = preConsent ? parseRawData(preConsent) : {};
  const thirdRaw = thirdParty ? parseRawData(thirdParty) : {};
  const firstRaw = firstParty ? parseRawData(firstParty) : {};

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground font-display">Privacy & Consentement</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CMP */}
        {cmp && (
          <div className="ev-card p-5">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <StatusIcon status={cmp.status} />
                <span className="font-semibold text-sm text-foreground">Bandeau de consentement (CMP)</span>
              </div>
              {cmp.status === 'pass' ? (
                <div className="space-y-2 text-xs text-muted-foreground">
                  <p>CMP : <span className="text-foreground font-medium">{String(cmpRaw.provider ?? '—')}</span></p>
                  {cmpRaw.appearanceDelayMs != null && (
                    <p>Délai d'apparition : <span className="text-foreground font-mono">{(Number(cmpRaw.appearanceDelayMs) / 1000).toFixed(1)}s</span></p>
                  )}
                  <div className="flex gap-3">
                    <span className={cmpRaw.acceptButtonFound ? 'text-emerald-400' : 'text-red-400'}>
                      Accepter : {cmpRaw.acceptButtonFound ? '✓' : '✗'}
                    </span>
                    <span className={cmpRaw.rejectButtonFound ? 'text-emerald-400' : 'text-red-400'}>
                      Refuser : {cmpRaw.rejectButtonFound ? '✓' : '✗'}
                    </span>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">{cmp.description}</p>
                  {cmp.businessNote && <p className="text-xs text-amber-400/80 mt-1.5">{cmp.businessNote}</p>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Consent Mode v2 */}
        {consentMode && (
          <div className="ev-card p-5">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <StatusIcon status={consentMode.status} />
                <span className="font-semibold text-sm text-foreground">Google Consent Mode v2</span>
              </div>
              {consentMode.status === 'pass' && consentRaw.defaultParams ? (
                <div className="space-y-2 text-xs">
                  <p className="text-muted-foreground">Paramètres détectés :</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(consentRaw.defaultParams as Record<string, string>).map(([key, val]) => (
                      <span key={key} className={`px-2 py-0.5 rounded font-mono text-[10px] ${val === 'denied' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {key}: {val}
                      </span>
                    ))}
                  </div>
                  {consentRaw.hasAdvancedMode && (
                    <p className="text-emerald-400 text-[11px]">Mode avancé actif (pings anonymisés)</p>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">{consentMode.description}</p>
                  {consentMode.businessNote && <p className="text-xs text-amber-400/80 mt-1.5">{consentMode.businessNote}</p>}
                  {consentRaw.missingDefault && (consentRaw.missingDefault as string[]).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(consentRaw.missingDefault as string[]).map((p) => (
                        <span key={p} className="px-2 py-0.5 rounded font-mono text-[10px] bg-red-500/10 text-red-400 border border-red-500/20">
                          {p} manquant
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pre-consent violations */}
        {preConsent && (
          <div className="ev-card p-5">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <StatusIcon status={preConsent.status} />
                <span className="font-semibold text-sm text-foreground">Violations pré-consentement</span>
              </div>
              <p className="text-sm text-muted-foreground">{preConsent.description}</p>
              {preConsent.businessNote && preConsent.status !== 'pass' && (
                <p className="text-xs text-amber-400/80 mt-1.5">{preConsent.businessNote}</p>
              )}
              {preConsent.status === 'fail' && (preRaw.violatingRequests as string[] | undefined)?.length ? (
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Domaines fautifs :</p>
                  {(preRaw.violatingRequests as string[]).slice(0, 5).map((r, i) => (
                    <p key={i} className="text-xs font-mono text-red-400/80 truncate">{r}</p>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Post-reject violations */}
        {postReject && (
          <div className="ev-card p-5">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <StatusIcon status={postReject.status} />
                <span className="font-semibold text-sm text-foreground">Respect du refus</span>
              </div>
              <p className="text-sm text-muted-foreground">{postReject.description}</p>
              {postReject.businessNote && postReject.status !== 'pass' && (
                <p className="text-xs text-amber-400/80 mt-1.5">{postReject.businessNote}</p>
              )}
            </div>
          </div>
        )}

        {/* Third-party cookies */}
        {thirdParty && (
          <div className="ev-card p-5">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <StatusIcon status={thirdParty.status} />
                <span className="font-semibold text-sm text-foreground">Cookies tiers</span>
              </div>
              <p className="text-sm text-muted-foreground">{thirdParty.description}</p>
              {(thirdRaw.domains as string[] | undefined)?.length ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(thirdRaw.domains as string[]).slice(0, 8).map((d) => (
                    <span key={d} className="px-2 py-0.5 rounded font-mono text-[10px] bg-glass text-muted-foreground border border-glass-border">
                      {d}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* First-party cookies */}
        {firstParty && (
          <div className="ev-card p-5">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <StatusIcon status={firstParty.status} />
                <span className="font-semibold text-sm text-foreground">Cookies first-party</span>
              </div>
              <p className="text-sm text-muted-foreground">{firstParty.description}</p>
              {(firstRaw.serverCookies as string[] | undefined)?.length ? (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(firstRaw.serverCookies as string[]).map((c) => (
                    <span key={c} className="px-2 py-0.5 rounded font-mono text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {c}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* Privacy page */}
        {privacyPage && (
          <div className="ev-card p-5">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <StatusIcon status={privacyPage.status} />
                <span className="font-semibold text-sm text-foreground">Politique de confidentialité</span>
              </div>
              <p className="text-sm text-muted-foreground">{privacyPage.description}</p>
              {privacyPage.businessNote && privacyPage.status !== 'pass' && (
                <p className="text-xs text-amber-400/80 mt-1.5">{privacyPage.businessNote}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   Recommendations Section
   ══════════════════════════════════════════════════════════════════ */

const IMPACT_ORDER: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };

const ACTION_PREFIXES: Record<string, string> = {
  gtm: 'Installer',
  ga4: 'Configurer',
  'meta-pixel': 'Installer',
  'enhanced-conv': 'Activer',
  datalayer: 'Configurer',
  sgtm: 'Passer au',
  'capi-google': 'Configurer',
  'capi-meta': 'Configurer',
  'first-party-cookies': 'Activer',
  cmp: 'Installer',
  'consent-mode': 'Configurer',
  'pre-consent-violations': 'Corriger',
  'post-reject-violations': 'Corriger',
  'third-party-cookies': 'Vérifier',
  'privacy-page': 'Ajouter',
  'page-load': 'Optimiser',
  'script-loading': 'Optimiser',
  'scripts-count': 'Réduire',
  lcp: 'Améliorer',
  cls: 'Corriger',
  tbt: 'Améliorer',
  'tag-firing-order': 'Corriger',
  tiktok: 'Installer',
  linkedin: 'Installer',
  ecommerce: 'Configurer',
};

const RecommendationsSection = ({ checks }: { checks: AuditCheck[] }) => {
  const actionableChecks = checks
    .filter((c) => c.status === 'fail' || c.status === 'warning')
    .sort((a, b) => (IMPACT_ORDER[a.impact] ?? 3) - (IMPACT_ORDER[b.impact] ?? 3));

  if (actionableChecks.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground font-display">Recommandations</h3>
      <p className="text-sm text-muted-foreground">
        {actionableChecks.length} action{actionableChecks.length > 1 ? 's' : ''} recommandée{actionableChecks.length > 1 ? 's' : ''}, triées par priorité.
      </p>

      <div className="space-y-3">
        {actionableChecks.map((check, i) => {
          const prefix = ACTION_PREFIXES[check.id] ?? 'Configurer';
          return (
            <div key={check.id} className="ev-card p-5">
              <div className="relative z-10">
                <div className="flex items-start gap-4">
                  {/* Number */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/20 flex items-center justify-center">
                    <span className="text-sm font-bold font-display bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      {i + 1}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Title + badge */}
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-bold text-foreground">
                        {prefix} {check.name}
                      </span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${IMPACT_COLORS[check.impact] ?? IMPACT_COLORS.medium}`}>
                        {IMPACT_LABELS[check.impact] ?? check.impact}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-muted-foreground">{check.description}</p>

                    {/* Business note */}
                    {check.businessNote && (
                      <p className="text-sm text-amber-400/90 mt-2">{check.businessNote}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div className="ev-card p-6 text-center mt-6">
        <div className="relative z-10">
          <p className="text-foreground font-semibold mb-2">Besoin d'aide pour mettre en place ces recommandations ?</p>
          <p className="text-sm text-muted-foreground mb-4">Un expert DigitaliX analyse vos résultats et vous accompagne.</p>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 ev-btn-primary text-sm font-bold rounded-xl"
          >
            Contactez un expert
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   Performance Section
   ══════════════════════════════════════════════════════════════════ */

const PERFORMANCE_IDS = ['page-load', 'lcp', 'cls', 'tbt', 'scripts-count', 'script-loading'];

function MetricGauge({ value, thresholds, unit, label, status, errorDetail }: {
  value: number | null;
  thresholds: [number, number];
  unit: string;
  label: string;
  status: string;
  errorDetail?: string | null;
}) {
  if (value === null) {
    return (
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold text-muted-foreground font-display">—</p>
        <p className="text-[10px] text-muted-foreground mt-1">Non disponible</p>
        {errorDetail && (
          <p className="text-[9px] text-amber-400/80 mt-1 break-words px-1">{errorDetail}</p>
        )}
      </div>
    );
  }

  const color = status === 'pass' ? 'text-emerald-400' : status === 'warning' ? 'text-amber-400' : 'text-red-400';
  const bgColor = status === 'pass' ? 'bg-emerald-400' : status === 'warning' ? 'bg-amber-400' : 'bg-red-400';
  const pct = Math.min(value / (thresholds[1] * 1.5) * 100, 100);

  return (
    <div className="text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold font-display ${color}`}>{value}{unit}</p>
      <div className="w-full h-1.5 rounded-full bg-white/[0.06] mt-2">
        <div className={`h-full rounded-full ${bgColor} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-muted-foreground">0</span>
        <span className="text-[9px] text-emerald-400/60">{thresholds[0]}{unit}</span>
        <span className="text-[9px] text-red-400/60">{thresholds[1]}{unit}</span>
      </div>
    </div>
  );
}

const PerformanceSection = ({ checks }: { checks: AuditCheck[] }) => {
  const perfChecks = PERFORMANCE_IDS
    .map((id) => checks.find((c) => c.id === id))
    .filter((c): c is AuditCheck => c !== undefined);

  if (perfChecks.length === 0) return null;

  const lcp = perfChecks.find((c) => c.id === 'lcp');
  const cls = perfChecks.find((c) => c.id === 'cls');
  const tbt = perfChecks.find((c) => c.id === 'tbt');
  const pageLoad = perfChecks.find((c) => c.id === 'page-load');
  const scriptsCount = perfChecks.find((c) => c.id === 'scripts-count');
  const scriptLoading = perfChecks.find((c) => c.id === 'script-loading');

  const lcpRaw = lcp ? parseRawData(lcp) : {};
  const clsRaw = cls ? parseRawData(cls) : {};
  const tbtRaw = tbt ? parseRawData(tbt) : {};
  const pageLoadRaw = pageLoad ? parseRawData(pageLoad) : {};
  const scriptsRaw = scriptsCount ? parseRawData(scriptsCount) : {};
  const loadingRaw = scriptLoading ? parseRawData(scriptLoading) : {};

  const lcpValue = lcpRaw.lcpMs != null ? Number((Number(lcpRaw.lcpMs) / 1000).toFixed(1)) : null;
  const clsValue = clsRaw.cls != null ? Number(Number(clsRaw.cls).toFixed(2)) : null;
  const tbtValue = tbtRaw.tbtMs != null ? Math.round(Number(tbtRaw.tbtMs)) : null;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-foreground font-display">Performance</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Core Web Vitals */}
        <div className="ev-card p-5 md:col-span-2">
          <div className="relative z-10">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">Core Web Vitals</p>
            <div className="grid grid-cols-3 gap-6">
              <MetricGauge
                value={lcpValue}
                thresholds={[2.5, 4]}
                unit="s"
                label="LCP"
                status={lcp?.status ?? 'info'}
                errorDetail={lcpRaw.pagespeedError as string | null | undefined}
              />
              <MetricGauge
                value={clsValue}
                thresholds={[0.1, 0.25]}
                unit=""
                label="CLS"
                status={cls?.status ?? 'info'}
                errorDetail={clsRaw.pagespeedError as string | null | undefined}
              />
              <MetricGauge
                value={tbtValue}
                thresholds={[200, 600]}
                unit="ms"
                label="TBT"
                status={tbt?.status ?? 'info'}
                errorDetail={tbtRaw.pagespeedError as string | null | undefined}
              />
            </div>
          </div>
        </div>

        {/* Server response time */}
        {pageLoad && (
          <div className="ev-card p-5">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <StatusIcon status={pageLoad.status} />
                <span className="font-semibold text-sm text-foreground">Temps de réponse serveur</span>
              </div>
              {pageLoadRaw.durationMs != null ? (
                <p className="text-2xl font-bold font-display text-foreground">
                  {(Number(pageLoadRaw.durationMs) / 1000).toFixed(1)}s
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">{pageLoad.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Scripts */}
        {scriptsCount && (
          <div className="ev-card p-5">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <StatusIcon status={scriptsCount.status} />
                <span className="font-semibold text-sm text-foreground">Scripts tiers</span>
              </div>
              {scriptsRaw.total != null ? (
                <div className="space-y-2">
                  <p className="text-2xl font-bold font-display text-foreground">{String(scriptsRaw.total)} <span className="text-sm font-normal text-muted-foreground">scripts</span></p>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>1st party : <span className="text-foreground font-mono">{String(scriptsRaw.firstParty ?? 0)}</span></span>
                    <span>3rd party : <span className="text-foreground font-mono">{String(scriptsRaw.thirdParty ?? 0)}</span></span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{scriptsCount.description}</p>
              )}
            </div>
          </div>
        )}

        {/* Script loading strategy */}
        {scriptLoading && (
          <div className="ev-card p-5 md:col-span-2">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <StatusIcon status={scriptLoading.status} />
                <span className="font-semibold text-sm text-foreground">Stratégie de chargement</span>
              </div>
              {loadingRaw.total != null ? (
                <div className="flex gap-6 text-xs">
                  <div className="text-center">
                    <p className="text-lg font-bold text-red-400 font-display">{String(loadingRaw.blocking ?? 0)}</p>
                    <p className="text-muted-foreground">Bloquants</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-emerald-400 font-display">{String(loadingRaw.async ?? 0)}</p>
                    <p className="text-muted-foreground">Async</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-sky-400 font-display">{String(loadingRaw.defer ?? 0)}</p>
                    <p className="text-muted-foreground">Defer</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-foreground font-display">{String(loadingRaw.total)}</p>
                    <p className="text-muted-foreground">Total</p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">{scriptLoading.description}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ══════════════════════════════════════════════════════════════════
   Progress Step
   ══════════════════════════════════════════════════════════════════ */

interface ProgressStep {
  label: string;
  type: AuditProgressEvent["type"];
  isSessionHeader: boolean;
}

const ProgressSessionCard = ({
  title,
  steps,
  isActive,
  isDone,
}: {
  title: string;
  steps: ProgressStep[];
  isActive: boolean;
  isDone: boolean;
}) => (
  <div className="ev-card p-4 animate-fade-in-up">
    <div className="flex items-center gap-3 mb-3">
      {isDone ? (
        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
      ) : isActive ? (
        <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
      ) : (
        <div className="w-5 h-5 rounded-full border-2 border-white/[0.12] shrink-0" />
      )}
      <span className="font-semibold text-sm text-foreground">{title}</span>
    </div>
    {steps.length > 0 && (
      <div className="ml-8 space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-2 animate-fade-in-up">
            {step.type === "issues_count" ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400/70 shrink-0" />
            )}
            <span
              className={`text-xs ${
                step.type === "issues_count"
                  ? "text-amber-400"
                  : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

/* ══════════════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════════════ */

const AuditResults = () => {
  const location = useLocation();
  const { id: routeId } = useParams();
  const [searchParams] = useSearchParams();
  const cid = searchParams.get("cid");
  const isNewScan = routeId === "new";
  const isReturningFromEmail = !isNewScan && !!cid;

  const auditUrl = (location.state as { url?: string })?.url || "";

  const [phase, setPhase] = useState<"scanning" | "results" | "error">("scanning");
  const [scoreAnimated, setScoreAnimated] = useState(false);

  const [progressSteps, setProgressSteps] = useState<ProgressStep[]>([]);

  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [checks, setChecks] = useState<AuditCheck[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isRateLimited, setIsRateLimited] = useState(false);

  const [email, setEmail] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  const scanStarted = useRef(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  /* ── Track email click (returning user) ── */
  useEffect(() => {
    if (isReturningFromEmail && routeId && cid) {
      trackAuditEmailClick(routeId, cid).catch(() => {});
    }
  }, [isReturningFromEmail, routeId, cid]);

  /* ── Cleanup SSE on unmount ── */
  useEffect(() => {
    return () => {
      eventSourceRef.current?.close();
    };
  }, []);

  /* ── Load existing audit or launch new scan ── */
  useEffect(() => {
    if (scanStarted.current) return;
    scanStarted.current = true;

    if (isNewScan && auditUrl) {
      // New scan: POST to create audit, then stream progress via SSE
      startAudit(auditUrl)
        .then(({ id }) => {
          // Update URL to real audit ID (without losing state)
          window.history.replaceState(
            { url: auditUrl },
            "",
            `/audit-tracking/resultats/${id}`
          );

          const source = streamAuditProgress(
            id,
            (event) => {
              if (event.type === "result" && event.result) {
                // Scan complete — show results
                setAuditResult({ ...event.result, id, createdAt: "" });
                setChecks(event.result.checks ?? []);
                setPhase("results");
                setTimeout(() => setScoreAnimated(true), 300);
                source.close();
                return;
              }

              if (event.type === "error") {
                setErrorMessage(event.label);
                setPhase("error");
                source.close();
                return;
              }

              // Add progress step
              const isSessionHeader = event.type === "session_start";
              setProgressSteps((prev) => [
                ...prev,
                { label: event.label, type: event.type, isSessionHeader },
              ]);
            },
            () => {
              // SSE error — check if audit completed in DB
              getAudit(id)
                .then((result) => {
                  if (result.status === "completed") {
                    setAuditResult(result);
                    setChecks(result.checks);
                    setPhase("results");
                    setTimeout(() => setScoreAnimated(true), 300);
                  } else if (result.status === "failed") {
                    setErrorMessage(result.errorMessage || "Analyse échouée.");
                    setPhase("error");
                  }
                })
                .catch(() => {
                  setErrorMessage("Connexion perdue. Veuillez réessayer.");
                  setPhase("error");
                });
            }
          );

          eventSourceRef.current = source;
        })
        .catch((err) => {
          if (err instanceof ApiError && err.status === 429) {
            setIsRateLimited(true);
            setErrorMessage("Limite atteinte. Maximum 3 audits par heure.");
          } else {
            setErrorMessage(
              err instanceof ApiError
                ? err.message
                : "Une erreur est survenue. Veuillez réessayer."
            );
          }
          setPhase("error");
        });
    } else if (!isNewScan && routeId) {
      // Returning user: load existing audit from DB
      getAudit(routeId)
        .then((result) => {
          setAuditResult(result);
          setChecks(result.checks);
          const hasRealDescriptions = result.checks.some(
            (c) => c.gated && !c.description.startsWith("Debloquez")
          );
          setIsUnlocked(hasRealDescriptions);
          setPhase("results");
          setTimeout(() => setScoreAnimated(true), 300);
        })
        .catch(() => {
          setErrorMessage("Audit introuvable.");
          setPhase("error");
        });
    } else {
      setErrorMessage("Aucune URL fournie.");
      setPhase("error");
    }
  }, [isNewScan, routeId, auditUrl]);

  /* ── Email gate submit ── */
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setEmailError("Veuillez entrer un email valide");
      return;
    }

    if (!consentChecked) {
      setEmailError("Veuillez accepter la politique de confidentialité");
      return;
    }

    if (!auditResult) return;

    setEmailSubmitting(true);

    try {
      const result = await unlockAudit(auditResult.id, email.trim());
      setChecks(result.checks);
      setIsUnlocked(true);
    } catch (err) {
      console.error("[AuditResults] Unlock error:", err);
      setEmailError("Erreur lors du déblocage. Veuillez réessayer.");
    }

    setEmailSubmitting(false);
  };

  /* ── Derived data ── */
  const failCount = checks.filter((c) => c.status === "fail").length;
  const warnCount = checks.filter((c) => c.status === "warning").length;
  const displayUrl = auditResult?.url || auditUrl || "—";
  const rawCategories = auditResult?.categories;
  const categories: AuditCategorySummary[] = typeof rawCategories === 'string'
    ? JSON.parse(rawCategories)
    : rawCategories || [];

  /* ── Group progress steps by session ── */
  const sessionGroups: { title: string; steps: ProgressStep[]; isDone: boolean }[] = [];
  let currentGroup: { title: string; steps: ProgressStep[]; isDone: boolean } | null = null;

  for (const step of progressSteps) {
    if (step.isSessionHeader) {
      if (currentGroup) {
        currentGroup.isDone = true;
        sessionGroups.push(currentGroup);
      }
      currentGroup = { title: step.label, steps: [], isDone: false };
    } else if (currentGroup) {
      if (step.type === "session_complete") {
        currentGroup.isDone = true;
      } else {
        currentGroup.steps.push(step);
      }
    } else {
      // Steps before any session header (e.g. standalone steps)
      sessionGroups.push({ title: step.label, steps: [], isDone: true });
    }
  }
  if (currentGroup) {
    sessionGroups.push(currentGroup);
  }

  return (
    <>
      <EvervaultGlow />
      <Header />
      <main className="min-h-screen relative z-[1]">
        {/* ── URL Bar ── */}
        <div className="mx-3 md:mx-6">
          <section className="relative pt-24 pb-4 overflow-hidden rounded-b-[40px] bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] border-t-0">
            <div
              className="absolute inset-0 rounded-b-[40px]"
              style={{
                background: 'linear-gradient(180deg, hsl(262 83% 58% / 0.08) 0%, transparent 100%)',
              }}
            />
            <div
              className="absolute inset-x-0 bottom-0 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, hsl(262 83% 58% / 0.3) 30%, hsl(188 94% 43% / 0.3) 70%, transparent)',
              }}
            />
            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-3 text-sm">
                <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-foreground font-medium truncate">
                  {displayUrl}
                </span>
                {displayUrl !== "—" && (
                  <a
                    href={displayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          </section>
        </div>

        {phase === "scanning" ? (
          /* ══════════════════════ Scanning Phase (SSE live) ══════════════════════ */
          <section className="py-24 md:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-lg mx-auto text-center">
                {/* Domain title */}
                <h1 className="text-3xl md:text-4xl font-bold font-display mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {displayUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                </h1>
                <p className="text-sm text-muted-foreground mb-10">Diagnostic tracking en cours</p>

                <BlockProgressLoader
                  percentage={Math.min(Math.round((progressSteps.length / 20) * 100), 95)}
                  label={progressSteps.length > 0 ? progressSteps[progressSteps.length - 1].label : "Connexion au scanner..."}
                />
                <div className="mb-10" />

                {/* Live progress — grouped by session in cards */}
                <div className="space-y-3 text-left">
                  {sessionGroups.length === 0 && (
                    <div className="ev-card p-4">
                      <div className="relative z-10 flex items-center gap-3">
                        <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                        <span className="text-sm text-muted-foreground">
                          Connexion au scanner...
                        </span>
                      </div>
                    </div>
                  )}
                  {sessionGroups.map((group, i) => (
                    <ProgressSessionCard
                      key={i}
                      title={group.title}
                      steps={group.steps}
                      isActive={i === sessionGroups.length - 1 && !group.isDone}
                      isDone={group.isDone}
                    />
                  ))}
                </div>

                {/* Email + consent during scan */}
                <div className="ev-card p-6 mt-8 text-left">
                  <div className="relative z-10">
                    {isUnlocked ? (
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm text-foreground">
                            Email enregistré
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Vous recevrez votre rapport à <span className="text-foreground">{email}</span> dès la fin de l'analyse.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 mb-3">
                          <Mail className="w-4 h-4 text-primary" />
                          <span className="font-semibold text-sm text-foreground">Recevez votre rapport par email</span>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">
                          Entrez votre email pour débloquer le rapport complet dès la fin de l'analyse.
                        </p>
                        <form
                          onSubmit={handleEmailSubmit}
                          className="flex flex-col sm:flex-row gap-2 mb-3"
                        >
                          <div className="relative flex-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            <Input
                              type="email"
                              placeholder="votre@email.com"
                              value={email}
                              onChange={(e) => {
                                setEmail(e.target.value);
                                setEmailError("");
                              }}
                              className="pl-10 ev-input"
                            />
                          </div>
                          <Button
                            type="submit"
                            variant="heroGradient"
                            disabled={emailSubmitting || !email.trim() || !consentChecked}
                          >
                            {emailSubmitting ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              "Débloquer"
                            )}
                          </Button>
                        </form>
                        <label className="flex gap-2 items-start cursor-pointer mb-2">
                          <input
                            type="checkbox"
                            checked={consentChecked}
                            onChange={(e) => {
                              setConsentChecked(e.target.checked);
                              setEmailError("");
                            }}
                            className="mt-0.5 w-4 h-4 shrink-0 accent-primary cursor-pointer"
                            required
                          />
                          <span className="text-[11px] text-muted-foreground/90 leading-relaxed">
                            J'accepte de recevoir mon rapport d'audit par email et que mes données soient traitées conformément à la{" "}
                            <a href="/politique-de-confidentialite" className="underline hover:text-foreground" target="_blank" rel="noreferrer">politique de confidentialité</a>. Conformément au RGPD, je peux retirer mon consentement à tout moment.
                          </span>
                        </label>
                        {emailError && (
                          <p className="text-destructive text-xs mt-2">{emailError}</p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : phase === "error" ? (
          /* ══════════════════════ Error Phase ══════════════════════ */
          <section className="py-24 md:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-lg mx-auto text-center">
                <div className="w-20 h-20 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center mx-auto mb-8">
                  {isRateLimited ? (
                    <Shield className="w-10 h-10 text-amber-400" />
                  ) : (
                    <XCircle className="w-10 h-10 text-destructive" />
                  )}
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {isRateLimited ? "Limite atteinte" : "Analyse impossible"}
                </h2>
                <p className="text-foreground/70 mb-8 max-w-md mx-auto">
                  {errorMessage}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {!isRateLimited && (
                    <Button variant="heroGradient" size="lg" asChild>
                      <Link to="/audit-tracking">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Reessayer
                      </Link>
                    </Button>
                  )}
                  <Button variant="outline" size="lg" asChild>
                    <Link to="/contact">
                      Demander un audit expert
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        ) : (
          /* ══════════════════════ Results Phase ══════════════════════ */
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-4xl mx-auto">
                {/* ── Score + Summary ── */}
                <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-12">
                  <ScoreCircle score={auditResult?.overallScore ?? 0} animate={scoreAnimated} />
                  <div className="text-center md:text-left">
                    <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                      Score de votre tracking
                    </h1>
                    <p className="text-foreground/70 mb-4 max-w-md">
                      Nous avons détecté{" "}
                      <span className="font-bold text-destructive">
                        {failCount} problèmes critiques
                      </span>{" "}
                      et{" "}
                      <span className="font-bold text-amber-400">
                        {warnCount} points d'amélioration
                      </span>{" "}
                      sur votre site.
                    </p>
                    {(auditResult?.overallScore ?? 0) < 70 && (
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/15 text-destructive text-sm font-medium">
                        <AlertTriangle className="w-4 h-4" />
                        Action requise — Vous perdez des conversions
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Category Breakdown ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  {categories.map((cat) => {
                    const Icon = categoryIconMap[cat.id] || Activity;
                    const color = getCategoryColor(cat.score);
                    return (
                      <div
                        key={cat.id}
                        className="ev-card p-4 text-center"
                      >
                        <div className="flex items-center justify-center mb-2">
                          <Icon className={`w-5 h-5 ${color}`} />
                        </div>
                        <span className={`text-2xl font-bold ${color}`}>
                          {cat.score}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          /100
                        </span>
                        <p className="text-xs text-muted-foreground mt-1">
                          {cat.name}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* ── Checks List ── */}
                <div className="space-y-3">
                  <h2 className="text-xl font-bold text-foreground mb-4">
                    Détail des vérifications
                  </h2>

                  {!isUnlocked ? (
                    <div className="relative">
                      {/* All checks blurred as teaser */}
                      <div
                        className="space-y-3 blur-[3px] pointer-events-none select-none opacity-90"
                        aria-hidden
                      >
                        {checks.slice(0, 6).map((check) => (
                          <CheckRow key={check.id} check={check} />
                        ))}
                      </div>

                      {/* Email gate overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-transparent via-transparent to-background rounded-xl">
                        <div className="ev-card p-8 text-center max-w-md mx-6">
                          <div className="relative z-10">
                          <div className="icon-gradient w-14 h-14 rounded-full bg-white/[0.05] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-7 h-7" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            Débloquez votre rapport complet
                          </h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            {checks.length} vérifications avec recommandations détaillées.
                          </p>
                          <form
                            onSubmit={handleEmailSubmit}
                            className="flex flex-col sm:flex-row gap-2"
                          >
                            <div className="relative flex-1">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                              <Input
                                type="email"
                                placeholder="votre@email.com"
                                value={email}
                                onChange={(e) => {
                                  setEmail(e.target.value);
                                  setEmailError("");
                                }}
                                className="pl-10 ev-input"
                              />
                            </div>
                            <Button
                              type="submit"
                              variant="heroGradient"
                              disabled={emailSubmitting || !consentChecked}
                            >
                              {emailSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Voir le rapport"
                              )}
                            </Button>
                          </form>
                          <label className="flex gap-2 items-start cursor-pointer mt-3 text-left">
                            <input
                              type="checkbox"
                              checked={consentChecked}
                              onChange={(e) => {
                                setConsentChecked(e.target.checked);
                                setEmailError("");
                              }}
                              className="mt-0.5 w-4 h-4 shrink-0 accent-primary cursor-pointer"
                              required
                            />
                            <span className="text-[11px] text-muted-foreground/90 leading-relaxed">
                              J'accepte de recevoir mon rapport d'audit par email et que mes données soient traitées conformément à la{" "}
                              <a href="/politique-de-confidentialite" className="underline hover:text-foreground" target="_blank" rel="noreferrer">politique de confidentialité</a>. Conformément au RGPD, je peux retirer mon consentement à tout moment.
                            </span>
                          </label>
                          {emailError && (
                            <p className="text-destructive text-xs mt-2">
                              {emailError}
                            </p>
                          )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Trackers table */}
                      <div className="animate-fade-in-up">
                        <TrackersTable checks={checks} />
                      </div>

                      {/* Privacy & Consent section */}
                      <div className="animate-fade-in-up mt-6">
                        <PrivacySection checks={checks} />
                      </div>

                      {/* Performance section */}
                      <div className="animate-fade-in-up mt-6">
                        <PerformanceSection checks={checks} />
                      </div>

                      {/* Recommendations */}
                      <div className="animate-fade-in-up mt-6">
                        <RecommendationsSection checks={checks} />
                      </div>

                      {/* Other checks (not in any section, only pass/info) */}
                      {(() => {
                        const sectionIds = [...TRACKER_IDS, ...PRIVACY_IDS, ...PERFORMANCE_IDS];
                        const otherChecks = checks
                          .filter((c) => !sectionIds.includes(c.id))
                          .filter((c) => c.status === 'pass' || c.status === 'info');
                        return otherChecks.length > 0 ? (
                          <div className="mt-6 space-y-3">
                            <h3 className="text-lg font-bold text-foreground font-display">Autres vérifications</h3>
                            {otherChecks.map((check) => (
                              <div key={check.id} className="animate-fade-in-up">
                                <CheckRow check={check} />
                              </div>
                            ))}
                          </div>
                        ) : null;
                      })()}
                    </>
                  )}
                </div>

                {/* ── CTA ── */}
                <div className="mt-12 ev-card p-8 text-center">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                    Un expert analyse vos résultats
                  </h3>
                  <p className="text-foreground/70 mb-6 max-w-lg mx-auto">
                    Ce diagnostic automatique est un premier aperçu. Réservez un
                    audit approfondi avec un expert DigitaliX pour un plan
                    d'action personnalisé.
                  </p>
                  <Button variant="heroGradient" size="xl" asChild>
                    <Link to="/contact">
                      Reserver mon Audit Offert
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
};

export default AuditResults;
