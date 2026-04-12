import type { CheckModule, ScanContext } from '../types.js';

export const pageLoadCheck: CheckModule = {
  id: 'page-load',
  category: 'performance',
  name: 'Temps de Reponse Serveur',
  impact: 'high',
  gated: false,
  run(ctx: ScanContext) {
    const ms = ctx.fetchDurationMs;
    const seconds = (ms / 1000).toFixed(1);

    if (ms < 1500) {
      return {
        status: 'pass',
        description: `Temps de reponse serveur : ${seconds}s — rapide.`,
        rawData: { durationMs: ms },
      };
    }

    if (ms < 3000) {
      return {
        status: 'warning',
        description: `Temps de reponse serveur : ${seconds}s — ameliorable. Un temps superieur a 1.5s impacte l'experience utilisateur.`,
        rawData: { durationMs: ms },
      };
    }

    return {
      status: 'fail',
      description: `Temps de reponse serveur : ${seconds}s — lent. Impact negatif sur le taux de conversion et le SEO.`,
      rawData: { durationMs: ms },
    };
  },
};
