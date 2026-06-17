import { useEffect } from 'react';

/**
 * Adds a <meta name="robots" content="noindex, nofollow"> tag while the
 * component is mounted, and removes it on unmount. Used on pages that must
 * stay out of search indexes (legal pages). The authoritative signal is the
 * X-Robots-Tag header set in vercel.json; this is defense-in-depth for crawlers
 * that render JS. Cleanup is required in an SPA so other routes aren't tagged.
 */
export function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta');
    meta.name = 'robots';
    meta.content = 'noindex, nofollow';
    document.head.appendChild(meta);

    return () => {
      document.head.removeChild(meta);
    };
  }, []);
}
