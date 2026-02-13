import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import CTASection from "@/components/landing/CTASection";
import { services } from "@/data/services";

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
          {/* Evervault-style gradient */}
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, hsl(262 83% 58% / 0.15) 0%, hsl(262 83% 58% / 0.06) 40%, transparent 70%)',
            }}
          />
          {/* Centered glow orb */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
          {/* Bottom glow */}
          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 max-w-4xl mx-auto leading-tight">
              Nos <span className="text-gradient-primary">Prestations</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Du diagnostic à la formation, nous couvrons l'ensemble de vos besoins en tracking server-side.
            </p>
          </div>
        </section>

        {/* Services Grid */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {services.map((service) => (
                <Link
                  key={service.slug}
                  to={`/services/${service.slug}`}
                  className="glass-card-interactive group flex flex-col p-6 md:p-8"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:border-primary/30 transition-colors duration-300">
                    <service.icon className="w-6 h-6 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-foreground mb-3 group-hover:text-white transition-colors">
                    {service.title}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-8 flex-grow leading-relaxed">
                    {service.shortDescription}
                  </p>

                  {/* CTA line */}
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary group-hover:text-secondary transition-colors duration-300">
                    Découvrir
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Services;
