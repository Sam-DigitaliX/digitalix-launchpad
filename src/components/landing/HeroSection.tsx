import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-data-flow.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="Data flow visualization"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-fade-in-up">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">
              Agence Partenaire des Consultants SEA
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 animate-fade-in-up animation-delay-100">
            Reprenez le contrôle
            <br />
            <span className="text-gradient-primary">de votre Data.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-200 leading-relaxed">
            L'infrastructure Server-Side pour contourner les bloqueurs, fiabiliser le signal et sécuriser vos performances publicitaires.{" "}
            <span className="text-foreground font-medium">Stop au pilotage à l'aveugle.</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-300">
            <Button variant="hero" size="xl">
              Sécuriser mon Tracking
            </Button>
            <Button variant="heroOutline" size="xl">
              Offre Partenaires
            </Button>
          </div>
        </div>

        {/* Trust Bar */}
        <div className="mt-20 animate-fade-in-up animation-delay-400">
          <p className="text-xs text-muted-foreground uppercase tracking-ultra-wide mb-6">
            Infrastructure de confiance
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50">
            <TechLogo name="Google Cloud" />
            <TechLogo name="Meta CAPI" />
            <TechLogo name="GTM" />
            <TechLogo name="AWS" />
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex items-start justify-center p-2">
          <div className="w-1.5 h-3 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </section>
  );
};

const TechLogo = ({ name }: { name: string }) => (
  <div className="flex items-center gap-2 text-muted-foreground font-medium text-sm">
    <div className="w-8 h-8 rounded-lg bg-muted/50 flex items-center justify-center">
      <span className="text-xs font-bold">{name.charAt(0)}</span>
    </div>
    <span className="hidden sm:inline">{name}</span>
  </div>
);

export default HeroSection;
