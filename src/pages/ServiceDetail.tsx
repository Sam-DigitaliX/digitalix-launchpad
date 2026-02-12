import { useParams, Link, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { services } from "@/data/services";

const ServiceDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const service = services.find((s) => s.slug === slug);

  if (!service) return <Navigate to="/services" replace />;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="relative pt-32 pb-16 md:pt-44 md:pb-24 overflow-hidden">
          <div className="glow-top-bar" />
          <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-3xl" />
          <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
            <Link
              to="/services"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              Toutes les prestations
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                <service.icon className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
                {service.title}
              </h1>
            </div>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl">
              {service.longDescription}
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-10">
              Ce qui est <span className="text-gradient-primary">inclus</span>
            </h2>
            <ul className="space-y-4">
              {service.features.map((feature) => (
                <li key={feature} className="flex items-start gap-4 glass-card p-5">
                  <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 md:py-28 px-4 sm:px-6 lg:px-8">
          <div className="rounded-section-top max-w-7xl mx-auto py-20 md:py-28 text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-6">
              Prêt à démarrer ?
            </h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto">
              Réservez votre audit gratuit et découvrez comment nous pouvons transformer votre tracking.
            </p>
            <Button variant="heroGradient" size="xl" className="group" asChild>
              <Link to="/contact">
                Réserver mon Audit à 0€
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceDetail;
