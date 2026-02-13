import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Qu'est-ce que le tracking server-side et pourquoi est-ce crucial aujourd'hui ?",
    answer: "Le tracking server-side est une méthode de collecte de données où les informations sont envoyées depuis votre serveur plutôt que depuis le navigateur de l'utilisateur. Contrairement au tracking classique (client-side), il n'est pas bloqué par les adblockers, les restrictions iOS/Safari (ITP) ou les paramètres de confidentialité du navigateur. Le bénéfice : vous récupérez en moyenne 15 à 30% de données en plus, ce qui améliore directement la performance et l'apprentissage de vos algorithmes publicitaires."
  },
  {
    question: "Quels sont les avantages concrets pour mon ROI publicitaire ?",
    answer: "Les avantages sont multiples : récupération des conversions perdues, amélioration du Quality Score Google Ads, meilleure attribution Meta (CAPI), et réduction du CPA grâce à des données plus fiables. De plus, votre site devient plus rapide car moins de scripts s'exécutent côté navigateur, ce qui favorise le taux de conversion et booste votre SEO (Core Web Vitals)."
  },
  {
    question: "L'agence DigitaliX intervient-elle uniquement à Nancy ?",
    answer: "Bien que nos bureaux soient basés à Ludres (54), à proximité immédiate de Nancy, nous accompagnons des entreprises dans toute la France ainsi qu'au Luxembourg. Nous sommes l'expert de proximité pour la région Grand Est, avec des interventions régulières à Metz, Strasbourg, Épinal et Reims. Pour nos clients nationaux et luxembourgeois, nous travaillons à distance avec une réactivité totale et une maîtrise des enjeux data transfrontaliers."
  },
  {
    question: "Qu'est-ce que la Conversion API (CAPI) de Meta et est-ce inclus dans vos services ?",
    answer: "La CAPI de Meta est une connexion server-to-server indispensable pour optimiser vos campagnes Facebook & Instagram Ads. Elle complète le Pixel en récupérant les événements perdus à cause des cookies tiers. Chez DigitaliX, l'implémentation de la CAPI (ainsi que les Enhanced Conversions de Google) fait partie intégrante de nos déploiements standards via GTM Server-Side."
  },
  {
    question: "Le tracking server-side est-il compatible avec le RGPD et le Consent Mode v2 ?",
    answer: "Oui, c'est même la méthode recommandée pour une conformité durable. Le server-side vous donne un contrôle total sur les données envoyées aux tiers (anonymisation d'IP, suppression de données sensibles avant envoi, etc.). DigitaliX configure votre setup pour respecter strictement le Consent Mode v2, garantissant que seules les données consenties sont transmises aux régies publicitaires."
  },
  {
    question: "Combien coûte et combien de temps prend la mise en place ?",
    answer: "Une migration standard prend généralement entre 1 et 3 semaines. Le coût dépend de la complexité de votre écosystème (nombre de plateformes, volume de trafic). L'hébergement du serveur GTM coûte environ 30€ à 150€/mois selon le trafic. Nous proposons un audit offert de 15 minutes pour évaluer vos besoins et vous fournir un devis précis."
  },
  {
    question: "Est-ce compatible avec mon CMS (Shopify, WordPress, PrestaShop...) ?",
    answer: "Absolument. Le tracking server-side est compatible avec tous les CMS majeurs (Shopify, WooCommerce, PrestaShop, Magento) et les architectures sur-mesure. Nous intervenons sur votre couche de données (Data Layer) pour assurer une remontée de données fiable sans nécessiter de refonte de votre site web."
  },
  {
    question: "Pourquoi faire appel à un expert DigitaliX plutôt que de le faire soi-même ?",
    answer: "Le tracking server-side demande des compétences croisées en infrastructure Cloud (Google Cloud Run), Data Layer, API et conformité. Une erreur de configuration peut entraîner des données dupliquées, des pertes de conversions ou des failles de conformité. Faire appel à DigitaliX, c'est garantir un setup propre, testé et optimisé par un spécialiste du Grand Est et du Luxembourg."
  },
];

const FAQSection = () => {
  return (
    <section id="faq" className="relative py-24 md:py-32 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Questions Fréquentes
            </h2>
            <p className="text-lg text-foreground/70">
              Expertise Tracking & Web Analytics – DigitaliX
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
