import { SignalLow, EyeOff, ShieldAlert } from "lucide-react";

const problems = [
  {
    icon: SignalLow,
    title: "Ad-Blockers & ITP",
    description: "30% de vos conversions disparaissent. Vos rapports sont faux.",
  },
  {
    icon: EyeOff,
    title: "Algos Aveugles",
    description: "Le Smart Bidding dépense votre budget au hasard sans données fiables.",
  },
  {
    icon: ShieldAlert,
    title: "Dépendance Cookie",
    description: "La donnée tierce meurt. Construisez votre propre First-Party Data.",
  },
];

const ProblemSection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-card">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Le Tracking Client-Side est{" "}
            <span className="text-gradient-primary">obsolète.</span>
          </h2>
        </div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={problem.title}
              className="group relative rounded-2xl p-[1px] bg-gradient-to-br from-primary/60 via-secondary/40 to-transparent transition-all duration-500 hover:scale-[1.02]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="glass-card relative h-full p-8 overflow-hidden">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative z-10">
                  <div className="w-14 h-14 mb-6 rounded-xl bg-muted flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <problem.icon className="w-7 h-7 text-foreground" />
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {problem.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed">
                    {problem.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
