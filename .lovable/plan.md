

## Style "Full-Width Rounded Container" - Inspiration Evervault

### Concept

Appliquer le style de bloc large avec bords arrondis et fond en gradient violet/cyan sur 2 sections test, avant d'harmoniser sur le reste du site si le rendu plait.

### Sections cibles pour le test

1. **CTA Section** (`CTASection.tsx`) - C'est la section la plus naturelle pour ce traitement : un bloc visuellement distinct qui attire l'oeil avant le footer. Le gradient violet/cyan en fond avec les coins arrondis (rounded-3xl ou rounded-[2rem]) lui donnera un effet "carte geante" premium.

2. **Section "Ce qui est inclus"** sur la page ServiceDetail (`ServiceDetail.tsx`) - La section features avec fond `bg-card` sera transformee en bloc arrondi avec le gradient, ce qui casse la monotonie de la page detail.

### Implementation technique

**1. Nouveau composant utilitaire CSS** (`src/index.css`)
- Ajouter une classe `.rounded-section` qui encapsule le style : `rounded-3xl`, gradient de fond `from-primary/20 via-primary/10 to-secondary/10`, bordure subtile `border border-white/5`, et un padding interne genereux.

**2. Modification de `CTASection.tsx`**
- Wrapper le contenu dans un container qui a des marges laterales (`mx-4 sm:mx-6 lg:mx-8`) pour que le bloc arrondi ne touche pas les bords de la page.
- Appliquer le fond en gradient violet-to-cyan avec `rounded-3xl`.
- Conserver les orbes de lueur existantes a l'interieur du bloc arrondi.

**3. Modification de `ServiceDetail.tsx`**
- Transformer la section "Ce qui est inclus" : au lieu d'un fond `bg-card` pleine largeur, utiliser un bloc arrondi centre dans le container avec le gradient en fond.

### Rendu attendu

- Fond de page noir (`background`) visible autour des blocs arrondis
- Les blocs arrondis ont un degrade subtil violet/cyan en fond
- Bordure tres fine en `white/5` pour delimiter le conteneur
- Coins arrondis `rounded-3xl` (24px) pour un rendu large et moderne
- Transition douce entre le fond noir et le gradient du bloc

### Harmonisation future

Si le rendu est valide, on pourra etendre ce style a :
- La section "Pourquoi passer au Server-Side" sur la Home
- La section SolutionsSection sur la page Consultants
- La section IntegrationSection
