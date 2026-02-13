import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  Scan,
} from "lucide-react";
import type { AuditCheck } from "@/types/audit";

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
          className="stroke-border/30"
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
   Status & Category Icons
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

/* ══════════════════════════════════════════════════════════════════
   Mock Data — will be replaced by Playwright backend
   ══════════════════════════════════════════════════════════════════ */

const MOCK_SCORE = 38;

const mockCategories = [
  { id: "tracking", name: "Tracking Setup", score: 55, color: "text-amber-400" },
  { id: "serverside", name: "Server-Side", score: 0, color: "text-destructive" },
  { id: "privacy", name: "Privacy & Consent", score: 40, color: "text-destructive" },
  { id: "performance", name: "Performance", score: 45, color: "text-amber-400" },
];

const mockChecks: AuditCheck[] = [
  // ── Tracking Setup
  { id: "gtm", category: "tracking", name: "Google Tag Manager", status: "pass", description: "Conteneur GTM détecté (GTM-XXXXXX)", impact: "critical", gated: false },
  { id: "ga4", category: "tracking", name: "Google Analytics 4", status: "pass", description: "Flux de données GA4 configuré", impact: "high", gated: false },
  { id: "meta-pixel", category: "tracking", name: "Meta Pixel", status: "pass", description: "Pixel Meta installé", impact: "high", gated: false },
  { id: "datalayer", category: "tracking", name: "Data Layer", status: "warning", description: "Data Layer détecté mais incomplet — événements e-commerce manquants", impact: "high", gated: true },
  { id: "enhanced-conv", category: "tracking", name: "Enhanced Conversions", status: "fail", description: "Enhanced Conversions Google non configuré — perte de données attribuées", impact: "critical", gated: true },
  { id: "tiktok", category: "tracking", name: "TikTok Pixel", status: "info", description: "Aucun pixel TikTok détecté", impact: "low", gated: true },
  // ── Server-Side
  { id: "sgtm", category: "serverside", name: "GTM Server-Side", status: "fail", description: "Aucun conteneur server-side détecté — données vulnérables aux adblockers", impact: "critical", gated: false },
  { id: "first-party", category: "serverside", name: "Cookies First-Party", status: "fail", description: "Cookies tiers détectés — durée de vie limitée par ITP Safari", impact: "critical", gated: true },
  { id: "capi-meta", category: "serverside", name: "CAPI Meta (Facebook)", status: "fail", description: "Conversion API Meta non implémentée — perte de 20-30% des conversions", impact: "critical", gated: true },
  { id: "capi-google", category: "serverside", name: "CAPI Google Ads", status: "fail", description: "Enhanced Conversions API non détecté côté serveur", impact: "high", gated: true },
  // ── Privacy & Consent
  { id: "cmp", category: "privacy", name: "Bannière de consentement", status: "pass", description: "CMP détectée (Cookiebot)", impact: "critical", gated: false },
  { id: "consent-mode", category: "privacy", name: "Consent Mode v2", status: "fail", description: "Google Consent Mode v2 non implémenté — requis depuis mars 2024", impact: "critical", gated: true },
  { id: "third-party-cookies", category: "privacy", name: "Cookies tiers", status: "warning", description: "14 cookies tiers détectés — risque de non-conformité RGPD", impact: "high", gated: true },
  { id: "privacy-page", category: "privacy", name: "Politique de confidentialité", status: "pass", description: "Page accessible depuis toutes les pages du site", impact: "medium", gated: true },
  // ── Performance
  { id: "lcp", category: "performance", name: "LCP (Largest Contentful Paint)", status: "warning", description: "3.2s — Amélioration nécessaire (objectif : < 2.5s)", impact: "high", gated: false },
  { id: "cls", category: "performance", name: "CLS (Cumulative Layout Shift)", status: "pass", description: "0.05 — Bon (objectif : < 0.1)", impact: "medium", gated: true },
  { id: "scripts-count", category: "performance", name: "Scripts tiers", status: "fail", description: "23 scripts tiers détectés — impact majeur sur le temps de chargement", impact: "high", gated: true },
  { id: "tbt", category: "performance", name: "TBT (Total Blocking Time)", status: "warning", description: "450ms — Amélioration nécessaire (objectif : < 200ms)", impact: "medium", gated: true },
];

const scanSteps = [
  "Connexion au site...",
  "Analyse du tracking setup...",
  "Détection server-side...",
  "Vérification conformité RGPD...",
  "Calcul du score final...",
];

/* ══════════════════════════════════════════════════════════════════
   Check Row Component
   ══════════════════════════════════════════════════════════════════ */

const CheckRow = ({ check }: { check: AuditCheck }) => (
  <div className="flex items-start gap-4 p-4 rounded-xl border border-border/50 bg-card/30">
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
);

/* ══════════════════════════════════════════════════════════════════
   Main Page
   ══════════════════════════════════════════════════════════════════ */

