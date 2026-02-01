import { QualificationForm } from '@/components/qualification';
import Header from '@/components/landing/Header';
import Footer from '@/components/landing/Footer';

export default function Contact() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-32 pb-20 px-4">
        <div className="container max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wide">
              Qualification
            </span>
            <h1 className="text-4xl md:text-5xl font-bold">
              Parlons de votre <span className="text-gradient-primary">projet</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Répondez à quelques questions pour que nous puissions vous proposer 
              l'accompagnement le plus adapté à vos besoins.
            </p>
          </div>
          
          <QualificationForm />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
