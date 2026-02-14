import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Pushes a `virtual_page_view` event to the GTM dataLayer on every
 * SPA route change, following Google's GA4 recommendations for SPAs.
 *
 * Must be rendered once inside <BrowserRouter>.
 *
 * @see https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications
 */
export function useDataLayerPageView() {
  const location = useLocation();
  const previousUrl = useRef(document.referrer);

  useEffect(() => {
    // Small delay so React has time to update <title> after navigation
    const raf = requestAnimationFrame(() => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'virtual_page_view',
        page_location: window.location.href,
        page_title: document.title,
        page_referrer: previousUrl.current,
      });

      // Store current URL as the referrer for next navigation
      previousUrl.current = window.location.href;
    });

    return () => cancelAnimationFrame(raf);
  }, [location]);
}
