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

const CheckRow = ({ check }: { check: AuditCheck }) => (
  <div className="ev-card p-4">
    <div className="relative z-10 flex items-start gap-4">
    <StatusIcon status={check.status} />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 flex-wrap mb-1">
        <span className="font-semibold text-sm text-foreground">
          {check.name}
        </span>
        <span
          className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
            check.impact === "critical"
              ? "bg-destructive/15 text-destructive"
              : check.impact === "high"
              ? "bg-amber-500/15 text-amber-400"
              : "bg-primary/15 text-primary"
          }`}
        >
          {check.impact}
        </span>
      </div>
      <p className="text-sm text-muted-foreground">{check.description}</p>
    </div>
    </div>
  </div>
);

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
                    setErrorMessage(result.errorMessage || "Analyse echouee.");
                    setPhase("error");
                  }
                })
                .catch(() => {
                  setErrorMessage("Connexion perdue. Veuillez reessayer.");
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
                : "Une erreur est survenue. Veuillez reessayer."
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

    if (!auditResult) return;

    setEmailSubmitting(true);

    try {
      const result = await unlockAudit(auditResult.id, email.trim());
      setChecks(result.checks);
      setIsUnlocked(true);
    } catch (err) {
      console.error("[AuditResults] Unlock error:", err);
      setEmailError("Erreur lors du deblocage. Veuillez reessayer.");
    }

    setEmailSubmitting(false);
  };

  /* ── Derived data ── */
  const visibleChecks = checks.filter((c) => !c.gated);
  const gatedChecks = checks.filter((c) => c.gated);
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
                      Nous avons detecte{" "}
                      <span className="font-bold text-destructive">
                        {failCount} problemes critiques
                      </span>{" "}
                      et{" "}
                      <span className="font-bold text-amber-400">
                        {warnCount} points d'amelioration
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
                    Detail des verifications
                  </h2>

                  {visibleChecks.map((check) => (
                    <CheckRow key={check.id} check={check} />
                  ))}

                  {!isUnlocked ? (
                    <div className="relative mt-2">
                      <div
                        className="space-y-3 blur-sm pointer-events-none select-none"
                        aria-hidden
                      >
                        {gatedChecks.slice(0, 3).map((check) => (
                          <CheckRow key={check.id} check={check} />
                        ))}
                      </div>

                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-background/40 via-background/90 to-background rounded-xl">
                        <div className="text-center max-w-md px-6">
                          <div className="icon-gradient w-14 h-14 rounded-full bg-white/[0.05] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-7 h-7" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            Debloquez votre rapport complet
                          </h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            {gatedChecks.length} verifications supplementaires
                            avec recommandations detaillees.
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
                              disabled={emailSubmitting}
                            >
                              {emailSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                "Voir le rapport"
                              )}
                            </Button>
                          </form>
                          {emailError && (
                            <p className="text-destructive text-xs mt-2">
                              {emailError}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    gatedChecks.map((check) => (
                      <div key={check.id} className="animate-fade-in-up">
                        <CheckRow check={check} />
                      </div>
                    ))
                  )}
                </div>

                {/* ── CTA ── */}
                <div className="mt-12 ev-card p-8 text-center">
                  <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3">
                    Un expert analyse vos resultats
                  </h3>
                  <p className="text-foreground/70 mb-6 max-w-lg mx-auto">
                    Ce diagnostic automatique est un premier apercu. Reservez un
                    audit approfondi avec un expert DigitaliX pour un plan
                    d'action personnalise.
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
