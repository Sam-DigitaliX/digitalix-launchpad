/**
 * Partenaires DigitaliX qui peuvent embarquer l'audit tracking sous leur
 * propre URL co-brandée. Ajouter une entrée ici suffit pour activer une
 * nouvelle page `/partenaires/<slug>` — le backend tag automatiquement
 * les leads avec `partenaire-<slug>` à l'unlock.
 */
export interface Partner {
  /** Identifiant URL (lowercase, kebab-case, alphanum + dash uniquement) */
  slug: string;
  /** Nom à afficher sur la page */
  name: string;
  /** Logo du partenaire (chemin relatif dans /public, ex. /partners/xxx.svg) */
  logoUrl?: string;
  /** Badge bref sous le titre (ex. "Consultant SEA Senior") */
  badge?: string;
  /** Override du subtitle de la page d'accueil audit */
  intro?: string;
}

export const PARTNERS: Record<string, Partner> = {
  // Exemple — à dupliquer pour chaque vrai partenariat
  'demo-partner': {
    slug: 'demo-partner',
    name: 'Demo Partner',
    badge: 'Partenaire démonstration',
    intro: 'En partenariat avec Demo Partner, auditez votre tracking en 2-3 minutes.',
  },
};

export function getPartner(slug: string | undefined): Partner | null {
  if (!slug) return null;
  return PARTNERS[slug] ?? null;
}
