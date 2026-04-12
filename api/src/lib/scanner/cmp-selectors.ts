export interface CmpDefinition {
  name: string;
  /** Selector to detect the CMP banner presence */
  bannerSelector: string;
  /** Selector for the "Accept all" button */
  acceptSelector: string;
  /** Selector for the "Reject all" button */
  rejectSelector: string;
}

export const CMP_DEFINITIONS: CmpDefinition[] = [
  {
    name: 'Didomi',
    bannerSelector: '#didomi-host, #didomi-notice',
    acceptSelector: '#didomi-notice-agree-button, [data-testid="notice-agree-button"]',
    rejectSelector: '#didomi-notice-disagree-button, [data-testid="notice-disagree-button"], .didomi-notice-banner .didomi-components-button:last-child',
  },
  {
    name: 'Cookiebot',
    bannerSelector: '#CybotCookiebotDialog',
    acceptSelector: '#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll, #CybotCookiebotDialogBodyButtonAccept',
    rejectSelector: '#CybotCookiebotDialogBodyButtonDecline, #CybotCookiebotDialogBodyLevelButtonLevelOptinDeclineAll',
  },
  {
    name: 'Axeptio',
    bannerSelector: '.axeptio_widget, #axeptio_widget',
    acceptSelector: '.axeptio_btn_acceptAll, [data-accept-all]',
    rejectSelector: '.axeptio_btn_dismiss, .axeptio_btn_rejectAll, [data-reject-all]',
  },
  {
    name: 'OneTrust',
    bannerSelector: '#onetrust-banner-sdk',
    acceptSelector: '#onetrust-accept-btn-handler',
    rejectSelector: '#onetrust-reject-all-handler, .ot-pc-refuse-all-handler',
  },
  {
    name: 'TarteAuCitron',
    bannerSelector: '#tarteaucitronRoot, #tarteaucitron',
    acceptSelector: '#tarteaucitronPersonalize2, .tarteaucitronAllow',
    rejectSelector: '#tarteaucitronAllDenied2, .tarteaucitronDeny',
  },
  {
    name: 'Quantcast',
    bannerSelector: '.qc-cmp2-container, #qcCmpUi',
    acceptSelector: '.qc-cmp2-summary-buttons button[mode="primary"], [data-tracking-opt-in-accept]',
    rejectSelector: '.qc-cmp2-summary-buttons button[mode="secondary"], [data-tracking-opt-in-decline]',
  },
  {
    name: 'Usercentrics',
    bannerSelector: '#usercentrics-root',
    acceptSelector: '[data-testid="uc-accept-all-button"]',
    rejectSelector: '[data-testid="uc-deny-all-button"]',
  },
  {
    name: 'Commanders Act',
    bannerSelector: '#tc-privacy-wrapper, .tc-privacy-wrapper',
    acceptSelector: '#tc-privacy-button-2, .tc-submit-consent',
    rejectSelector: '#tc-privacy-button-3, .tc-refuse-consent',
  },
  {
    name: 'Sirdata',
    bannerSelector: '#sd-cmp, .sd-cmp-container',
    acceptSelector: '.sd-cmp-JHbJb, [data-testid="sd-accept-all"]',
    rejectSelector: '.sd-cmp-Wbwvu, [data-testid="sd-refuse-all"]',
  },
  {
    name: 'Iubenda',
    bannerSelector: '#iubenda-cs-banner',
    acceptSelector: '.iubenda-cs-accept-btn',
    rejectSelector: '.iubenda-cs-reject-btn',
  },
  {
    name: 'CookieYes',
    bannerSelector: '.cky-consent-container, #cookie-law-info-bar',
    acceptSelector: '.cky-btn-accept, #cookie_action_close_header',
    rejectSelector: '.cky-btn-reject, #cookie_action_close_header_reject',
  },
  {
    name: 'Complianz',
    bannerSelector: '.cmplz-cookiebanner, #cmplz-cookiebanner-container',
    acceptSelector: '.cmplz-accept, .cmplz-btn.cmplz-accept',
    rejectSelector: '.cmplz-deny, .cmplz-btn.cmplz-deny',
  },
  {
    name: 'Consentmanager',
    bannerSelector: '#cmpbox, #cmpbox2',
    acceptSelector: '.cmpboxbtnyes, #cmpbntnotxt',
    rejectSelector: '.cmpboxbtno, #cmpbntnottxt',
  },
  {
    name: 'CookieFirst',
    bannerSelector: '.cookiefirst-root, #cookiefirst-root',
    acceptSelector: '[data-cookiefirst-action="accept"]',
    rejectSelector: '[data-cookiefirst-action="reject"]',
  },
  {
    name: 'Klaro',
    bannerSelector: '.klaro .cookie-notice, .klaro .cookie-modal',
    acceptSelector: '.klaro .cm-btn-accept-all, .klaro .cm-btn-success',
    rejectSelector: '.klaro .cm-btn-decline, .klaro .cm-btn-danger',
  },
];

/* ──────────────────── Fallback selectors ──────────────────── */

export const ARIA_ACCEPT_SELECTORS = [
  'button[aria-label*="accept" i]',
  'button[aria-label*="accepter" i]',
  'button[aria-label*="agree" i]',
  'button[aria-label*="consent" i]',
  'button[aria-label*="allow" i]',
  'button[aria-label*="autoriser" i]',
];

export const ARIA_REJECT_SELECTORS = [
  'button[aria-label*="reject" i]',
  'button[aria-label*="refuser" i]',
  'button[aria-label*="decline" i]',
  'button[aria-label*="deny" i]',
  'button[aria-label*="disagree" i]',
];

export const TEXT_ACCEPT_PATTERNS = [
  'Tout accepter',
  'Accepter tout',
  'Accepter',
  'Accept all',
  'Accept',
  'Agree',
  'I agree',
  'OK',
  'Alle akzeptieren',
  'Akzeptieren',
  'Aceptar todo',
  'Aceptar',
  'Accetta tutti',
  'Accetta',
  'Aceitar tudo',
];

export const TEXT_REJECT_PATTERNS = [
  'Tout refuser',
  'Refuser tout',
  'Refuser',
  'Continuer sans accepter',
  'Reject all',
  'Reject',
  'Decline',
  'Deny',
  'Alle ablehnen',
  'Ablehnen',
  'Rechazar todo',
  'Rechazar',
  'Rifiuta tutti',
  'Rifiuta',
  'Rejeitar tudo',
];
