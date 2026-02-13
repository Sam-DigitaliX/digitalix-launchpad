import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  return (
    <div className="relative mx-4 md:mx-8 mt-16">
      {/* Glass panel — top corners only, fades into footer */}
      <div
        className="relative rounded-t-[40px] pt-16 md:pt-24 px-4 md:px-8 lg:px-20 pb-20 md:pb-28 bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] border-b-0"
        style={{
          maskImage: 'linear-gradient(to bottom, black calc(100% - 60px), transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black calc(100% - 60px), transparent)',
        }}
      >
        {/* Subtle top border glow */}
        <div
          className="absolute inset-x-0 top-0 h-px rounded-t-[40px]"
          style={{
            background:
              "linear-gradient(90deg, transparent, hsl(262 83% 58% / 0.3) 30%, hsl(262 83% 58% / 0.4) 50%, hsl(262 83% 58% / 0.3) 70%, transparent)",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Votre tracking actuel vous{" "}
            <span className="text-gradient-primary">coûte de l'argent.</span>
          </h2>
          <p className="text-lg md:text-xl text-foreground/70 mb-10 max-w-xl mx-auto">
            Identifions vos fuites de conversions en 15 minutes. Audit offert,
            sans engagement.
          </p>
          <Button variant="heroGradient" size="xl" className="group" asChild>
            <Link to="/contact">
              Réserver mon Audit
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CTASection;
