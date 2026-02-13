import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";

const solutions = [
  {
    tier: "SETUP",
    title: "Architecture Server-Side",
    description: "Migration infrastructure propriétaire, CAPI Meta/LinkedIn/Google, Conformité RGPD, intégration de CMP.",
    cta: "Lancer le Setup",
    featured: false,
    features: [
      "Audit technique complet",
      "Setup infrastructure cloud",
      "Intégration CMP",
      "Paramétrage Consent Mode",
      "Intégration CAPI Meta, LinkedIn & Google",
      "Documentation technique",
    ],
  },
  {
    tier: "ASSURANCE",
    title: "Assurance Data Quality",
    description: "Monitoring 24/7. Garantie de uptime et maintien du Match Rate. Le tracking ne casse plus.",
    cta: "Sécuriser ma Data",
    featured: true,
    badge: "Recommandé",
    features: [
      "Tout du Setup inclus",
      "Monitoring 24/7",
      "Garantie Match Rate",
      "Support prioritaire",
      "Rapports mensuels",
    ],
  },
  {
    tier: "PARTNER",
    title: "Partenaire Technique Agile",
    description: "Votre pôle technique à la demande. Fonctionnement par Crédits d'Intervention (Pack Journée). Zéro coût fixe inutile : vous ne consommez que ce qui est nécessaire pour vos Setups et Maintenance. Validité 60 jours.",
    cta: "Devenir Partenaire",
    featured: false,
    features: [
      "Crédits d'intervention flexibles",
      "Pack Journée à la demande",
      "Zéro engagement fixe",
      "Validité 60 jours",
      "Support prioritaire",
    ],
  },
];

const SolutionsSection = () => {
  return (
    <section id="services" className="py-24 md:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            3 Niveaux d'Intervention
          </h2>
        </div>

        {/* Solutions Grid */}
        <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto items-stretch">
          {solutions.map((solution) => (
            <div
              key={solution.tier}
              className={`relative glass-card-interactive p-8 flex flex-col overflow-visible ${
                solution.featured
                  ? "lg:scale-105 border-primary/50 shadow-2xl z-10"
                  : "border-border/50"
              }`}
            >
              {/* Featured Badge - positioned inside with negative margin */}
              {solution.badge && (
                <div className="flex justify-center -mt-12 mb-4">
                  <div className="relative flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-full bg-gradient-to-r from-primary to-secondary text-white border border-white/20 shadow-lg">
                  <span className="relative z-10 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" />
                    {solution.badge}
                  </span>
              {/* Glow layer */}
                  <span className="absolute inset-0 rounded-full blur-md opacity-50 bg-gradient-to-r from-primary to-secondary -z-10" />
                </div>
              </div>
            )}


              {/* Tier Label */}
              <p className={`text-xs font-bold tracking-ultra-wide text-muted-foreground mb-4 ${solution.badge ? "" : "mt-0"}`}>
                {solution.tier}
              </p>

              {/* Title */}
              <h3 className="text-2xl font-bold text-foreground mb-3">
                {solution.title}
              </h3>

              {/* Description */}
              <p className="text-muted-foreground mb-8 flex-grow">
                {solution.description}
              </p>

              {/* Features */}
              <ul className="space-y-3 mb-8">
                {solution.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-5 h-5 icon-gradient flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/80">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Button
                variant={solution.featured ? "heroGradient" : "heroGradientOutline"}
                size="lg"
                className="w-full"
                asChild
              >
                <Link to="/contact">{solution.cta}</Link>
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SolutionsSection;
