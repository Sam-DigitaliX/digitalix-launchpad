import { ExternalLink } from "lucide-react";

const socials = [
  {
    label: "LinkedIn",
    href: "https://fr.linkedin.com/in/samlepirate",
  },
  {
    label: "Malt",
    href: "https://www.malt.fr/profile/samuelmarange",
  },
];

const FounderSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-12 md:gap-16">
          {/* Avatar placeholder */}
          <div className="shrink-0">
            <div className="w-40 h-40 md:w-52 md:h-52 rounded-3xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center overflow-hidden">
              <span className="text-5xl md:text-6xl font-bold text-gradient-primary select-none">
                SM
              </span>
            </div>
          </div>

          {/* Bio */}
          <div className="text-center md:text-left">
            <p className="text-sm font-medium text-primary mb-2">Fondateur</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Samuel Marange
            </h2>
            <p className="text-foreground/50 font-medium mb-6">
              Consultant Server-Side Tracking
            </p>
            <p className="text-foreground/70 leading-relaxed mb-4">
              Spécialiste du tracking server-side depuis les premières heures de
              sGTM, j'ai fondé DigitaliX en 2022 avec une conviction : les
              annonceurs et leurs consultants méritent des données fiables pour
              piloter leur acquisition.
            </p>
            <p className="text-foreground/70 leading-relaxed mb-8">
              Aujourd'hui, DigitaliX accompagne des dizaines de consultants SEA
              et d'annonceurs dans la mise en place de solutions de tracking
              pérennes, conformes au RGPD et réellement performantes.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4 justify-center md:justify-start">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.05] border border-white/[0.08] text-sm font-medium text-foreground/70 hover:text-foreground hover:border-primary/40 transition-colors"
                >
                  {s.label}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderSection;
