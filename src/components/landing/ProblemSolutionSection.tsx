import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";
import serverSideAnimation from "@/assets/server-side-schema.json";
import AdblockIcon from "@/assets/icon-adblock.png";
import PrivacyIcon from "@/assets/icon-privacy.png";
import AlgoIcon from "@/assets/icon-algorythm.png";
import { CheckCircle, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";

const problems = [
  {
    icon: AdblockIcon,
    title: "Ad-Blockers & ITP",
    stat: "30%",
    statLabel: "de données perdues",
    description: "Les bloqueurs et restrictions iOS 17 suppriment jusqu'à 30% de vos conversions.",
    barWidth: "30%",
    barColor: "bg-destructive",
    barBg: "bg-destructive/30",
  },
  {
    icon: AlgoIcon,
    title: "Algos Aveugles",
    stat: "-20%",
    statLabel: "CPA après intervention",
    description: "Vos algorithmes publicitaires dépensent votre budget au hasard sans données complètes.",
    barWidth: "80%",
    barColor: "bg-gradient-to-r from-primary to-secondary",
    barBg: "bg-primary/15",
  },
  {
    icon: PrivacyIcon,
    title: "Fin des Cookies Tiers",
    stat: "1/2",
    statLabel: "utilisateur refuse les cookies",
    description: "Le RGPD et la disparition des cookies tiers rendent votre tracking obsolète.",
    barWidth: "50%",
    barColor: "bg-primary",
    barBg: "bg-primary/15",
  },
];

const benefits = [
  "Contourne 100% des bloqueurs",
  "99.9% de précision sur vos données",
  "Alimente vos algos avec des données complètes",
  "100% conforme RGPD",
];

const ProblemSolutionSection = () => {
  const [isLottieVisible, setIsLottieVisible] = useState(false);
  const lottieRef = useRef<HTMLDivElement>(null);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLottieVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (lottieRef.current) {
      observer.observe(lottieRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    cardRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisibleCards(prev => new Set([...prev, index]));
            }
          },
          { threshold: 0.3 }
        );
        observer.observe(ref);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  return (
    <>
      {/* PROBLEM SECTION - Dark */}
      <section className="relative py-24 md:py-32 bg-card overflow-hidden">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16 md:mb-20">
            <span className="inline-block px-4 py-1.5 rounded-full bg-destructive/20 text-destructive text-sm font-medium mb-6">
              ⚠️ Le problème
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Votre tracking client-side vous fait perdre
              <br className="hidden md:block" />
              <span className="text-destructive"> 30% de vos conversions.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              iOS 17, les AdBlockers et le RGPD rendent votre tracking actuel{" "}
              <span className="font-semibold text-foreground">inefficace et coûteux</span>.
            </p>
          </div>

          {/* Problem Cards */}
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {problems.map((problem, index) => (
              <div
                key={problem.title}
                ref={el => cardRefs.current[index] = el}
                className={`relative bg-background/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 md:p-8 transition-all duration-700 group hover:border-primary/30 ${
                  visibleCards.has(index) 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 translate-y-8'
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                {/* Icon with glow */}
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <span className="absolute inset-0 rounded-full blur-xl bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <img
                      src={problem.icon}
                      alt={problem.title}
                      className="relative z-10 h-14 w-14 object-contain"
                    />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-3 text-center">
                  {problem.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm mb-6 text-center leading-relaxed">
                  {problem.description}
                </p>

                {/* Stat Bar */}
                <div className="space-y-2">
                  <div className={`h-2 ${problem.barBg} rounded-full overflow-hidden`}>
                    <div 
                      className={`h-full ${problem.barColor} rounded-full transition-all duration-1000 delay-300`}
                      style={{ width: visibleCards.has(index) ? problem.barWidth : '0%' }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-2xl font-bold text-foreground">{problem.stat}</span>
                    <span className="text-muted-foreground">{problem.statLabel}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Transition Arrow */}
          <div className="flex justify-center mt-20 md:mt-28 mb-[-2rem]">
            <div className="flex flex-col items-center gap-2">
              <span className="text-sm text-muted-foreground uppercase tracking-wider">La solution</span>
              <div className="w-10 h-10 rounded-full border-2 border-primary/50 flex items-center justify-center animate-bounce">
                <ArrowDown className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SOLUTION SECTION - Bright with Lottie */}
      <section 
        ref={lottieRef}
        className="relative py-16 md:py-20 overflow-hidden"
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-card via-primary/5 to-background" />
        
        {/* Glow effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-secondary/10 rounded-full blur-3xl opacity-30" />
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-medium mb-6">
              ✅ La solution
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Le Server-Side est la{" "}
              <span className="text-gradient-primary">seule solution fiable.</span>
            </h2>
          </div>

          {/* Lottie Animation Full-Width with Overlay */}
          <div className="relative max-w-5xl mx-auto">
            {/* Lottie Container */}
            <div 
              className={`relative transition-all duration-1000 ${
                isLottieVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <Lottie
                animationData={serverSideAnimation}
                loop={true}
                className="w-full h-auto"
              />
              
              {/* Gradient Overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Benefits Overlay - Bottom */}
            <div 
              className={`relative mt-8 md:mt-12 transition-all duration-700 delay-500 ${
                isLottieVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 md:p-10 shadow-2xl">
                {/* Benefits Grid */}
                <div className="grid sm:grid-cols-2 gap-4 md:gap-6 mb-8">
                  {benefits.map((benefit) => (
                    <div 
                      key={benefit}
                      className="flex items-center gap-3 group"
                    >
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <CheckCircle className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-foreground font-medium">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Result Statement */}
                <div className="text-center pt-6 border-t border-border/50">
                  <p className="text-lg text-muted-foreground">
                    Résultat : Des campagnes <span className="font-bold text-secondary">plus rentables</span> et des décisions basées sur des <span className="font-bold text-foreground">données fiables</span>.
                  </p>
                </div>

                {/* CTA */}
                <div className="flex justify-center mt-8">
                  <Button variant="heroGradient" size="xl">
                    Je réserve mon audit tracking à 0€
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProblemSolutionSection;
