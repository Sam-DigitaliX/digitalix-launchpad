import { useEffect, useRef, useState } from 'react';
import { Star, CheckCircle2, Quote } from 'lucide-react';

interface Review {
  name: string;
  company: string;
  rating: number;
  title: string;
  content: string;
}

const reviewsRow1: Review[] = [
  { name: "Sophie Martin", company: "E-commerce Mode", rating: 5, title: "ROI multiplié par 3 en 2 mois", content: "Grâce au server-side tracking, on a récupéré 35% de données perdues. Nos campagnes Google Ads sont enfin optimisées avec des données fiables." },
  { name: "Thomas Dubois", company: "SaaS B2B", rating: 5, title: "Enfin des données fiables", content: "L'équipe a migré notre tracking en 2 semaines. Le support est réactif et les dashboards sont clairs. Je recommande sans hésiter." },
  { name: "Marie Leroy", company: "Agence Marketing", rating: 5, title: "Expertise rare et précieuse", content: "Difficile de trouver des experts GTM server-side en France. DigitaliX maîtrise parfaitement le sujet et vulgarise très bien les concepts." },
  { name: "Lucas Bernard", company: "Lead Gen B2B", rating: 5, title: "Taux de conversion +40%", content: "Depuis la mise en place du tracking server-side, nos audiences de remarketing sont bien plus précises. Le ROAS a explosé." },
  { name: "Émilie Rousseau", company: "Marketplace", rating: 5, title: "Migration sans accroc", content: "L'équipe a géré la migration complète sans aucune perte de données. Transition fluide et résultats immédiats sur nos KPIs." },
  { name: "Antoine Mercier", company: "E-commerce Luxe", rating: 5, title: "Conformité RGPD assurée", content: "Enfin une solution qui respecte la vie privée tout en gardant des données marketing exploitables. Un vrai game-changer." },
];

const reviewsRow2: Review[] = [
  { name: "Clara Fontaine", company: "Agence SEA", rating: 5, title: "Indispensable pour nos clients", content: "On recommande DigitaliX à tous nos clients e-commerce. La qualité des données remontées est incomparable avec le client-side." },
  { name: "Julien Moreau", company: "DTC Brand", rating: 5, title: "Support exceptionnel", content: "Chaque question trouve une réponse en moins de 2h. L'équipe comprend vraiment les enjeux business derrière le tracking." },
  { name: "Nadia Benali", company: "Travel Tech", rating: 5, title: "Données enfin complètes", content: "On passait à côté de 30% de nos conversions à cause des adblockers. Problème résolu grâce au server-side tracking." },
  { name: "Pierre Dupont", company: "Fintech", rating: 5, title: "Audit révélateur", content: "L'audit initial a révélé des failles majeures dans notre setup. La correction a immédiatement amélioré la qualité de nos données." },
  { name: "Camille Lefèvre", company: "Retail Omnicanal", rating: 5, title: "Vision 360° enfin possible", content: "Le croisement des données online/offline est devenu possible grâce à un tracking fiable. Merci DigitaliX !" },
  { name: "Maxime Girard", company: "EdTech", rating: 5, title: "Setup rapide et efficace", content: "En 10 jours, tout était en place. Les résultats se sont vus dès la première semaine sur nos campagnes Meta." },
];

const ReviewCard = ({ review }: { review: Review }) => (
  <div className="flex-shrink-0 w-[340px] md:w-[400px] p-5 rounded-2xl border border-primary/15 bg-card/60 backdrop-blur-sm space-y-3 mx-2 shadow-[0_0_40px_-4px_hsl(262_83%_58%/0.3),0_0_15px_-2px_hsl(262_83%_68%/0.2)]">
    <div className="flex items-start justify-between">
      <div className="flex items-center gap-2">
        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
          {review.name.charAt(0)}
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm text-foreground">{review.name}</span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-[10px] font-medium">
              <CheckCircle2 className="w-2.5 h-2.5" />
              Vérifié
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{review.company}</span>
        </div>
      </div>
      <Quote className="w-5 h-5 text-primary/30" />
    </div>

    <div className="flex gap-0.5">
      {Array.from({ length: review.rating }).map((_, i) => (
        <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
      ))}
    </div>

    <p className="font-medium text-sm text-foreground">"{review.title}"</p>
    <p className="text-xs text-muted-foreground leading-relaxed">{review.content}</p>
  </div>
);

const ReviewsCarouselSection = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const windowH = window.innerHeight;

      // Only animate when section is in viewport
      if (rect.bottom < 0 || rect.top > windowH) return;

      const delta = window.scrollY - lastScrollY.current;
      lastScrollY.current = window.scrollY;

      setScrollOffset(prev => prev + delta * 0.3);
    };

    lastScrollY.current = window.scrollY;
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="py-16 md:py-24 overflow-hidden bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mb-10 md:mb-14">
        <p className="text-center text-sm uppercase tracking-widest text-muted-foreground mb-3">
          <span className="text-gradient-primary">Avis clients</span>
        </p>
        <h2 className="text-2xl md:text-4xl font-bold text-center text-foreground">
          Ce que nos clients disent de nous
        </h2>
      </div>

      {/* Row 1 — moves right on scroll down */}
      <div className="mb-4">
        <div
          ref={row1Ref}
          className="flex"
          style={{ transform: `translateX(${-scrollOffset}px)` }}
        >
          {[...reviewsRow1, ...reviewsRow1, ...reviewsRow1].map((review, i) => (
            <ReviewCard key={`r1-${i}`} review={review} />
          ))}
        </div>
      </div>

      {/* Row 2 — moves left on scroll down (opposite) */}
      <div>
        <div
          ref={row2Ref}
          className="flex"
          style={{ transform: `translateX(${scrollOffset - 600}px)` }}
        >
          {[...reviewsRow2, ...reviewsRow2, ...reviewsRow2].map((review, i) => (
            <ReviewCard key={`r2-${i}`} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReviewsCarouselSection;
