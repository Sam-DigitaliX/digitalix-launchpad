import { QualificationForm } from '@/components/qualification';
import Header from '@/components/landing/Header';
import EvervaultGlow from '@/components/landing/EvervaultGlow';
import Footer from '@/components/landing/Footer';
import LogoCarousel from '@/components/landing/LogoCarousel';
import TestimonialsSection from '@/components/landing/TestimonialsSection';
import { Shield, Clock, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <EvervaultGlow />
      <Header />

      <main className="relative z-[1]">
        {/* Hero — glass panel */}
        <div className="mx-3 md:mx-6">
          <section className="relative pt-32 pb-16 md:pt-44 md:pb-20 overflow-hidden rounded-b-[40px] bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] border-t-0">
            <div
              className="absolute inset-0 rounded-b-[40px]"
              style={{
                background: 'linear-gradient(180deg, hsl(262 83% 58% / 0.12) 0%, hsl(262 83% 58% / 0.05) 40%, transparent 70%)',
              }}
            />
            <div
              className="absolute inset-x-0 bottom-0 h-px"
              style={{
                background: 'linear-gradient(90deg, transparent, hsl(262 83% 58% / 0.3) 30%, hsl(188 94% 43% / 0.3) 70%, transparent)',
              }}
            />
            <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center space-y-4">
                <span className="glass-badge px-4 py-1.5">
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
              <div className="flex flex-wrap justify-center gap-4 md:gap-6 mt-8">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08]">
                  <Shield className="w-4 h-4 icon-gradient" />
                  <span className="text-sm text-foreground font-medium">Sans engagement</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08]">
                  <Clock className="w-4 h-4 icon-gradient" />
                  <span className="text-sm text-foreground font-medium">Réponse sous 24h</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08]">
                  <CheckCircle2 className="w-4 h-4 icon-gradient" />
                  <span className="text-sm text-foreground font-medium">+50 audits réalisés</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Form + Testimonials */}
        <div className="container max-w-6xl mx-auto px-4 py-16">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
            <div className="flex-1 lg:max-w-3xl">
              <QualificationForm />
            </div>
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
          <div className="mt-16 pt-12 border-t border-white/[0.08]">
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
