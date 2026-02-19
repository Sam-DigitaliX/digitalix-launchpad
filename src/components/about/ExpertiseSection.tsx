const technologies = [
  "sGTM",
  "Meta CAPI",
  "GA4",
  "Google Ads Enhanced Conversions",
  "TikTok Events API",
  "Consent Mode v2",
  "Addingwell",
  "Stape.io",
  "Didomi",
  "BigQuery",
  "Google Tag Manager",
  "Looker Studio",
];

const ExpertiseSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Stack technique{" "}
            <span className="text-gradient-primary">maîtrisée</span>
          </h2>
          <p className="text-foreground/50 max-w-xl mx-auto">
            Les outils et plateformes sur lesquels nous intervenons au
            quotidien.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-foreground/80 hover:border-primary/40 hover:text-foreground hover:bg-white/[0.07] transition-all duration-300 cursor-default"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExpertiseSection;
