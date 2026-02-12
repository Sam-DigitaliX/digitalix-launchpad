import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, BadgeCheck } from "lucide-react";
import heroImage from "@/assets/hero-data-flow.jpg";
import LogoCarousel from "./LogoCarousel";

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
      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
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
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1] text-foreground mb-6 animate-fade-in-up animation-delay-100">
            Sans données fiables,
            <br />
            <span className="text-gradient-primary">la performance n'est rien.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-foreground max-w-2xl mx-auto mb-10 animate-fade-in-up animation-delay-200 leading-relaxed">
            La performance publicitaire ne se décrète pas.
            <span className="block mt-2 text-gradient-primary font-semibold">
              Elle se construit sur des données réellement maîtrisées.
            </span>
            <span className="block mt-6 text-muted-foreground font-thin">
              Commencez par auditer la fiabilité de votre tracking.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-5 animate-fade-in-up animation-delay-300">
            <Button variant="heroGradient" size="xl" asChild>
              <Link to="/contact">
                Je réserve mon audit tracking à 0€
              </Link>
            </Button>
          </div>

          {/* Social proof badge */}
          <div className="flex items-center justify-center gap-3 mb-12 animate-fade-in-up animation-delay-300">
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
          <div className="animate-fade-in-up animation-delay-400">
            <LogoCarousel />
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

export default HeroSection;