const AuditResults = () => {
  const location = useLocation();
  const auditUrl =
    (location.state as { url?: string })?.url || "https://exemple.com";

  const [phase, setPhase] = useState<"scanning" | "results">("scanning");
  const [currentStep, setCurrentStep] = useState(0);
  const [scoreAnimated, setScoreAnimated] = useState(false);

  const [email, setEmail] = useState("");
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSubmitting, setEmailSubmitting] = useState(false);

  /* ── Scanning simulation ── */
  useEffect(() => {
    if (phase !== "scanning") return;

    const timers = scanSteps.map((_, i) =>
      setTimeout(() => setCurrentStep(i + 1), (i + 1) * 900)
    );

    const finishTimer = setTimeout(() => {
      setPhase("results");
      setTimeout(() => setScoreAnimated(true), 300);
    }, scanSteps.length * 900 + 500);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(finishTimer);
    };
  }, [phase]);

  /* ── Email gate submit ── */
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");

    if (!email.trim() || !email.includes("@") || !email.includes(".")) {
      setEmailError("Veuillez entrer un email valide");
      return;
    }

    setEmailSubmitting(true);

    // TODO: Save to Supabase
    // await supabase.from('audit_leads').insert({ email, url: auditUrl, score: MOCK_SCORE });

    setTimeout(() => {
      setIsUnlocked(true);
      setEmailSubmitting(false);
    }, 800);
  };

  const visibleChecks = mockChecks.filter((c) => !c.gated);
  const gatedChecks = mockChecks.filter((c) => c.gated);
  const failCount = mockChecks.filter((c) => c.status === "fail").length;
  const warnCount = mockChecks.filter((c) => c.status === "warning").length;

  return (
    <>
      <Header />
      <main className="bg-background min-h-screen">
        {/* ── URL Bar ── */}
        <section className="pt-24 pb-4 border-b border-border/30">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 text-sm">
              <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-foreground font-medium truncate">
                {auditUrl}
              </span>
              <a
                href={auditUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </section>

        {phase === "scanning" ? (
          /* ══════════════════════ Scanning Phase ══════════════════════ */
          <section className="py-24 md:py-32">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-lg mx-auto text-center">
                {/* Animated spinner */}
                <div className="relative w-24 h-24 mx-auto mb-10">
                  <div className="absolute inset-0 rounded-full border-4 border-border/30" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Scan className="w-8 h-8 text-primary" />
                  </div>
                </div>

                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-8">
                  Analyse en cours...
                </h2>

                {/* Step list */}
                <div className="space-y-4 text-left">
                  {scanSteps.map((step, i) => (
                    <div
                      key={step}
                      className={`flex items-center gap-3 transition-all duration-500 ${
                        i < currentStep
                          ? "opacity-100"
                          : i === currentStep
                          ? "opacity-60"
                          : "opacity-20"
                      }`}
                    >
                      {i < currentStep ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : i === currentStep ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin shrink-0" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-border/50 shrink-0" />
                      )}
                      <span
                        className={`text-sm ${
                          i < currentStep
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  ))}
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
                  <ScoreCircle score={MOCK_SCORE} animate={scoreAnimated} />
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
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-destructive/15 text-destructive text-sm font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      Action requise — Vous perdez des conversions
                    </div>
                  </div>
                </div>

                {/* ── Category Breakdown ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                  {mockCategories.map((cat) => {
                    const Icon = categoryIconMap[cat.id] || Activity;
                    return (
                      <div
                        key={cat.id}
                        className="rounded-xl border border-border/50 bg-card/50 p-4 text-center"
                      >
                        <div className="flex items-center justify-center mb-2">
                          <Icon className={`w-5 h-5 ${cat.color}`} />
                        </div>
                        <span className={`text-2xl font-bold ${cat.color}`}>
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

                  {/* Visible checks (teaser — no email needed) */}
                  {visibleChecks.map((check) => (
                    <CheckRow key={check.id} check={check} />
                  ))}

                  {/* Email Gate OR unlocked checks */}
                  {!isUnlocked ? (
                    <div className="relative mt-2">
                      {/* Blurred preview */}
                      <div
                        className="space-y-3 blur-sm pointer-events-none select-none"
                        aria-hidden
                      >
                        {gatedChecks.slice(0, 3).map((check) => (
                          <CheckRow key={check.id} check={check} />
                        ))}
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-background/40 via-background/90 to-background rounded-xl">
                        <div className="text-center max-w-md px-6">
                          <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                            <Lock className="w-7 h-7 text-primary" />
                          </div>
                          <h3 className="text-xl font-bold text-foreground mb-2">
                            Débloquez votre rapport complet
                          </h3>
                          <p className="text-sm text-muted-foreground mb-6">
                            {gatedChecks.length} vérifications supplémentaires
                            avec recommandations détaillées.
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
                                className="pl-10 bg-card border-border/50"
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
                    /* Unlocked gated checks */
                    gatedChecks.map((check) => (
                      <div key={check.id} className="animate-fade-in-up">
                        <CheckRow check={check} />
                      </div>
                    ))
                  )}
                </div>

                {/* ── CTA ── */}
                <div className="mt-12 p-8 rounded-2xl border border-primary/20 bg-primary/5 text-center">
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
                      Réserver mon Audit Offert
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
