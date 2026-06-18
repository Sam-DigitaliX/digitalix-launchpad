/**
 * Route → document title resolver.
 *
 * The SPA had no per-route title management, so every virtual_page_view reported
 * the same static index.html title to GA4. This maps each route to a meaningful
 * title (also used for the browser tab). Dynamic routes humanize their slug as a
 * best-effort fallback — a page can still set a more precise title itself.
 */
const SUFFIX = ' | DigitaliX';

const STATIC_TITLES: Record<string, string> = {
  '/': 'DigitaliX | Expert Tracking Server-Side & GTM à Nancy et Luxembourg',
  '/consultants': 'Qualification' + SUFFIX,
  '/contact': 'Contact' + SUFFIX,
  '/services': 'Services' + SUFFIX,
  '/audit-tracking': 'Audit Tracking' + SUFFIX,
  '/brand': 'Brand' + SUFFIX,
  '/a-propos': 'À propos' + SUFFIX,
  '/cas-clients': 'Cas clients' + SUFFIX,
  '/admin': 'Admin' + SUFFIX,
  '/mentions-legales': 'Mentions légales' + SUFFIX,
  '/politique-de-confidentialite': 'Politique de confidentialité' + SUFFIX,
};

function humanize(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export function resolvePageTitle(pathname: string): string {
  const path =
    pathname.length > 1 && pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;

  if (STATIC_TITLES[path]) return STATIC_TITLES[path];

  const seg = path.split('/').filter(Boolean);
  if (seg[0] === 'services' && seg[1]) return `${humanize(seg[1])}${SUFFIX}`;
  if (seg[0] === 'cas-clients' && seg[1]) return `${humanize(seg[1])}${SUFFIX}`;
  if (seg[0] === 'partenaires' && seg[1]) return `Partenaire ${humanize(seg[1])}${SUFFIX}`;
  if (seg[0] === 'audit-tracking' && seg[1] === 'resultats') {
    return `Résultats de l'audit${SUFFIX}`;
  }

  return `Page introuvable${SUFFIX}`;
}
