import { Eye, Target, Shield, GraduationCap } from "lucide-react";

const values = [
  {
    icon: Eye,
    title: "Transparence",
    description:
      "Des données vérifiables, pas de boîte noire. Chaque décision repose sur des chiffres que vous pouvez auditer.",
  },
  {
    icon: Target,
    title: "Précision",
    description:
      "+90 % d'accuracy tracking. Chaque conversion compte, chaque euro investi est traçable.",
  },
  {
    icon: Shield,
    title: "Conformité",
    description:
      "RGPD et Consent Mode v2 natifs. Vos données sont collectées dans le respect de la réglementation.",
  },
  {
    icon: GraduationCap,
    title: "Autonomie",
    description:
      "Formation et transfert de compétences. Notre objectif : vous rendre autonome, pas dépendant.",
  },
];

const ValuesSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Nos valeurs
          </h2>
          <p className="text-foreground/50 max-w-xl mx-auto">
            Les principes qui guident chacune de nos interventions.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {values.map((value, index) => (
            <div
              key={value.title}
              className="text-center group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="icon-gradient w-16 h-16 rounded-2xl bg-white/[0.05] border border-white/[0.06] flex items-center justify-center mx-auto mb-6 transition-all duration-300 group-hover:bg-gradient-to-br group-hover:from-primary group-hover:to-secondary group-hover:border-transparent group-hover:scale-110">
                <value.icon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">
                {value.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {value.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesSection;
