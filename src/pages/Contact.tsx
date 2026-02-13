import { QualificationForm } from '@/components/qualification';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import LogoCarousel from '@/components/landing/LogoCarousel';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import { Shield, Clock, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="relative pb-20 px-4">
        {/* Evervault-style hero gradient */}
        <div className="absolute inset-x-0 top-0 h-[500px] overflow-hidden pointer-events-none">
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(180deg, hsl(262 83% 58% / 0.12) 0%, hsl(262 83% 58% / 0.04) 50%, transparent 100%)',
            }}
          />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-primary/8 rounded-full blur-[120px]" />
        </div>

        <div className="relative pt-28 container max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10 space-y-4">
            <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-white/[0.04] backdrop-blur-sm border border-white/[0.08] text-xs font-bold uppercase tracking-widest">
              <span className="text-gradient-primary">Audit Offert</span>
            </span>
            <h1 className="text-4xl md:text-5xl font-bold">
              Parlons de votre <span className="text-gradient-primary">projet</span>
            </h1>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto">
              Répondez à quelques questions pour que nous puissions vous proposer
              l'accompagnement le plus adapté à vos besoins.
            </p>
          </div>

          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground font-medium">Sans engagement</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground font-medium">Réponse sous 24h</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground font-medium">+50 audits réalisés</span>
            </div>
          </div>
          
          {/* Main Content: Form + Testimonials Sidebar */}
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            {/* Form */}
            <div className="flex-1 lg:max-w-3xl">
              <QualificationForm />
            </div>

            {/* Testimonials Sidebar - Desktop only */}
            <aside className="hidden lg:block w-80 shrink-0">
              <div className="sticky top-28">
                <TestimonialsSection variant="sidebar" />
              </div>
            </aside>
          </div>

          {/* Testimonials - Mobile only */}
          <div className="lg:hidden mt-12">
            <TestimonialsSection variant="full" />
          </div>

          {/* Social Proof Section */}
          <div className="mt-16 pt-12 border-t border-border/50">
            <p className="text-center text-sm text-muted-foreground mb-6">
              Ils nous font confiance
            </p>
            <LogoCarousel />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
