import { CheckCircle, Activity, FileSearch, Cog, Shield, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "01",
    icon: FileSearch,
    title: "Audit & Diagnostic",
    description: "Analyse complète de votre infrastructure data existante",
    details: [
      "Cartographie des tags et pixels actuels",
      "Identification des pertes de données",
      "Évaluation de la conformité RGPD",
      "Rapport détaillé avec recommandations"
    ],
    duration: "1-2 semaines"
  },
  {
    number: "02",
    icon: Cog,
    title: "Architecture & Setup",
    description: "Conception et déploiement de votre infrastructure server-side",
    details: [
      "Configuration du conteneur GTM Server",
      "Migration des tags prioritaires",
      "Mise en place du tracking first-party",
      "Tests en environnement de staging"
    ],
    duration: "2-3 semaines"
  },
  {
    number: "03",
    icon: Shield,
    title: "Validation & QA",
    description: "Tests rigoureux pour garantir l'intégrité des données",
    details: [
      "Validation des conversions",
      "Tests cross-browser et cross-device",
      "Vérification de la conformité légale",
      "Documentation technique complète"
    ],
    duration: "1 semaine"
  },
  {
    number: "04",
    icon: TrendingUp,
    title: "Monitoring & Optimisation",
    description: "Suivi continu et amélioration des performances",
    details: [
      "Dashboards de monitoring en temps réel",
      "Alertes automatiques en cas d'anomalie",
      "Optimisations continues",
      "Support technique dédié"
    ],
    duration: "Continu"
  },
];

const TimelineStep = ({ step, index, isVisible }: { step: typeof steps[0]; index: number; isVisible: boolean }) => {
  const isEven = index % 2 === 0;
  
  return (
    <div className={`relative flex items-center w-full ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
      {/* Content Card */}
      <div 
        className={`w-full md:w-5/12 transition-all duration-700 ${
          isVisible 
            ? 'opacity-100 translate-x-0' 
            : isEven 
              ? 'opacity-0 -translate-x-12' 
              : 'opacity-0 translate-x-12'
        }`}
        style={{ transitionDelay: `${index * 100}ms` }}
      >
        <div className="bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 md:p-8 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 transition-all duration-500 group">
          {/* Header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
              <step.icon className="w-7 h-7 text-primary" />
            </div>
            <div>
              <span className="text-xs font-medium text-primary uppercase tracking-wider">Étape {step.number}</span>
              <h3 className="text-xl font-bold text-foreground">{step.title}</h3>
            </div>
          </div>
          
          {/* Description */}
          <p className="text-muted-foreground mb-4">{step.description}</p>
          
          {/* Details List */}
          <ul className="space-y-2 mb-4">
            {step.details.map((detail, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
          
          {/* Duration Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Activity className="w-4 h-4" />
            {step.duration}
          </div>
        </div>
      </div>
      
      {/* Center Timeline Node */}
      <div className="hidden md:flex w-2/12 justify-center">
        <div 
          className={`relative z-10 w-16 h-16 rounded-full bg-white/[0.06] backdrop-blur-xl border-4 border-primary flex items-center justify-center transition-all duration-500 ${
            isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}
          style={{ transitionDelay: `${index * 100 + 200}ms` }}
        >
          <span className="text-xl font-bold text-primary">{step.number}</span>
        </div>
      </div>
      
      {/* Empty space for alternating layout */}
      <div className="hidden md:block w-5/12" />
    </div>
  );
};

const ProcessSection = () => {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);

  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    
    stepRefs.current.forEach((ref, index) => {
      if (ref) {
        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setVisibleSteps(prev => new Set([...prev, index]));
            }
          },
          { threshold: 0.3, rootMargin: '-50px' }
        );
        observer.observe(ref);
        observers.push(observer);
      }
    });

    return () => {
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  // Animate the timeline line based on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const elementTop = rect.top;
        const elementHeight = rect.height;
        
        // Calculate how much of the element is visible
        const visibleTop = Math.max(0, windowHeight - elementTop);
        const progress = Math.min(1, Math.max(0, visibleTop / (elementHeight + windowHeight * 0.5)));
        
        setLineHeight(progress * 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="process" className="relative py-24 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24">
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] text-xs font-bold uppercase tracking-widest mb-4">
            <span className="text-gradient-primary">Notre Méthodologie</span>
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            De l'Audit au Monitoring
          </h2>
          <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
            Une approche structurée et transparente pour transformer votre infrastructure data en un avantage compétitif.
          </p>
        </div>

        {/* Vertical Timeline */}
        <div ref={timelineRef} className="relative max-w-5xl mx-auto">
          {/* Animated Connecting Line - Desktop */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2">
            {/* Background line */}
            <div className="absolute inset-0 bg-border/50 rounded-full" />
            {/* Animated progress line */}
            <div 
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary via-secondary to-primary rounded-full transition-all duration-300"
              style={{ height: `${lineHeight}%` }}
            />
            {/* Glow effect */}
            <div 
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary via-secondary to-primary rounded-full blur-md opacity-50 transition-all duration-300"
              style={{ height: `${lineHeight}%` }}
            />
          </div>

          {/* Mobile Timeline Line — animated on scroll */}
          <div className="md:hidden absolute left-6 top-0 bottom-0 w-0.5">
            {/* Background line */}
            <div className="absolute inset-0 bg-border/30 rounded-full" />
            {/* Animated progress line */}
            <div
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary via-secondary to-primary rounded-full transition-all duration-300"
              style={{ height: `${lineHeight}%` }}
            />
            {/* Glow effect */}
            <div
              className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary via-secondary to-primary rounded-full blur-sm opacity-50 transition-all duration-300"
              style={{ height: `${lineHeight}%` }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-12 md:space-y-24">
            {steps.map((step, index) => (
              <div
                key={step.number}
                ref={el => stepRefs.current[index] = el}
                className="relative"
              >
                {/* Mobile Timeline Node */}
                <div className={`md:hidden absolute left-[15px] top-8 w-5 h-5 rounded-full border-4 border-white/[0.1] z-10 transition-all duration-500 ${
                  visibleSteps.has(index) ? 'bg-primary scale-100' : 'bg-white/[0.1] scale-75'
                }`} />
                
                {/* Mobile Content with padding for timeline */}
                <div className="md:hidden pl-14">
                  <div 
                    className={`bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-6 transition-all duration-700 ${
                      visibleSteps.has(index) 
                        ? 'opacity-100 translate-y-0' 
                        : 'opacity-0 translate-y-8'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <step.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-primary">Étape {step.number}</span>
                        <h3 className="text-lg font-bold text-foreground">{step.title}</h3>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{step.description}</p>
                    <ul className="space-y-1.5 mb-3">
                      {step.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <CheckCircle className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                          <span>{detail}</span>
                        </li>
                      ))}
                    </ul>
                    <span className="text-xs text-primary font-medium">{step.duration}</span>
                  </div>
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:block">
                  <TimelineStep step={step} index={index} isVisible={visibleSteps.has(index)} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
