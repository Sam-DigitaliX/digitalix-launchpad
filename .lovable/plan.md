

## Page Services - Prestations DigitaliX

### Concept

Creer une page `/services` listant les prestations sous forme de cards visuelles avec image, et une page dediee par service accessible via `/services/:slug`.

### Services proposes

| # | Titre | Slug | Description courte |
|---|-------|------|--------------------|
| 1 | Audit Tracking & Data Quality | `audit-tracking` | Diagnostic complet de votre infrastructure de collecte : tags, events, consent, fuites de donnees. Rapport actionnable sous 48h. |
| 2 | Migration Server-Side | `migration-server-side` | Passage de votre tracking client-side vers une architecture serveur (Addingwell / Stape). Zero downtime, zero perte de donnees. |
| 3 | Integration CAPI (Meta, Google, TikTok, LinkedIn) | `integration-capi` | Connexion directe entre votre serveur et les plateformes publicitaires. Match Rate optimise, conversions recuperees. |
| 4 | Conformite RGPD & Consent Mode v2 | `conformite-rgpd` | Mise en place CMP, Consent Mode v2, anonymisation. Votre tracking respecte la legislation sans sacrifier la performance. |
| 5 | Monitoring & Maintenance | `monitoring-maintenance` | Surveillance 24/7 de vos flux de donnees. Alertes temps reel, rapports mensuels, garantie de continuite. |
| 6 | Formation & Transfert de competences | `formation` | Sessions de formation sur mesure pour vos equipes : GTM Server-Side, CAPI, debugging, bonnes pratiques. |

### Architecture technique

**Fichiers a creer :**

- `src/pages/Services.tsx` - Page listing avec grille de cards
- `src/pages/ServiceDetail.tsx` - Page template pour le detail d'un service (route dynamique)
- `src/data/services.ts` - Donnees centralisees (titre, slug, description, image, features, etc.)

**Fichiers a modifier :**

- `src/App.tsx` - Ajouter les routes `/services` et `/services/:slug`
- `src/components/landing/Header.tsx` - Ajouter le lien "Services" dans la navigation

### Design des cards (page listing)

Chaque card reprend le style `glass-card` existant et contient :
- Une image en haut (ratio 16/9, placeholder en attendant les vraies images)
- Le titre du service
- Une description courte (2-3 lignes)
- Un bouton "Decouvrir" (`heroGradientOutline`) qui redirige vers `/services/:slug`

### Page detail (`/services/:slug`)

Structure de chaque page service :
- Header + Hero avec titre et description longue
- Section "Ce qui est inclus" (liste de features avec check icons, comme SolutionsSection)
- CTA "Reserver mon Audit" vers `/contact`
- Footer

### Navigation

Ajout de "Services" dans les `navLinks` du Header (lien route, pas ancre) pour la Home et les autres pages non-consultants.
