import { Star, CheckCircle2 } from 'lucide-react';

interface Testimonial {
  name: string;
  company?: string;
  rating: number;
  title: string;
  content: string;
}

const testimonials: Testimonial[] = [
  {
    name: "Sophie Martin",
    company: "E-commerce Mode",
    rating: 5,
    title: "ROI multiplié par 3 en 2 mois",
    content: "Grâce au server-side tracking, on a récupéré 35% de données perdues. Nos campagnes Google Ads sont enfin optimisées avec des données fiables."
  },
  {
    name: "Thomas Dubois",
    company: "SaaS B2B",
    rating: 5,
    title: "Enfin des données fiables",
    content: "L'équipe a migré notre tracking en 2 semaines. Le support est réactif et les dashboards sont clairs. Je recommande sans hésiter."
  },
  {
    name: "Marie Leroy",
    company: "Agence Marketing",
    rating: 5,
    title: "Expertise rare et précieuse",
    content: "Difficile de trouver des experts GTM server-side en France. DigitaliX maîtrise parfaitement le sujet et vulgarise très bien les concepts."
  }
];

interface TestimonialsSectionProps {
  variant?: 'sidebar' | 'full';
  className?: string;
}

export default function TestimonialsSection({ variant = 'full', className = '' }: TestimonialsSectionProps) {
  const isSidebar = variant === 'sidebar';

  return (
    <div className={`${className}`}>
      {isSidebar ? (
        <div className="space-y-4">
          <p className="text-sm font-medium text-muted-foreground mb-4">
            Ce qu'ils disent de nous
          </p>
          {testimonials.map((testimonial, index) => (
            <div 
              key={index}
              className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{testimonial.name}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Vérifié
                  </span>
                </div>
              </div>

              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Title */}
              <p className="font-medium text-sm text-foreground">
                "{testimonial.title}"
              </p>

              {/* Content */}
              <p className="text-xs text-muted-foreground leading-relaxed">
                {testimonial.content}
              </p>

              {/* Company */}
              {testimonial.company && (
                <p className="text-[10px] text-muted-foreground/70">
                  {testimonial.company}
                </p>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-center text-sm font-medium text-muted-foreground">
            Ce qu'ils disent de nous
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index}
                className="p-5 rounded-xl bg-muted/30 border border-border/50 space-y-3"
              >
                {/* Header */}
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{testimonial.name}</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    Vérifié
                  </span>
                </div>

                {/* Stars */}
                <div className="flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                {/* Title */}
                <p className="font-medium text-foreground">
                  "{testimonial.title}"
                </p>

                {/* Content */}
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {testimonial.content}
                </p>

                {/* Company */}
                {testimonial.company && (
                  <p className="text-xs text-muted-foreground/70">
                    {testimonial.company}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
