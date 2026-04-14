import type { CheckModule, ScanContext } from '../types.js';

export const pageLoadCheck: CheckModule = {
  id: 'page-load',
  category: 'performance',
  name: 'Temps de Réponse Serveur',
  impact: 'high',
  gated: false,
  run(ctx: ScanContext) {
    const ms = ctx.fetchDurationMs;
    const seconds = (ms / 1000).toFixed(1);

    if (ms < 1500) {
      return {
        status: 'pass',
        description: `Temps de réponse serveur : ${seconds}s — rapide.`,
        rawData: { durationMs: ms },
      };
    }

    if (ms < 3000) {
      return {
        status: 'warning',
        description: `Temps de réponse serveur : ${seconds}s — améliorable. Un temps supérieur à 1.5s impacte l'expérience utilisateur.`,
        businessNote: 'Le temps de chargement est améliorable. Chaque seconde gagnée améliore le taux de conversion de 7%.',
        rawData: { durationMs: ms },
      };
    }

    return {
      status: 'fail',
      description: `Temps de réponse serveur : ${seconds}s — lent. Impact négatif sur le taux de conversion et le SEO.`,
      businessNote: 'Un temps de chargement supérieur à 3 secondes fait fuir 53% des visiteurs mobiles (source: Google).',
      rawData: { durationMs: ms },
    };
  },
};
