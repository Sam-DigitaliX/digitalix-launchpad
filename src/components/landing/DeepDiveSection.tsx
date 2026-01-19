import { Check } from "lucide-react";
import setupImg from "@/assets/deepdive/Stape_analytics_dashboard.png";
import assurImg from "@/assets/deepdive/Addingwell_dashboard.png";
import projectsImg from "@/assets/deepdive/projects.png";


const blocks = [
  {
    id: "setup",
    title: "Une Infrastructure Propriétaire & Conforme.",
    description: "Fini le bricolage. Nous déployons un serveur dédié sur votre sous-domaine.",
    bullets: [
      "Clean Data (Exclusion des bots)",
      "Implémentation CAPI Meta/Google/LinkedIn",
      "Pack RGPD & Consent Mode V2 inclus",
    ],
    image: setupImg,
    imagePosition: "right" as const,
  },
  {
    id: "assurance",
    title: "Vos données sous surveillance 24/7.",
    description: "Le tracking n'est pas statique. Une mise à jour de site peut tout casser. Nous surveillons pour vous.",
    bullets: [
      "Alerting en temps réel (Slack/Email)",
      "Maintien du score 'Great' sur Facebook",
      "Support prioritaire en <48h",
    ],
    image: assurImg,
    imagePosition: "left" as const,
  },
  {
    id: "partner",
    title: "L'extension technique de votre Agence.",
    description: "Gérez 10 ou 50 clients sans recruter de développeur. Utilisez vos Crédits d'Intervention à la demande.",
    bullets: [
      "Consommation à la tâche (Pack d'heures)",
      "Onboarding client fluide",
      "Marque blanche totale ou partielle",
    ],
    image: projectsImg,
    imagePosition: "right" as const,
  },
];

const DeepDiveSection = () => {
  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <p className="text-xs font-bold tracking-ultra-wide text-primary mb-4">
            DEEP DIVE
          </p>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Comment ça marche en détail
          </h2>
        </div>

        {/* Blocks */}
        <div className="space-y-24 md:space-y-32">
          {blocks.map((block, index) => (
            <div
              key={block.id}
              className={`flex flex-col gap-12 lg:gap-16 items-center ${
                block.imagePosition === "left" ? "lg:flex-row-reverse" : "lg:flex-row"
              }`}
            >
              {/* Text Content */}
              <div className="flex-1 space-y-6">
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-ultra-wide">
                  {index === 0 ? "SETUP" : index === 1 ? "ASSURANCE" : "PARTNER"}
                </div>
                <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground">
                  {block.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {block.description}
                </p>
                <ul className="space-y-4 pt-4">
                  {block.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground/80">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Visual Placeholder */}
              <div className="flex-1 w-full">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden glass-card border border-border/50">
                  {/* Placeholder gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5" />
                  
                  {/* Grid pattern overlay */}
                  <div 
                    className="absolute inset-0 opacity-10"
                    style={{
                      backgroundImage: `linear-gradient(hsl(var(--primary) / 0.3) 1px, transparent 1px),
                                        linear-gradient(90deg, hsl(var(--primary) / 0.3) 1px, transparent 1px)`,
                      backgroundSize: '20px 20px',
                    }}
                  />
                  {/* Image ou placeholder */}
                  {block.image ? (
                    <img
                      src={block.image}
                      alt={block.title}
                      className="absolute inset-0 w-full h-full object-contain p-4"
                      loading="lazy"
                    />
                  ) : (
                    <>
                      {/* Placeholder content */}
                      <div className="absolute inset-0 flex items-center justify-center p-8">
                        <div className="text-center space-y-4">
                          <div className="w-16 h-16 mx-auto rounded-xl bg-primary/20 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-lg bg-primary/40" />
                          </div>
                          <p className="text-sm text-muted-foreground max-w-xs">
                            Image à venir
                          </p>
                        </div>
                      </div>

                      {/* Corner decorations */}
                      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/30 rounded-tl-lg" />
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/30 rounded-br-lg" />
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DeepDiveSection;
