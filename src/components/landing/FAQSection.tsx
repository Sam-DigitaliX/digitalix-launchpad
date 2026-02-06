import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Quelle est la différence entre le tracking Client-Side et Server-Side ?",
    answer: "Le tracking Client-Side envoie les données directement du navigateur de l'utilisateur vers les plateformes (Facebook, Google). Le Server-Side, lui, envoie les données à un serveur intermédiaire que vous contrôlez avant de les distribuer. Cela permet de filtrer, d'anonymiser et de protéger la qualité de vos données."
  },
  {
    question: "Quel est le ROI du tracking Server-Side pour mon business ?",
    answer: "Le ROI se mesure sur trois piliers : la récupération de 15% à 30% de données perdues à cause des AdBlockers, une meilleure performance web (moins de scripts = site plus rapide, meilleur SEO et taux de conversion), et une précision publicitaire accrue qui réduit votre coût par acquisition (CPA)."
  },
  {
    question: "Le tracking Server-Side est-il obligatoire pour le RGPD ?",
    answer: "Il n'est pas \"obligatoire\" mais fortement recommandé. Il vous donne un contrôle total sur les données envoyées aux tiers (IP, emails hachés), ce qui facilite grandement la mise en conformité et la protection de la vie privée de vos utilisateurs."
  },
  {
    question: "Combien de temps prend l'implémentation ?",
    answer: "Une implémentation standard prend entre 2 et 4 semaines selon la complexité de votre écosystème (nombre de plateformes publicitaires, CRM, etc.). Nous commençons par un audit de 48h pour cartographier vos besoins exacts."
  },
  {
    question: "Et si j'ai déjà un tracking en place ?",
    answer: "Parfait ! Nous réalisons une migration progressive. Votre tracking actuel reste actif pendant que nous déployons l'infrastructure Server-Side. Une fois validée, nous basculons sans interruption de données."
  },
  {
    question: "Comment contourner les AdBlockers avec le Server-Side ?",
    answer: "Le Server-Side utilise votre propre domaine (ex: data.votresite.com) au lieu des domaines tiers bloqués. Les requêtes passent par votre serveur, les rendant invisibles aux bloqueurs de publicité. Résultat : vous récupérez jusqu'à 30% de données perdues."
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-lg text-muted-foreground">
              Tout ce que vous devez savoir sur le tracking Server-Side
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="glass-card border-border/50 px-6 rounded-xl"
              >
                <AccordionTrigger className="text-left text-foreground hover:no-underline hover:text-primary transition-colors py-6">
                  <span className="pr-4 font-semibold">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
