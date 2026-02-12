import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Server, ShieldCheck, BarChart3, Users, Star, BadgeCheck } from "lucide-react";
import LogoCarousel from "@/components/landing/LogoCarousel";
import Header from "@/components/landing/Header";
import CardBeamSection from "@/components/landing/CardBeamSection";
import TrackingDemoSection from "@/components/landing/TrackingDemoSection";
import ReviewsCarouselSection from "@/components/landing/ReviewsCarouselSection";
import ProcessSection from "@/components/landing/ProcessSection";
import FAQSection from "@/components/landing/FAQSection";
import ClientLogosSection from "@/components/landing/ClientLogosSection";
import CTASection from "@/components/landing/CTASection";
import GradientSection from "@/components/landing/GradientSection";
import Footer from "@/components/landing/Footer";

const audiences = [
  {
    title: "Consultants & Agences",
    description:
      "Vous gérez le tracking de vos clients ? Offrez-leur une infrastructure server-side fiable et conforme. Devenez autonome sur le setup et la maintenance.",
    cta: "Découvrir l'offre Consultants",
    href: "/consultants",
    icon: Users,
    available: true,
  },
  {
    title: "E-commerce & Annonceurs",
    description:
      "Vous perdez des conversions à cause des adblockers et d'iOS ? Récupérez vos données perdues et boostez votre ROAS sans effort technique.",
    cta: "Bientôt disponible",
    href: "#",
    icon: BarChart3,
    available: false,
  },
];

const valueProps = [
  {
    icon: Server,
    title: "Infrastructure Server-Side",
    description: "Vos données transitent par votre propre serveur, contournant les blocages navigateur.",
  },
  {
    icon: ShieldCheck,
    title: "Conformité RGPD native",
    description: "Consent Mode v2, anonymisation et respect du consentement intégrés dès le départ.",
  },
  {
    icon: BarChart3,
    title: "+90% de précision",
    description: "Récupérez les conversions perdues par les adblockers et les restrictions iOS/Safari.",
  },
];

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden">
          {/* Background gradient — Evervault style */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, hsl(262 83% 58% / 0.15) 0%, hsl(262 83% 58% / 0.06) 40%, transparent 70%)',
            }}
          />
          {/* Centered glow orb */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/12 rounded-full blur-[120px] pointer-events-none" />
          {/* Bottom glow for section transition */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="relative inline-flex mb-8 animate-fade-in-up">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-md" />
              <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-primary/30 backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-gradient-primary">
                  Server-Side Tracking Experts
                </span>
              </div>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-foreground mb-6 max-w-4xl mx-auto">
              Le server-side,{" "}
              <span className="text-gradient-primary">sans la complexité.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-3">
              Déployé. Maintenu. Conforme.
            </p>
            <p className="text-base text-muted-foreground/70 max-w-xl mx-auto mb-10">
              On migre votre tracking côté serveur pour récupérer les conversions
              que les adblockers et iOS vous font perdre.
            </p>
            <Button variant="heroGradient" size="xl" className="group" asChild>
              <Link to="/contact">
                Réserver mon Audit Gratuit
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>

            {/* Social proof badge */}
            <div className="flex items-center justify-center gap-3 mt-5 animate-fade-in-up animation-delay-300">
              <div className="flex items-center gap-1">
                <span className="text-sm font-semibold text-foreground">4.75/5</span>
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i <= 4
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-amber-400/70 text-amber-400/70'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-muted-foreground">–</span>
              <span className="text-sm text-muted-foreground">32 avis</span>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-medium text-emerald-400">Avis vérifiés</span>
              </div>
            </div>

            {/* Logo Carousel */}
            <div className="mt-12 animate-fade-in-up animation-delay-400">
              <LogoCarousel />
            </div>
          </div>
        </section>

        {/* Expertise Beam */}
        <CardBeamSection />

        {/* Tracking Demo */}
        <TrackingDemoSection />

        {/* Value Props */}
        <GradientSection>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-16">
            Pourquoi passer au <span className="text-gradient-primary">Server-Side ?</span>
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {valueProps.map((prop) => (
              <div key={prop.title} className="glass-card p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <prop.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{prop.title}</h3>
                <p className="text-muted-foreground text-sm">{prop.description}</p>
              </div>
            ))}
          </div>
        </GradientSection>

        {/* Reviews */}
        <ReviewsCarouselSection />

        {/* Pour qui ? */}
        <GradientSection>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center mb-4">
            Une solution adaptée à <span className="text-gradient-primary">votre profil</span>
          </h2>
          <p className="text-muted-foreground text-center mb-16 max-w-xl mx-auto">
            Que vous soyez consultant ou annonceur, nous avons une offre pensée pour vous.
          </p>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {audiences.map((audience) => (
              <div
                key={audience.title}
                className={`glass-card p-8 flex flex-col ${!audience.available ? "opacity-60" : ""}`}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                  <audience.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-3">{audience.title}</h3>
                <p className="text-muted-foreground mb-8 flex-grow">{audience.description}</p>
                <Button
                  variant={audience.available ? "heroGradient" : "heroGradientOutline"}
                  size="lg"
                  className="w-full"
                  asChild={audience.available}
                  disabled={!audience.available}
                >
                  {audience.available ? (
                    <Link to={audience.href}>
                      {audience.cta}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  ) : (
                    <span>{audience.cta}</span>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </GradientSection>

        {/* Process */}
        <ProcessSection />

        {/* Logos */}
        <ClientLogosSection />

        {/* FAQ */}
        <FAQSection />

        {/* CTA */}
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Home;
