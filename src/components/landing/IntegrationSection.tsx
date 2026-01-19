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
    <section id="integration" className="py-24 md:py-32 bg-card">
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
              {/* Large Number */}
              <span className="text-7xl md:text-8xl font-black text-primary/20 group-hover:text-primary/40 transition-colors duration-500 leading-none">
                {item.number}
              </span>

              {/* Content */}
              <h3 className="text-2xl font-bold text-foreground mt-4 mb-3">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
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
