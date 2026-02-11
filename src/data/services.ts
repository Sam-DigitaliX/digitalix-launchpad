import { Search, Server, Share2, ShieldCheck, Activity, GraduationCap } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Service {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  icon: LucideIcon;
  features: string[];
}

export const services: Service[] = [
  {
    slug: "audit-tracking",
    title: "Audit Tracking & Data Quality",
    shortDescription:
      "Diagnostic complet de votre infrastructure de collecte : tags, events, consent, fuites de données. Rapport actionnable sous 48h.",
    longDescription:
      "Nous passons au crible l'intégralité de votre infrastructure de collecte de données : conteneurs GTM, tags, events, paramètres de consentement, fuites de données vers des tiers non autorisés. Vous recevez un rapport détaillé et priorisé avec des recommandations concrètes pour corriger chaque anomalie.",
    icon: Search,
    features: [
      "Audit complet des conteneurs GTM (client & server)",
      "Vérification de la conformité Consent Mode v2",
      "Détection des fuites de données vers des tiers",
      "Analyse du Match Rate par plateforme",
      "Rapport priorisé avec plan d'action",
      "Livraison sous 48h",
    ],
  },
  {
    slug: "migration-server-side",
    title: "Migration Server-Side",
    shortDescription:
      "Passage de votre tracking client-side vers une architecture serveur (Addingwell / Stape). Zéro downtime, zéro perte de données.",
    longDescription:
      "Nous migrons votre tracking depuis le navigateur vers votre propre infrastructure serveur. Résultat : vos données contournent les adblockers, les restrictions iOS/Safari, et vous reprenez le contrôle total sur vos flux de collecte. Migration progressive, sans interruption de service.",
    icon: Server,
    features: [
      "Setup infrastructure cloud (Addingwell ou Stape)",
      "Migration progressive sans downtime",
      "Configuration DNS & custom loader",
      "Paramétrage des tags server-side",
      "Tests de non-régression complets",
      "Documentation technique livrée",
    ],
  },
  {
    slug: "integration-capi",
    title: "Intégration CAPI (Meta, Google, TikTok, LinkedIn)",
    shortDescription:
      "Connexion directe entre votre serveur et les plateformes publicitaires. Match Rate optimisé, conversions récupérées.",
    longDescription:
      "Les Conversions API (CAPI) permettent d'envoyer vos événements de conversion directement depuis votre serveur vers les plateformes publicitaires, sans dépendre du navigateur. Nous configurons et optimisons chaque intégration pour maximiser votre Match Rate et la qualité de vos signaux.",
    icon: Share2,
    features: [
      "Intégration CAPI Meta (Facebook)",
      "Intégration Google Ads Enhanced Conversions",
      "Intégration TikTok Events API",
      "Intégration LinkedIn CAPI",
      "Optimisation du Match Rate",
      "Déduplication des événements",
    ],
  },
  {
    slug: "conformite-rgpd",
    title: "Conformité RGPD & Consent Mode v2",
    shortDescription:
      "Mise en place CMP, Consent Mode v2, anonymisation. Votre tracking respecte la législation sans sacrifier la performance.",
    longDescription:
      "Nous mettons en conformité votre tracking avec le RGPD et les recommandations de la CNIL. Installation et configuration de votre CMP, implémentation du Consent Mode v2 de Google, anonymisation des données sensibles. Vous collectez en toute légalité sans sacrifier la qualité de vos données.",
    icon: ShieldCheck,
    features: [
      "Installation & configuration CMP",
      "Implémentation Consent Mode v2",
      "Anonymisation des données sensibles",
      "Audit de conformité CNIL",
      "Gestion granulaire du consentement",
      "Documentation juridique & technique",
    ],
  },
  {
    slug: "monitoring-maintenance",
    title: "Monitoring & Maintenance",
    shortDescription:
      "Surveillance 24/7 de vos flux de données. Alertes temps réel, rapports mensuels, garantie de continuité.",
    longDescription:
      "Votre tracking ne casse plus jamais en silence. Nous surveillons en continu vos flux de données, détectons les anomalies en temps réel et intervenons avant que vos campagnes ne soient impactées. Rapports mensuels de performance et garantie de uptime inclus.",
    icon: Activity,
    features: [
      "Monitoring 24/7 des flux de données",
      "Alertes temps réel sur anomalies",
      "Intervention proactive en cas de panne",
      "Rapports mensuels de performance",
      "Garantie de uptime",
      "Support prioritaire",
    ],
  },
  {
    slug: "formation",
    title: "Formation & Transfert de compétences",
    shortDescription:
      "Sessions de formation sur mesure pour vos équipes : GTM Server-Side, CAPI, debugging, bonnes pratiques.",
    longDescription:
      "Rendez vos équipes autonomes sur le server-side tracking. Nos formations couvrent GTM Server-Side, les Conversions API, le debugging avancé et les bonnes pratiques de collecte de données. Sessions adaptées à votre niveau et à vos outils.",
    icon: GraduationCap,
    features: [
      "Formation GTM Server-Side",
      "Formation Conversions API (CAPI)",
      "Debugging & troubleshooting avancé",
      "Bonnes pratiques de collecte",
      "Sessions adaptées à votre stack",
      "Support post-formation inclus",
    ],
  },
];
