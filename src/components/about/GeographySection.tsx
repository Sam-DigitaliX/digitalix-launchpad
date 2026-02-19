import { MapPin } from "lucide-react";

const cities = [
  "Nancy",
  "Metz",
  "Strasbourg",
  "Luxembourg",
  "Épinal",
  "Reims",
];

const GeographySection = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] mb-8">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-sm text-foreground/70">
              166 rue du bois de grève, Ludres (54710)
            </span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            Basé dans le Grand Est,{" "}
            <span className="text-gradient-primary">actif partout</span>
          </h2>

          <p className="text-foreground/50 mb-10 max-w-xl mx-auto">
            Interventions dans toute la France et à l'international. Nos clients
            sont partout — nous aussi.
          </p>

          <div className="flex flex-wrap justify-center gap-3">
            {cities.map((city) => (
              <span
                key={city}
                className="px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-sm font-medium text-foreground/80"
              >
                {city}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default GeographySection;
