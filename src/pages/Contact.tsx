import { QualificationForm } from '@/components/qualification';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';
import LogoCarousel from '@/components/landing/LogoCarousel';
import { Shield, Clock, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-28 pb-20 px-4">
        <div className="container max-w-5xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-10 space-y-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide">
              Audit Gratuit
            </span>
            <h1 className="text-4xl md:text-5xl font-bold">
              Parlons de votre <span className="text-gradient-primary">projet</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
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
          
          {/* Qualification Form */}
          <QualificationForm />

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
