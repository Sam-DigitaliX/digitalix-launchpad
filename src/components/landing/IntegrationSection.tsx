const integrations = [
  {
    number: "01",
    title: "Inclus",
    description: "Intégrez notre setup dès la vente de vos prestations SEA.",
  },
  {
    number: "02",
    title: "White-Label",
    description: "On agit en marque blanche. Votre client ne voit que vous.",
  },
  {
    number: "03",
    title: "Partenaire",
    description: "On intervient comme expert technique à vos côtés.",
  },
];

const IntegrationSection = () => {
  return (
    <section id="integration" className="relative py-24 md:py-32 bg-card overflow-hidden">
      {/* Glow orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-primary/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-[350px] h-[350px] bg-secondary/6 rounded-full blur-[100px] pointer-events-none" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            S'intégrer dans votre offre Agence
          </h2>
        </div>

        {/* Integration Options */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {integrations.map((item) => (
            <div
              key={item.number}
              className="text-center md:text-left group"
            >
              {/* Large Number with Gradient */}
              <span className="text-7xl md:text-8xl font-black leading-none text-gradient-primary opacity-30 group-hover:opacity-50 transition-opacity duration-500">
                {item.number}
              </span>

              {/* Content */}
              <h3 className="text-2xl font-bold text-foreground mt-4 mb-3">
                {item.title}
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IntegrationSection;
