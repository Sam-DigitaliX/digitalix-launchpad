import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Header from "@/components/landing/Header";
import EvervaultGlow from "@/components/landing/EvervaultGlow";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Scan,
  Zap,
  Globe,
  ArrowRight,
  Activity,
  Shield,
  CheckCircle2,
} from "lucide-react";

/* ── Static data ── */

const analyzeCategories = [
  {
    icon: Activity,
    title: "Tracking Setup",
    description: "GTM, pixels, Data Layer, Enhanced Conversions",
  },
  {
    icon: Globe,
    title: "Server-Side",
    description: "sGTM, cookies first-party, CAPI Meta & Google",
  },
  {
    icon: Shield,
    title: "Privacy & Consent",
    description: "CMP, Consent Mode v2, cookies tiers, RGPD",
  },
  {
    icon: Zap,
    title: "Performance",
    description: "Core Web Vitals, scripts tiers, temps de chargement",
  },
];

const howItWorks = [
  {
    number: "01",
    title: "Entrez votre URL",
    description: "Collez l'adresse de n'importe quel site web",
  },
  {
    number: "02",
    title: "Analyse automatique",
    description: "Notre moteur scanne 30+ points de contrôle",
  },
  {
    number: "03",
    title: "Recevez votre rapport",
    description: "Score global, problèmes détectés, recommandations",
  },
];

/* ── Page ── */

const AuditTracking = () => {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    let normalizedUrl = url.trim();
    if (!normalizedUrl) {
      setError("Veuillez entrer une URL");
      return;
    }
    if (!normalizedUrl.startsWith("http")) {
      normalizedUrl = `https://${normalizedUrl}`;
    }

    try {
      new URL(normalizedUrl);
    } catch {
      setError("Veuillez entrer une URL valide");
      return;
    }

    setIsLoading(true);
    const auditId = crypto.randomUUID();

    setTimeout(() => {
      navigate(`/audit-tracking/resultats/${auditId}`, {
        state: { url: normalizedUrl },
      });
    }, 600);
  };

  return (
    <>
      <EvervaultGlow />
      <Header />
      <main className="min-h-screen relative z-[1]">
        {/* ── Hero + Form ── */}
        <div className="mx-3 md:mx-6">
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden rounded-b-[40px] bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] border-t-0">
          <div
            className="absolute inset-0 rounded-b-[40px]"
            style={{
              background:
                "linear-gradient(180deg, hsl(262 83% 58% / 0.12) 0%, hsl(262 83% 58% / 0.05) 40%, transparent 70%)",
            }}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent, hsl(262 83% 58% / 0.3) 30%, hsl(188 94% 43% / 0.3) 70%, transparent)',
            }}
          />

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-3xl mx-auto">
              {/* Badge */}
              <div className="relative inline-flex mb-8">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-md" />
                <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-primary/30 backdrop-blur-sm">
                  <Scan className="w-4 h-4 icon-gradient" />
                  <span className="text-sm font-medium text-gradient-primary">
                    Diagnostic Tracking
                  </span>
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground mb-6">
                Votre tracking est-il
                <br />
                <span className="text-gradient-primary">vraiment fiable ?</span>
              </h1>

              {/* Subtitle */}
              <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                Analysez n'importe quel site web en 30 secondes. Découvrez les
                fuites de données, les problèmes de conformité et les
                opportunités manquées.
              </p>

              {/* URL Form */}
              <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
                <div className="flex flex-col sm:flex-row gap-3">
                  {/* Evervault animated border wrapper */}
                  <div className="ev-card flex-1 !rounded-xl">
                    <div className="relative z-10">
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none z-10" />
                      <Input
                        type="text"
                        placeholder="https://votre-site.com"
                        value={url}
                        onChange={(e) => {
                          setUrl(e.target.value);
                          setError("");
                        }}
                        className="pl-12 h-14 bg-transparent border-0 text-foreground text-lg rounded-[11px] focus:ring-0 focus-visible:ring-0"
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    variant="heroGradient"
                    size="xl"
                    className="h-14 px-8 shrink-0"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Analyse...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Lancer l'analyse
                        <ArrowRight className="w-5 h-5" />
                      </span>
                    )}
                  </Button>
                </div>
                {error && (
                  <p className="text-destructive text-sm mt-2 text-left">
                    {error}
                  </p>
                )}
              </form>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-4 md:gap-6">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08]">
                  <Shield className="w-4 h-4 icon-gradient" />
                  <span className="text-sm text-foreground font-medium">30+ points de contrôle</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08]">
                  <Zap className="w-4 h-4 icon-gradient" />
                  <span className="text-sm text-foreground font-medium">Résultat instantané</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08]">
                  <CheckCircle2 className="w-4 h-4 icon-gradient" />
                  <span className="text-sm text-foreground font-medium">100% offert</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>

        {/* ── How It Works ── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Comment ça fonctionne
              </h2>
              <p className="text-foreground/70 text-lg max-w-xl mx-auto">
                Un diagnostic complet en 3 étapes simples.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {howItWorks.map((step) => (
                <div key={step.number} className="text-center">
                  <span className="text-6xl font-black text-gradient-primary opacity-30 block mb-4">
                    {step.number}
                  </span>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What We Analyze ── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ce que nous analysons
              </h2>
              <p className="text-foreground/70 text-lg max-w-xl mx-auto">
                4 catégories, 30+ points de contrôle pour un diagnostic complet.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {analyzeCategories.map((cat) => (
                <div
                  key={cat.title}
                  className="glass-card-interactive p-6 text-center"
                >
                  <div className="icon-gradient w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {cat.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Besoin d'un audit{" "}
              <span className="text-gradient-primary">approfondi</span> ?
            </h2>
            <p className="text-foreground/70 text-lg max-w-xl mx-auto mb-8">
              Notre outil automatique est un premier diagnostic. Pour une
              analyse complète par un expert, réservez votre audit.
            </p>
            <Button variant="heroGradient" size="xl" asChild>
              <Link to="/contact">
                Réserver mon Audit Offert
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
};

export default AuditTracking;
