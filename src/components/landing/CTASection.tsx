import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import GradientSection from "./GradientSection";

const CTASection = () => {
  return (
    <GradientSection className="relative text-center">
      <div className="relative z-10 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
          Votre tracking actuel vous{" "}
          <span className="text-gradient-primary">coûte de l'argent.</span>
        </h2>
        <p className="text-lg md:text-xl text-foreground/70 mb-10 max-w-xl mx-auto">
          Identifions vos fuites de conversions en 15 minutes. Audit offert, sans engagement.
        </p>
        <Button variant="heroGradient" size="xl" className="group" asChild>
          <Link to="/contact">
            Réserver mon Audit
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </Button>
      </div>
    </GradientSection>
  );
};

export default CTASection;
