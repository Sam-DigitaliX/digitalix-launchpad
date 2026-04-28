import { useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import Header from "@/components/landing/Header";
import EvervaultGlow from "@/components/landing/EvervaultGlow";
import Footer from "@/components/landing/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Scan, Zap, Globe, ArrowRight, Shield, CheckCircle2 } from "lucide-react";
import { getPartner } from "@/data/partners";

const PartnerAuditTracking = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const partner = getPartner(slug);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Slug inconnu → fallback gracieux vers la page audit standard
  if (!partner) {
    return <Navigate to="/audit-tracking" replace />;
  }

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

    // Propage le slug partenaire dans le state pour que startAudit le pousse au backend
    navigate('/audit-tracking/resultats/new', {
      state: { url: normalizedUrl, partnerSlug: partner.slug },
    });
  };

  return (
    <>
      <EvervaultGlow />
      <Header />
      <main className="min-h-screen relative z-[1]">
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
                {/* Co-branding badge — DigitaliX × Partner */}
                <div className="relative inline-flex mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-md" />
                  <div className="relative inline-flex items-center gap-3 px-4 py-2 rounded-full bg-black/60 border border-primary/30 backdrop-blur-sm">
                    <Scan className="w-4 h-4 icon-gradient" />
                    <span className="text-sm font-medium text-gradient-primary">
                      DigitaliX × {partner.name}
                    </span>
                  </div>
                </div>

                {partner.logoUrl && (
                  <div className="flex items-center justify-center gap-4 mb-6 opacity-90">
                    <span className="font-display text-foreground/80 text-sm">En partenariat avec</span>
                    <img
                      src={partner.logoUrl}
                      alt={partner.name}
                      className="h-8 md:h-10 max-w-[180px] object-contain"
                    />
                  </div>
                )}

                {partner.badge && (
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-4">{partner.badge}</p>
                )}

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] text-foreground mb-6">
                  Votre tracking est-il
                  <br />
                  <span className="text-gradient-primary">vraiment fiable ?</span>
                </h1>

                <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-10 leading-relaxed">
                  {partner.intro
                    ?? `En partenariat avec ${partner.name}, auditez votre tracking en 2 à 3 minutes. Découvrez les fuites de données, les problèmes de conformité et les opportunités manquées.`}
                </p>

                <form onSubmit={handleSubmit} className="max-w-2xl mx-auto mb-8">
                  <div className="flex flex-col sm:flex-row gap-3">
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
                    <p className="text-destructive text-sm mt-2 text-left">{error}</p>
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
                    <span className="text-sm text-foreground font-medium">Rapport sous 3 min</span>
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
      </main>
      <Footer />
    </>
  );
};

export default PartnerAuditTracking;
