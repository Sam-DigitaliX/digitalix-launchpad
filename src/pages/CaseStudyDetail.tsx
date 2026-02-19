import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import EvervaultGlow from "@/components/landing/EvervaultGlow";
import Footer from "@/components/landing/Footer";
import { caseStudies } from "@/data/caseStudies";

const CaseStudyDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const cs = caseStudies.find((c) => c.slug === slug);

  if (!cs) return <Navigate to="/cas-clients" replace />;

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
            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
              <Link
                to="/cas-clients"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
              >
                <ArrowLeft className="w-4 h-4" />
                Tous les cas clients
              </Link>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-lg font-bold text-gradient-primary">
                  {cs.logo}
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                    {cs.client}
                  </h1>
                  <span className="text-sm text-muted-foreground">
                    {cs.sector} · {cs.duration}
                  </span>
                </div>
              </div>
              <p className="text-lg md:text-xl text-foreground/70 max-w-3xl">
                {cs.shortDescription}
              </p>
            </div>
          </section>
        </div>

        {/* Challenge */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Le <span className="text-gradient-primary">problème</span>
            </h2>
            <p className="text-foreground/70 leading-relaxed">{cs.challenge}</p>
          </div>
        </section>

        {/* Solution */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Notre <span className="text-gradient-primary">solution</span>
            </h2>
            <p className="text-foreground/70 leading-relaxed mb-10">
              {cs.solution}
            </p>

            {/* Stack */}
            <div className="flex flex-wrap gap-2">
              {cs.stack.map((tech) => (
                <span
                  key={tech}
                  className="px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-foreground/80"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Results */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10">
              Les <span className="text-gradient-primary">résultats</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {cs.results.map((r) => (
                <div
                  key={r.metric}
                  className="glass-card p-6 flex flex-col gap-1"
                >
                  <p className="text-sm text-muted-foreground">{r.metric}</p>
                  <div className="flex items-baseline gap-3">
                    <span className="text-foreground/40 line-through text-lg">
                      {r.before}
                    </span>
                    <span className="text-2xl font-bold text-gradient-primary">
                      {r.after}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
            <div className="glass-card p-8 md:p-10">
              <Quote className="w-8 h-8 icon-gradient mb-6" />
              <blockquote className="text-lg md:text-xl text-foreground/90 leading-relaxed mb-6 italic">
                "{cs.testimonial.quote}"
              </blockquote>
              <div>
                <p className="font-semibold text-foreground">
                  {cs.testimonial.author}
                </p>
                <p className="text-sm text-muted-foreground">
                  {cs.testimonial.role}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Vous voulez des résultats similaires ?
            </h2>
            <p className="text-foreground/60 mb-10 max-w-xl mx-auto">
              Commencez par un audit offert de votre tracking. On identifie vos
              fuites de conversions en 15 minutes.
            </p>
            <Button variant="heroGradient" size="xl" className="group" asChild>
              <Link to="/contact">
                Réserver mon Audit Offert
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default CaseStudyDetail;
