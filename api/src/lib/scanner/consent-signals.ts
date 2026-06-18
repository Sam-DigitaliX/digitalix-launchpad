/**
 * Décodage pédagogique du paramètre Google Consent Status (gcs).
 * Format : "G1" + chiffre ad_storage + chiffre analytics_storage (1 = granted, 0 = denied).
 * Ex : G100 = pub+analytics refusés (ping anonymisé), G111 = tout accordé.
 * Le gcd (Consent Default) reste affiché brut — c'est un encodage interne Google,
 * non documenté, qu'on n'interprète pas pour rester honnête.
 */
export interface DecodedGcs {
  gcs: string;
  adStorage: boolean;
  analyticsStorage: boolean;
  label: string;
}

export function decodeGcs(gcs: string): DecodedGcs | null {
  if (!/^G1\d{2}$/.test(gcs)) return null;
  const adStorage = gcs[2] === '1';
  const analyticsStorage = gcs[3] === '1';
  const label =
    !adStorage && !analyticsStorage
      ? 'pub + analytics refusés (ping anonymisé / cookieless)'
      : adStorage && analyticsStorage
        ? 'pub + analytics accordés'
        : adStorage
          ? 'pub accordée, analytics refusé'
          : 'analytics accordé, pub refusée';
  return { gcs, adStorage, analyticsStorage, label };
}

/** Décode une liste de gcs en gardant l'unicité + le décodage lisible. */
export function decodeGcsList(values: string[]): DecodedGcs[] {
  const seen = new Set<string>();
  const out: DecodedGcs[] = [];
  for (const v of values) {
    if (seen.has(v)) continue;
    const d = decodeGcs(v);
    if (d) {
      seen.add(v);
      out.push(d);
    }
  }
  return out;
}
