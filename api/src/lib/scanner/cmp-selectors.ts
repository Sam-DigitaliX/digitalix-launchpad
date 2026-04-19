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
    // Hashed classes (.sd-cmp-JHbJb) change on redeploy — rely on stable IDs and the ARIA/text fallback in detectCmp
    bannerSelector: '#sd-cmp, .sd-cmp-container, [id^="sd-cmp"]',
    acceptSelector: '[data-testid="sd-accept-all"], [data-info="accept-all"]',
    rejectSelector: '[data-testid="sd-refuse-all"], [data-info="refuse-all"]',
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
  /* ─── Level 2 additions (Google-certified partner CMPs) ─── */
  {
    name: 'Sourcepoint',
    bannerSelector: '.message-container, [data-sp-message-id], .sp_message_container',
    acceptSelector: 'button.sp_choice_type_11, [title="Accept all" i], [aria-label*="Accept all" i]',
    rejectSelector: 'button.sp_choice_type_13, [title="Reject all" i], [aria-label*="Reject all" i]',
  },
  {
    name: 'TrustArc',
    bannerSelector: '#truste-consent-track, #truste-consent-content, .truste_box_overlay',
    acceptSelector: '#truste-consent-button, .truste-consent-button, .call',
    rejectSelector: '#truste-consent-required, .required',
  },
  {
    name: 'Termly',
    bannerSelector: '#termly-code-snippet-support, .termly-embed-banner, [data-termly]',
    acceptSelector: '[data-termly-action="accept-all"], [data-role="accept-all"]',
    rejectSelector: '[data-termly-action="decline-all"], [data-role="decline-all"]',
  },
  {
    name: 'Osano',
    bannerSelector: '.osano-cm-window, .osano-cm-dialog',
    acceptSelector: '.osano-cm-accept-all, .osano-cm-button--type_acceptAll',
    rejectSelector: '.osano-cm-denyAll, .osano-cm-button--type_denyAll',
  },
  {
    name: 'Ketch',
    bannerSelector: '#lanyard_root, [id^="ketch-"], .ketch-banner',
    acceptSelector: '[data-testid="acceptButton"], .ketch-banner-action--accept',
    rejectSelector: '[data-testid="rejectButton"], .ketch-banner-action--reject',
  },
  {
    name: 'Tealium Consent Manager',
    bannerSelector: '#consent_prompt, .privacy_prompt, #privacy_prompt',
    acceptSelector: '#consent_prompt_submit, .privacy_prompt_submit_all',
    rejectSelector: '#consent_prompt_decline, .privacy_prompt_decline',
  },
  {
    name: 'Adobe Privacy & Consent',
    bannerSelector: '#feds-privacy, .feds-privacy-modal, [data-feds-privacy]',
    acceptSelector: '.feds-privacy-accept, [data-feds="privacy-accept"]',
    rejectSelector: '.feds-privacy-reject, [data-feds="privacy-reject"]',
  },
  {
    name: 'Piwik PRO Consent Manager',
    bannerSelector: '.ppms_cm_popup_overlay, .ppms_cm_popup',
    acceptSelector: '.ppms_cm_agree-to-all, [data-cm="accept-all"]',
    rejectSelector: '.ppms_cm_reject-all, [data-cm="reject-all"]',
  },
];

/**
 * Script URL signatures for CMP identification. Used as:
 * - Enrichment when generic "CMP custom" is detected in DOM (fetcher.ts)
 * - Fallback when no known CMP selector matched (cmp.ts)
 *
 * Covers Google's certified CMP partner list for Consent Mode v2 / TCF v2.2.
 */
export const CMP_SCRIPT_PATTERNS: { name: string; patterns: string[] }[] = [
  { name: 'Cookiebot', patterns: ['consent.cookiebot.com', 'consent.cookiebot.eu'] },
  { name: 'Didomi', patterns: ['sdk.privacy-center.org', 'didomi'] },
  { name: 'OneTrust', patterns: ['cdn.cookielaw.org', 'cookiepro.com', 'onetrust'] },
  { name: 'Axeptio', patterns: ['static.axept.io', 'axeptio'] },
  { name: 'Sirdata', patterns: ['sddan.com', 'sirdata'] },
  { name: 'TarteAuCitron', patterns: ['tarteaucitron'] },
  { name: 'Usercentrics', patterns: ['usercentrics', 'app.usercentrics.eu'] },
  { name: 'CookieYes', patterns: ['cookieyes', 'cdn-cookieyes.com'] },
  { name: 'Quantcast / InMobi Choice', patterns: ['quantcast', 'choice.mgr.consensu.org', 'choice.inmobi.com'] },
  { name: 'Commanders Act', patterns: ['cmp.commander1.com', 'commandersact'] },
  { name: 'Iubenda', patterns: ['iubenda.com'] },
  { name: 'Complianz', patterns: ['complianz'] },
  { name: 'Consentmanager', patterns: ['consentmanager.net', 'delivery.consentmanager.net'] },
  { name: 'CookieFirst', patterns: ['cookiefirst.com'] },
  { name: 'Klaro', patterns: ['klaro'] },
  { name: 'Sourcepoint', patterns: ['sourcepoint.com', 'cdn.privacy-mgmt.com', 'sp-prod.net'] },
  { name: 'TrustArc', patterns: ['trustarc.com', 'truste.com'] },
  { name: 'Termly', patterns: ['termly.io', 'app.termly.io'] },
  { name: 'Osano', patterns: ['osano.com'] },
  { name: 'Ketch', patterns: ['ketch.com', 'ketchjs.com'] },
  { name: 'Cassie', patterns: ['cassiecloud.com'] },
  { name: 'Clym', patterns: ['clym.io'] },
  { name: 'Tealium', patterns: ['tags.tiqcdn.com', 'tealium'] },
  { name: 'Adobe Privacy & Consent', patterns: ['adobeprivacy', 'privacy.adobe.com', 'feds.adobe.com'] },
  { name: 'Piwik PRO', patterns: ['piwik.pro', 'containers.piwik.pro'] },
  { name: 'Crownpeak / Evidon', patterns: ['evidon.com', 'betrad.com'] },
  { name: 'Securiti', patterns: ['securiti.ai'] },
  { name: 'Secureprivacy', patterns: ['secureprivacy.ai'] },
  { name: 'Illow', patterns: ['illow.io'] },
  { name: 'Legalmonster', patterns: ['legalmonster'] },
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
  'Accepter et fermer',
  'Accepter et continuer',
  'Accepter les cookies',
  'Accepter',
  "J'accepte",
  'Accept all',
  'Accept and close',
  'Accept cookies',
  'Accept',
  'Agree',
  'I agree',
  'Got it',
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
  'Refuser et fermer',
  'Refuser les cookies',
  'Refuser',
  'Continuer sans accepter',
  'Continuer sans consentir',
  'Reject all',
  'Reject',
  'Decline',
  'Decline all',
  'Deny',
  'Deny all',
  'Alle ablehnen',
  'Ablehnen',
  'Rechazar todo',
  'Rechazar',
  'Rifiuta tutti',
  'Rifiuta',
  'Rejeitar tudo',
];
