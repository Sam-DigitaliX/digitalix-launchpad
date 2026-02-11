import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Server, ShieldCheck, BarChart3, Users } from "lucide-react";
import Header from "@/components/landing/Header";
import TrackingDemoSection from "@/components/landing/TrackingDemoSection";
import ReviewsCarouselSection from "@/components/landing/ReviewsCarouselSection";
import ProcessSection from "@/components/landing/ProcessSection";
import FAQSection from "@/components/landing/FAQSection";
import ClientLogosSection from "@/components/landing/ClientLogosSection";
import CTASection from "@/components/landing/CTASection";
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
          <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-3xl" />

          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <p className="text-xs font-bold tracking-ultra-wide text-primary uppercase mb-6">
              Server-Side Tracking Experts
            </p>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight">
              Reprenez le contrôle de{" "}
              <span className="text-gradient-primary">vos données marketing</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Les adblockers et les restrictions navigateur détruisent votre tracking.
              Nous migrons votre infrastructure côté serveur pour récupérer vos conversions perdues.
            </p>
            <Button variant="heroGradient" size="xl" className="group" asChild>
              <Link to="/contact">
                Réserver mon Audit Gratuit
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Tracking Demo */}
        <TrackingDemoSection />

        {/* Value Props */}
        <section className="py-20 md:py-28 bg-card">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
          </div>
        </section>

        {/* Reviews */}
        <ReviewsCarouselSection />

        {/* Pour qui ? */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
          </div>
        </section>

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
