import { useDataLayerPageView } from '@/hooks/useDataLayerPageView';

/** Invisible component — pushes virtual_page_view to dataLayer on each route change */
export function DataLayerPageView() {
  useDataLayerPageView();
  return null;
}
