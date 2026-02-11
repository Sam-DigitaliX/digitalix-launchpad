

## Plan : Restructuration du site avec Home generique

### Structure des routes

| Route | Contenu | Statut |
|-------|---------|--------|
| `/` | Nouvelle page d'accueil generique | A creer |
| `/consultants` | Landing actuelle (deplacee depuis `/`) | Renommer |
| `/ecommerce` | Landing e-commerce (future) | Plus tard |
| `/contact` | Formulaire de qualification (inchange) | Existant |
| `/brand` | Guide de style (inchange) | Existant |

### Etape 1 : Deplacer la landing actuelle vers `/consultants`

- Renommer `src/pages/Index.tsx` en `src/pages/Consultants.tsx`
- Mettre a jour la route dans `App.tsx` : `<Route path="/consultants" element={<Consultants />} />`

### Etape 2 : Creer la nouvelle Home generique (`/`)

- Creer `src/pages/Home.tsx`
- Contenu simplifie et universel :
  - Header (reutilise, avec navigation mise a jour)
  - Hero generique : message clair sur le tracking server-side sans jargon SEA
  - Section proposition de valeur en 3-4 points
  - Section "Pour qui ?" avec cards orientant vers les audiences (Consultants, E-commerce/Annonceurs) avec CTAs vers les landing dediees
  - Logos clients (reutilise)
  - CTA final vers `/contact`
  - Footer (reutilise)

### Etape 3 : Mettre a jour la navigation (Header)

- Ajouter un lien "Consultants" dans le menu principal pointant vers `/consultants`
- Adapter les liens d'ancrage (`#services`, `#process`, `#integration`) pour qu'ils fonctionnent uniquement sur la page `/consultants` ou les retirer du menu principal
- Le menu de la Home pourrait etre : **Consultants | E-commerce (bientot) | Contact**
- Le CTA "Reserver mon Audit a 0€" reste inchange

### Etape 4 : Mettre a jour `App.tsx`

```
<Route path="/" element={<Home />} />
<Route path="/consultants" element={<Consultants />} />
<Route path="/contact" element={<Contact />} />
<Route path="/brand" element={<Brand />} />
```

### Points techniques

- Le Header devra detecter la page courante pour adapter ses liens (ancres sur `/consultants`, routes sur `/`)
- Les composants de sections existants (Hero, FAQ, CTA, etc.) restent inchanges dans la page `/consultants`
- La nouvelle Home reutilise les composants partages (Header, Footer, ClientLogosSection, CTASection)
- Le `ScrollToTop` et la config `vercel.json` fonctionnent deja pour les nouvelles routes

