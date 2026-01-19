import { TrendingUp, Users, Clock, Target } from "lucide-react";

const benefits = [
  {
    icon: TrendingUp,
    title: "Hausse de Marge",
    description: "Offre data white-label pour consultants",
  },
  {
    icon: Users,
    title: "Réduction du Churn",
    description: "Des clients qui voient les vrais chiffres restent",
  },
  {
    icon: Clock,
    title: "Gain de Temps",
    description: "Focus stratégie, on gère la tuyauterie",
  },
  {
    icon: Target,
    title: "Closing Facilité",
    description: "L'argument technique qui rassure vos prospects",
  },
];

const BenefitsSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Pourquoi déléguer la technique ?
          </h2>
        </div>

        {/* Benefits Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className="text-center group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/20 group-hover:scale-110 transition-all duration-300">
                <benefit.icon className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {benefit.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
