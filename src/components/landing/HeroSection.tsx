import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-data-flow.jpg";

const HeroSection = () => {
  return (
    <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden pt-20 pb-28 md:pb-32">
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
          {/* Badge avec gradient + glow effect */}
          <div className="relative inline-flex mb-8 animate-fade-in-up">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-full blur-md" />
            <div className="relative inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 border border-primary/30 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-medium text-gradient-primary">
                Agence Partenaire des Consultants SEA
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground mb-6 animate-fade-in-up animation-delay-100">
            Récupérez 20% de conversions perdues
            <br />
            et rentabilisez enfin vos campagnes SEA grâce à un
            <br />
            <span className="text-gradient-primary">tracking server-side sur-mesure.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-200 leading-relaxed">
            L'infrastructure Server-Side pour contourner les bloqueurs, fiabiliser le signal et sécuriser vos performances publicitaires.{" "}
            <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold">
              Stop au pilotage à l'aveugle.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-fade-in-up animation-delay-300">
            <Button variant="heroGradient" size="xl">
              Sécuriser mon Tracking
            </Button>
            <Button variant="heroGradientOutline" size="xl">
              Offre Partenaires
            </Button>
          </div>

          {/* Trust Metrics (Alternative à Trust Bar) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto animate-fade-in-up animation-delay-400">
            <MetricCard value="99.9%" label="Précision" />
            <MetricCard value="7j" label="Setup" />
            <MetricCard value="24/7" label="Support" />
            <MetricCard value="100%" label="RGPD" />
          </div>
        </div>
      </div>
      {/* Scroll Indicator */}
        <div className="absolute inset-x-0 bottom-12 md:bottom-16 z-50 flex justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 animate-float-y">
            <span className="text-xs text-foreground/80 uppercase tracking-wide font-medium">
            Découvrir
            </span>
            <div className="w-6 h-10 rounded-full border-2 border-primary/60 flex items-start justify-center p-2 bg-background/20 backdrop-blur-sm">
              <div className="w-1.5 h-3 bg-gradient-to-b from-primary to-secondary rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
};

const MetricCard = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm">
    <div className="text-2xl md:text-3xl font-bold text-gradient-primary mb-1">{value}</div>
    <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
  </div>
);

export default HeroSection;
