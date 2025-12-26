import { Search, Server, CheckCircle, Activity } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Audit",
    description: "Diagnostic",
  },
  {
    number: "02",
    icon: Server,
    title: "Setup",
    description: "Architecture",
  },
  {
    number: "03",
    icon: CheckCircle,
    title: "QA",
    description: "Validation",
  },
  {
    number: "04",
    icon: Activity,
    title: "Monitoring",
    description: "Assurance",
  },
];

const ProcessSection = () => {
  return (
    <section id="process" className="py-24 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            De l'Audit au Monitoring
          </h2>
        </div>

        {/* Process Timeline */}
        <div className="relative max-w-5xl mx-auto">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/50 to-transparent hidden md:block" />
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-primary opacity-50 blur-sm hidden md:block" />

          {/* Steps */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={step.number} className="relative text-center group">
                {/* Glowing Node */}
                <div className="relative z-10 mx-auto mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto group-hover:border-primary/50 group-hover:shadow-lg group-hover:shadow-primary/20 transition-all duration-500">
                    <step.icon className="w-8 h-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  {/* Number Badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
                    {step.number}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-foreground mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProcessSection;
