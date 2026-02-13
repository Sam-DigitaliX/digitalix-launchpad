import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    stat: "+20%",
    statLabel: "CPA anormalement élevé",
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
  "+90% de précision sur vos données",
  "-20% baisse de votre CPA",
  "100% conforme RGPD",
];

const ProblemSolutionSection = () => {
  const navigate = useNavigate();
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
      <section className="relative py-24 md:py-32 overflow-hidden">
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
            <span className="glass-badge px-4 py-1.5 mb-6">
              <span className="text-gradient-primary">⚠️ Le Problème</span>
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
              Votre tracking client-side vous fait perdre
              <br className="hidden md:block" />
              <span className="text-destructive"> 30% de vos conversions.</span>
            </h2>
            <p className="text-lg text-foreground/70 max-w-3xl mx-auto">
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
                className={`relative bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 md:p-8 transition-all duration-700 group hover:border-primary/30 ${
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
          <div className="flex flex-col items-center gap-3">
              <h3 className="text-xl md:text-2xl lg:text-3xl font-bold text-muted-foreground text-center max-w-lg">
                Comment rendre vos campagnes <span className="text-gradient-primary">à nouveau rentables</span> ?
              </h3>
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
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="glass-badge px-4 py-1.5 mb-6">
              <span className="text-gradient-primary">✅ La Solution</span>
            </span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Le Server-Side est la{" "}
              <span className="text-gradient-primary">seule solution fiable.</span>
            </h2>
          </div>

          {/* Lottie in Glassmorphism Card */}
          <div className="max-w-4xl mx-auto">
            <div 
              className={`relative rounded-2xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-4 md:p-8 shadow-[0_0_60px_-8px_hsl(262_83%_58%/0.15)] transition-all duration-1000 ${
                isLottieVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
              }`}
            >
              <Lottie
                animationData={serverSideAnimation}
                loop={true}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Benefits Mini-Cards */}
          <div 
            className={`grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 max-w-4xl mx-auto mt-10 md:mt-14 transition-all duration-700 delay-500 ${
              isLottieVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            {benefits.map((benefit, index) => (
              <div 
                key={benefit}
                className="rounded-xl border border-white/[0.08] bg-white/[0.04] backdrop-blur-xl p-4 flex items-center gap-3 hover:border-primary/30 transition-colors"
                style={{ transitionDelay: `${600 + index * 100}ms` }}
              >
                <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                <span className="text-sm text-foreground font-medium">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Result + CTA */}
          <div 
            className={`text-center mt-10 md:mt-14 max-w-3xl mx-auto transition-all duration-700 delay-700 ${
              isLottieVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <p className="text-lg text-foreground/70 mb-8">
              Résultat : Des campagnes <span className="font-bold text-secondary">plus rentables</span> et des décisions basées sur des <span className="font-bold text-foreground">données fiables</span>.
            </p>
            <Button variant="heroGradient" size="xl" onClick={() => navigate('/contact')}>
              Réserver mon Audit Offert
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default ProblemSolutionSection;
