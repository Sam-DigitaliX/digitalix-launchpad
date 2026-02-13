import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Star, BadgeCheck } from "lucide-react";
import LogoCarousel from "./LogoCarousel";

const HeroSection = () => {
  return (
    <div className="mx-3 md:mx-6">
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-32 overflow-hidden rounded-b-[40px] bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] border-t-0">
        {/* Background gradient */}
        <div
          className="absolute inset-0 rounded-b-[40px]"
          style={{
            background: 'linear-gradient(180deg, hsl(262 83% 58% / 0.12) 0%, hsl(262 83% 58% / 0.05) 40%, transparent 70%)',
          }}
        />
        {/* Bottom border glow */}
        <div
          className="absolute inset-x-0 bottom-0 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent, hsl(262 83% 58% / 0.3) 30%, hsl(188 94% 43% / 0.3) 70%, transparent)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
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
            <p className="text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto mb-3 animate-fade-in-up animation-delay-200">
              La performance publicitaire ne se décrète pas.
            </p>
            <p className="text-base text-foreground/50 max-w-xl mx-auto mb-10 animate-fade-in-up animation-delay-200">
              Elle se construit sur des données réellement maîtrisées.
              Commencez par auditer la fiabilité de votre tracking.
            </p>

            {/* CTA */}
            <div className="flex justify-center mb-5 animate-fade-in-up animation-delay-300">
              <Button variant="heroGradient" size="xl" asChild>
                <Link to="/contact">
                  Réserver mon Audit Offert
                </Link>
              </Button>
            </div>

            {/* Social proof */}
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
      </section>
    </div>
  );
};

export default HeroSection;
