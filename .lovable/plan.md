

## Inversion des sections 3 et 4 sur la Home

Modification de `src/pages/Home.tsx` pour inverser l'ordre de la section **Value Props** (actuellement en position 3) et **TrackingDemoSection** (position 4).

### Nouvel enchaînement

1. Header
2. Hero generique
3. **TrackingDemoSection** (remonte)
4. **Value Props - 3 cards** (descend)
5. ReviewsCarouselSection
6. Pour qui ? - 2 cards audiences
7. ProcessSection
8. ClientLogosSection
9. FAQSection
10. CTASection
11. Footer

### Modification technique

Fichier : `src/pages/Home.tsx`

- Deplacer le bloc `TrackingDemoSection` avant la section "Pourquoi passer au Server-Side ?" (Value Props)
- Aucun autre changement

