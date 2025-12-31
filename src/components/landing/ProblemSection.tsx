import { ShieldAlert, EyeOff, Cookie } from "lucide-react";

const problems = [
  {
    icon: ShieldAlert,
    title: "Ad-Blockers & ITP",
    description: "Jusqu’à 30 % des conversions disparaissent. Vos rapports sous-estiment la performance réelle. Résultat : vous optimisez et arbitrez sur des chiffres incomplets.",
    gradient: "from-red-500/20 to-transparent",
  },
  {
    icon: EyeOff,
    title: "Algos Aveugles",
    description: "Le Smart Bidding dépense votre budget au hasard sans données fiables. Résultat : les plateformes optimisent, mais pas toujours au bon endroit.",
    gradient: "from-orange-500/20 to-transparent",
  },
  {
    icon: Cookie,
    title: "Dépendance Cookie",
    description: "La fin des cookies est actée et cette donnée tierce disparaît progressivement. La donéée First-Party devient indispensable. Résultat : sans adaptation, les performances se dégradent dans le temps.",
    gradient: "from-yellow-500/20 to-transparent",
  },
];

const ProblemSection = () => {
  return (
    <section className="relative py-24 md:py-32 bg-card">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Le Tracking Client-Side {" "}
            <span className="text-gradient-primary">ne suffit plus.</span>
          </h2>
        </div>

        {/* Problem Cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {problems.map((problem, index) => (
            <div
              key={problem.title}
              className="glass-card p-8 group border border-primary/30 transition-colors duration-300 hover:border-primary/60"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${problem.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}
              />
              <div className="relative z-10">
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
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
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
