import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/landing/Header";
import EvervaultGlow from "@/components/landing/EvervaultGlow";
import Footer from "@/components/landing/Footer";
import CTASection from "@/components/landing/CTASection";
import { caseStudies } from "@/data/caseStudies";

const CaseStudies = () => {
  return (
    <div className="min-h-screen bg-background">
      <EvervaultGlow />
      <Header />
      <main className="relative z-[1]">
        {/* Hero */}
        <div className="mx-3 md:mx-6">
          <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden rounded-b-[40px] bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] border-t-0">
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
                background:
                  "linear-gradient(90deg, transparent, hsl(262 83% 58% / 0.3) 30%, hsl(188 94% 43% / 0.3) 70%, transparent)",
              }}
            />
            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight">
                Cas <span className="text-gradient-primary">Clients</span>
              </h1>
              <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto">
                Découvrez comment nous avons aidé nos clients à reprendre le
                contrôle de leurs données et booster leur performance
                publicitaire.
              </p>
            </div>
          </section>
        </div>

        {/* Cases Grid */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {caseStudies.map((cs) => (
                <Link
                  key={cs.slug}
                  to={`/cas-clients/${cs.slug}`}
                  className="glass-card-interactive group flex flex-col p-6 md:p-8"
                >
                  {/* Header: logo + sector badge */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-sm font-bold text-gradient-primary shrink-0 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-secondary group-hover:border-transparent">
                      <span className="group-hover:text-white transition-colors">
                        {cs.logo}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground group-hover:text-white transition-colors">
                        {cs.client}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {cs.sector}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-muted-foreground text-sm mb-6 flex-grow leading-relaxed">
                    {cs.shortDescription}
                  </p>

                  {/* Key results preview */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {cs.results.slice(0, 2).map((r) => (
                      <div
                        key={r.metric}
                        className="rounded-lg bg-white/[0.03] border border-white/[0.05] p-3"
                      >
                        <p className="text-lg font-bold text-gradient-primary">
                          {r.after}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {r.metric}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* CTA line */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:text-secondary transition-colors duration-300">
                    Voir le cas complet
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default CaseStudies;
