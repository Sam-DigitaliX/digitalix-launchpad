export interface CaseStudyResult {
  metric: string;
  before: string;
  after: string;
}

export interface CaseStudy {
  slug: string;
  client: string;
  sector: string;
  logo: string; // initials used as placeholder
  shortDescription: string;
  challenge: string;
  solution: string;
  results: CaseStudyResult[];
  testimonial: {
    quote: string;
    author: string;
    role: string;
  };
  stack: string[];
  duration: string;
}

export const caseStudies: CaseStudy[] = [
  {
    slug: "e-commerce-mode-server-side",
    client: "Maison Élara",
    sector: "E-commerce Mode",
    logo: "MÉ",
    shortDescription:
      "Migration complète vers le server-side tracking et intégration CAPI Meta/Google pour un e-commerce mode perdant 40 % de ses conversions.",
    challenge:
      "Maison Élara perdait près de 40 % de ses conversions Meta et Google Ads à cause des adblockers et des restrictions ITP de Safari. Le ROAS affiché dans les plateformes ne correspondait plus à la réalité, rendant impossible l'optimisation des campagnes. L'équipe acquisition dépensait 80 k€/mois sans visibilité fiable sur la performance.",
    solution:
      "Nous avons déployé une infrastructure server-side complète sur Addingwell avec un custom loader pour contourner les restrictions navigateur. L'intégration CAPI Meta et Google Ads Enhanced Conversions a été mise en place avec déduplication des événements. Un Consent Mode v2 avancé a été configuré via Didomi pour maintenir la conformité RGPD tout en maximisant le volume de données collectées.",
    results: [
      { metric: "Conversions trackées", before: "60 %", after: "97 %" },
      { metric: "Match Rate Meta", before: "32 %", after: "89 %" },
      { metric: "ROAS Meta Ads", before: "2.1x", after: "3.8x" },
      { metric: "Coût par acquisition", before: "42 €", after: "28 €" },
    ],
    testimonial: {
      quote:
        "On a récupéré une visibilité complète sur nos campagnes. Le ROAS réel était bien meilleur que ce qu'on voyait avant — on a pu réallouer du budget sur les audiences qui performaient vraiment.",
      author: "Sophie Martin",
      role: "Head of Acquisition, Maison Élara",
    },
    stack: ["sGTM", "Addingwell", "Meta CAPI", "Google Ads Enhanced Conversions", "Didomi", "GA4"],
    duration: "3 semaines",
  },
  {
    slug: "saas-b2b-tracking-pipeline",
    client: "DataFlow",
    sector: "SaaS B2B",
    logo: "DF",
    shortDescription:
      "Refonte du tracking pipeline pour un SaaS B2B : attribution multi-touch, intégration CRM et reporting BigQuery unifié.",
    challenge:
      "DataFlow générait ses leads via Google Ads et LinkedIn Ads mais n'avait aucune visibilité sur le parcours complet du lead — du clic publicitaire à la signature du contrat. Les équipes marketing et sales travaillaient en silos avec des données contradictoires. Le cycle de vente de 45 jours rendait l'attribution encore plus complexe.",
    solution:
      "Nous avons mis en place un tracking server-side complet avec remontée des événements offline (démo bookée, contrat signé) vers les plateformes via CAPI. Un pipeline BigQuery a été construit pour centraliser les données marketing et CRM, permettant une attribution multi-touch sur l'ensemble du funnel. Les Enhanced Conversions Google ont été configurées pour remonter les conversions offline.",
    results: [
      { metric: "Leads attribués", before: "45 %", after: "92 %" },
      { metric: "Coût par lead qualifié", before: "180 €", after: "95 €" },
      { metric: "Délai de reporting", before: "5 jours", after: "Temps réel" },
      { metric: "Taux de conversion lead→client", before: "8 %", after: "14 %" },
    ],
    testimonial: {
      quote:
        "Pour la première fois, on voit le parcours complet de nos leads. On sait exactement quelles campagnes génèrent des contrats signés, pas juste des clics.",
      author: "Thomas Dubois",
      role: "CMO, DataFlow",
    },
    stack: ["sGTM", "Stape.io", "Google Ads Enhanced Conversions", "LinkedIn CAPI", "BigQuery", "GA4", "Looker Studio"],
    duration: "5 semaines",
  },
  {
    slug: "agence-marketing-white-label",
    client: "Leroy Digital",
    sector: "Agence Marketing",
    logo: "LD",
    shortDescription:
      "Déploiement d'une offre tracking white-label pour une agence SEA gérant 25 comptes clients avec une infrastructure server-side mutualisée.",
    challenge:
      "Leroy Digital gérait 25 comptes clients en SEA mais perdait régulièrement des clients à cause de données de tracking incohérentes. Chaque client avait une configuration différente, certaines cassées depuis des mois sans que personne ne s'en aperçoive. L'agence n'avait pas les ressources techniques pour maintenir 25 setups de tracking en parallèle.",
    solution:
      "Nous avons déployé une infrastructure server-side mutualisée sur Addingwell avec un conteneur dédié par client. Un système de monitoring centralisé alerte l'agence en cas d'anomalie sur n'importe quel compte. L'offre a été packagée en white-label : Leroy Digital revend le service tracking à ses clients sous sa propre marque, avec un dashboard personnalisé.",
    results: [
      { metric: "Comptes monitorés", before: "0", after: "25" },
      { metric: "Incidents détectés proactivement", before: "0 %", after: "100 %" },
      { metric: "Revenu additionnel agence", before: "—", after: "+4 200 €/mois" },
      { metric: "Churn clients", before: "18 %/an", after: "6 %/an" },
    ],
    testimonial: {
      quote:
        "DigitaliX nous a permis de transformer un point de douleur en source de revenus. Nos clients sont bluffés par la qualité des données et on a divisé notre churn par trois.",
      author: "Marie Leroy",
      role: "Fondatrice, Leroy Digital",
    },
    stack: ["sGTM", "Addingwell", "Meta CAPI", "Google Ads Enhanced Conversions", "TikTok Events API", "GA4"],
    duration: "6 semaines",
  },
];
