import { useEffect, useRef, useState } from "react";

interface Stat {
  value: number;
  suffix: string;
  label: string;
}

const stats: Stat[] = [
  { value: 50, suffix: "+", label: "Audits réalisés" },
  { value: 4.75, suffix: "/5", label: "Note moyenne" },
  { value: 32, suffix: "", label: "Avis vérifiés" },
  { value: 24, suffix: "h", label: "Délai de réponse" },
];

function useCountUp(target: number, duration = 1500, start = false) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!start) return;
    const isDecimal = target % 1 !== 0;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(isDecimal ? parseFloat(current.toFixed(2)) : Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [target, duration, start]);

  return count;
}

function StatCard({ stat, visible }: { stat: Stat; visible: boolean }) {
  const count = useCountUp(stat.value, 1200, visible);
  const display = stat.value % 1 !== 0 ? count.toFixed(2) : count;

  return (
    <div className="text-center p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-primary/30 transition-colors">
      <p className="text-4xl md:text-5xl font-bold text-foreground mb-2">
        <span className="text-gradient-primary">{display}</span>
        <span className="text-foreground/50">{stat.suffix}</span>
      </p>
      <p className="text-sm text-muted-foreground">{stat.label}</p>
    </div>
  );
}

const NumbersSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            DigitaliX en chiffres
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {stats.map((stat) => (
            <StatCard key={stat.label} stat={stat} visible={visible} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default NumbersSection;
