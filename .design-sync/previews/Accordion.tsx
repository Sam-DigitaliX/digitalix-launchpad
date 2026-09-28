import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@digitalix/ui';
import { Surface } from '../preview-kit/Surface';

const faqs = [
  {
    question: "Qu'est-ce que le tracking server-side et pourquoi est-ce crucial aujourd'hui ?",
    answer:
      'Les données sont envoyées depuis votre serveur plutôt que depuis le navigateur. Elles ne sont plus bloquées par les adblockers ni par les restrictions Safari (ITP) : vous récupérez en moyenne 15 à 30 % de données en plus.',
  },
  {
    question: 'Est-ce compatible avec mon CMS ?',
    answer:
      "Oui, avec Shopify, WooCommerce, PrestaShop et Magento. La configuration s'adapte à votre stack sans refonte.",
  },
  {
    question: 'Combien de temps prend la mise en place ?',
    answer: 'Deux à quatre semaines selon la complexité du plan de taggage et le nombre de plateformes publicitaires.',
  },
];

export const FAQ = () => (
  <Surface>
    <Accordion type="single" collapsible defaultValue="item-0" className="w-[640px] space-y-4">
      {faqs.map((faq, index) => (
        <AccordionItem
          key={index}
          value={`item-${index}`}
          className="rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-lg px-6 [&[data-state=open]]:border-primary/20"
        >
          <AccordionTrigger className="text-left text-foreground hover:no-underline hover:text-primary transition-colors py-6">
            <span className="pr-4 font-semibold">{faq.question}</span>
          </AccordionTrigger>
          <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">{faq.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  </Surface>
);

export const Plain = () => (
  <Surface>
    <Accordion type="multiple" defaultValue={['a']} className="w-[520px]">
      <AccordionItem value="a">
        <AccordionTrigger>Consent Mode v2</AccordionTrigger>
        <AccordionContent>Les 4 signaux sont transmis par la CMP avant le premier hit.</AccordionContent>
      </AccordionItem>
      <AccordionItem value="b">
        <AccordionTrigger>Server-side GTM</AccordionTrigger>
        <AccordionContent>Les hits GA4 transitent par votre sous-domaine first-party.</AccordionContent>
      </AccordionItem>
    </Accordion>
  </Surface>
);
