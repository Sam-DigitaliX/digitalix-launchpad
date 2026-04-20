import type { CheckModule } from '../types.js';
import { gtmCheck } from './gtm.js';
import { ga4Check } from './ga4.js';
import { metaPixelCheck } from './meta-pixel.js';
import { datalayerCheck } from './datalayer.js';
import { enhancedConvCheck } from './enhanced-conv.js';
import { tiktokPixelCheck } from './tiktok-pixel.js';
import { linkedinCheck } from './linkedin.js';
import { ecommerceCheck } from './ecommerce.js';
import { tagFiringOrderCheck } from './tag-firing-order.js';
import { sgtmCheck } from './sgtm.js';
import { cookiesCheck } from './cookies.js';
import { capiMetaCheck } from './capi-meta.js';
import { capiGoogleCheck } from './capi-google.js';
import { cmpCheck } from './cmp.js';
import { consentModeCheck } from './consent-mode.js';
import { thirdPartyCookiesCheck } from './third-party-cookies.js';
import { privacyPageCheck } from './privacy-page.js';
import { preConsentViolationsCheck } from './pre-consent-violations.js';
import { postRejectViolationsCheck } from './post-reject-violations.js';
import { pageLoadCheck } from './page-load.js';
import { scriptsCheck } from './scripts.js';
import { scriptLoadingCheck } from './script-loading.js';
import { redirectChainCheck } from './redirect-chain.js';
export { fetchPageSpeedMetrics, checkLcp, checkCls, checkTbt } from './pagespeed.js';

export const allChecks: CheckModule[] = [
  // Tracking Setup
  gtmCheck,
  ga4Check,
  metaPixelCheck,
  datalayerCheck,
  enhancedConvCheck,
  tiktokPixelCheck,
  linkedinCheck,
  ecommerceCheck,
  tagFiringOrderCheck,
  // Server-Side
  sgtmCheck,
  cookiesCheck,
  capiMetaCheck,
  capiGoogleCheck,
  // Privacy & Consent
  cmpCheck,
  consentModeCheck,
  preConsentViolationsCheck,
  postRejectViolationsCheck,
  thirdPartyCookiesCheck,
  privacyPageCheck,
  // Performance
  pageLoadCheck,
  scriptsCheck,
  scriptLoadingCheck,
  redirectChainCheck,
];
