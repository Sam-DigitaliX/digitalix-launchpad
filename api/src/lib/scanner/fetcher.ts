import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as cheerio from 'cheerio';
import {
  CMP_DEFINITIONS,
  ARIA_ACCEPT_SELECTORS,
  ARIA_REJECT_SELECTORS,
  TEXT_ACCEPT_PATTERNS,
  TEXT_REJECT_PATTERNS,
} from './cmp-selectors.js';
import type {
  ScanContext,
  ScanSession,
  SessionPhase,
  ParsedCookie,
  NetworkRequest,
  ConsentState,
  DetectedCmp,
  OnProgress,
} from './types.js';

const PAGE_TIMEOUT_MS = 15000;
const CMP_WAIT_MS = 10000;
const POST_CONSENT_WAIT_MS = 4000;
const NETWORK_IDLE_TIMEOUT_MS = 3000;

function extractDomain(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '');
}

function cookieIsThirdParty(cookieDomain: string, pageDomain: string): boolean {
  const clean = cookieDomain.replace(/^\./, '').replace(/^www\./, '');
  return !pageDomain.endsWith(clean) && !clean.endsWith(pageDomain);
}

/* ──────────────────── Cookie conversion ──────────────────── */

function toBrowserCookie(c: { name: string; value: string; domain: string; path: string; secure: boolean; httpOnly: boolean; sameSite: string; expires: number }, pageDomain: string): ParsedCookie {
  return {
    name: c.name,
    value: c.value,
    domain: c.domain,
    path: c.path,
    secure: c.secure,
    httpOnly: c.httpOnly,
    sameSite: c.sameSite,
    expires: c.expires > 0 ? new Date(c.expires * 1000).toISOString() : undefined,
    isThirdParty: cookieIsThirdParty(c.domain, pageDomain),
  };
}

/* ──────────────────── CMP detection ──────────────────── */

async function detectCmp(page: Page, startTime: number): Promise<{ cmp: DetectedCmp | null; matchedIndex: number }> {
  // Try known CMP selectors
  for (let i = 0; i < CMP_DEFINITIONS.length; i++) {
    const def = CMP_DEFINITIONS[i];
    try {
      const banner = await page.$(def.bannerSelector);
      if (banner && await banner.isVisible()) {
        const acceptBtn = await page.$(def.acceptSelector);
        const rejectBtn = await page.$(def.rejectSelector);
        return {
          cmp: {
            name: def.name,
            appearanceDelayMs: Date.now() - startTime,
            acceptButtonFound: acceptBtn !== null,
            rejectButtonFound: rejectBtn !== null,
          },
          matchedIndex: i,
        };
      }
    } catch {
      // selector invalid or element not found
    }
  }

  // Fallback: detect any visible dialog/overlay containing consent keywords
  try {
    const genericCmp = await page.evaluate(() => {
      const keywords = ['cookie', 'consent', 'consentement', 'accepter', 'acceptez', 'privacy', 'confidentialit', 'données personnelles', 'vie privée'];
      // Check dialogs
      const dialogs = document.querySelectorAll('dialog[open], [role="dialog"], [aria-modal="true"]');
      for (const dialog of dialogs) {
        const text = dialog.textContent?.toLowerCase() ?? '';
        if (keywords.some((kw) => text.includes(kw))) {
          return { found: true, tag: dialog.tagName, id: dialog.id, className: dialog.className };
        }
      }
      // Check fixed/sticky overlays
      const allElements = document.querySelectorAll('div, section, aside');
      for (const el of allElements) {
        const style = window.getComputedStyle(el);
        if (style.position !== 'fixed' && style.position !== 'sticky') continue;
        const rect = el.getBoundingClientRect();
        if (rect.width < 200 || rect.height < 100) continue;
        const text = el.textContent?.toLowerCase() ?? '';
        if (keywords.some((kw) => text.includes(kw))) {
          return { found: true, tag: el.tagName, id: el.id, className: el.className };
        }
      }
      return { found: false };
    });

    if (genericCmp.found) {
      return {
        cmp: {
          name: `CMP custom (${genericCmp.tag}${genericCmp.id ? '#' + genericCmp.id : ''})`,
          appearanceDelayMs: Date.now() - startTime,
          acceptButtonFound: true, // we'll try text fallback
          rejectButtonFound: true,
        },
        matchedIndex: -1, // will use ARIA/text fallback for clicking
      };
    }
  } catch {
    // evaluate failed
  }

  return { cmp: null, matchedIndex: -1 };
}

async function clickCmpButton(page: Page, type: 'accept' | 'reject', matchedIndex: number): Promise<boolean> {
  // 1. Known CMP selector
  if (matchedIndex >= 0) {
    const def = CMP_DEFINITIONS[matchedIndex];
    const selector = type === 'accept' ? def.acceptSelector : def.rejectSelector;
    try {
      const btn = await page.$(selector);
      if (btn && await btn.isVisible()) {
        await btn.click();
        return true;
      }
    } catch {
      // fall through to ARIA
    }
  }

  // 2. ARIA fallback
  const ariaSelectors = type === 'accept' ? ARIA_ACCEPT_SELECTORS : ARIA_REJECT_SELECTORS;
  for (const sel of ariaSelectors) {
    try {
      const btn = await page.$(sel);
      if (btn && await btn.isVisible()) {
        await btn.click();
        return true;
      }
    } catch {
      // continue
    }
  }

  // 3. Text fallback (multi-language)
  const textPatterns = type === 'accept' ? TEXT_ACCEPT_PATTERNS : TEXT_REJECT_PATTERNS;
  for (const text of textPatterns) {
    try {
      const btn = page.getByRole('button', { name: text, exact: false });
      if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
        await btn.click();
        return true;
      }
    } catch {
      // continue
    }
  }

  return false;
}

/* ──────────────────── Consent Mode extraction ──────────────────── */

function extractConsentState(requests: NetworkRequest[], dataLayerPushes: Record<string, unknown>[]): ConsentState {
  const gcsValues: string[] = [];
  const gcdValues: string[] = [];

  for (const req of requests) {
    if (req.url.includes('/g/collect') || req.url.includes('/j/collect')) {
      try {
        const params = new URL(req.url).searchParams;
        const gcs = params.get('gcs');
        const gcd = params.get('gcd');
        if (gcs) gcsValues.push(gcs);
        if (gcd) gcdValues.push(gcd);
      } catch {
        // malformed URL
      }
    }
  }

  // Check dataLayer for consent default/update
  const defaultParameters: Record<string, string> = {};
  const updatedParameters: Record<string, string> = {};
  let hasConsentMode = false;

  for (const push of dataLayerPushes) {
    if (push[0] === 'consent' && push[1] === 'default' && typeof push[2] === 'object') {
      hasConsentMode = true;
      Object.assign(defaultParameters, push[2] as Record<string, string>);
    }
    if (push[0] === 'consent' && push[1] === 'update' && typeof push[2] === 'object') {
      hasConsentMode = true;
      Object.assign(updatedParameters, push[2] as Record<string, string>);
    }
  }

  // Also check gcs values for consent mode presence
  if (gcsValues.length > 0) hasConsentMode = true;

  return { hasConsentMode, defaultParameters, updatedParameters, gcsValues, gcdValues };
}

/* ──────────────────── Session runner ──────────────────── */

async function runSession(
  browser: Browser,
  url: string,
  pageDomain: string,
  phase: SessionPhase,
  matchedCmpIndex: number,
  onProgress: OnProgress,
  sessionNum: number,
): Promise<ScanSession> {
  const context: BrowserContext = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    locale: 'fr-FR',
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  // Capture network requests
  const networkRequests: NetworkRequest[] = [];
  const scriptsLoaded: string[] = [];

  page.on('request', (req) => {
    networkRequests.push({
      url: req.url(),
      method: req.method(),
      resourceType: req.resourceType(),
      status: 0,
      initiator: req.frame()?.url() ?? '',
      timestamp: Date.now(),
    });
  });

  page.on('response', (res) => {
    const reqUrl = res.url();
    const entry = networkRequests.find((r) => r.url === reqUrl && r.status === 0);
    if (entry) entry.status = res.status();
    if (res.request().resourceType() === 'script') {
      scriptsLoaded.push(reqUrl);
    }
  });

  try {
    // Navigate
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT_MS });
    onProgress({ type: 'step_done', session: sessionNum, totalSessions: 3, label: 'Page chargee' });

    // Wait a bit for CMP to appear
    await page.waitForTimeout(2000);

    if (phase === 'pre-consent') {
      // Just wait and observe — no interaction
      await page.waitForTimeout(POST_CONSENT_WAIT_MS);
      onProgress({ type: 'step_done', session: sessionNum, totalSessions: 3, label: 'Requetes et cookies captures' });
    } else {
      // Wait for CMP and click
      const action = phase === 'post-accept' ? 'accept' : 'reject';
      const actionLabel = phase === 'post-accept' ? 'Consentement accepte' : 'Consentement refuse';

      const clicked = await clickCmpButton(page, action, matchedCmpIndex);
      if (clicked) {
        onProgress({ type: 'step_done', session: sessionNum, totalSessions: 3, label: actionLabel });
      } else {
        onProgress({ type: 'step_done', session: sessionNum, totalSessions: 3, label: `Bouton ${action} non trouve` });
      }

      // Wait for tags to fire after consent action
      await page.waitForTimeout(POST_CONSENT_WAIT_MS);
      try {
        await page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_TIMEOUT_MS });
      } catch {
        // timeout is fine — some sites never reach network idle
      }
      onProgress({ type: 'step_done', session: sessionNum, totalSessions: 3, label: 'Tags et requetes analysees' });
    }

    // Capture cookies
    const rawCookies = await context.cookies();
    const cookies = rawCookies.map((c) => toBrowserCookie(c, pageDomain));

    // Capture dataLayer
    const dataLayerPushes = await page.evaluate(() => {
      const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
      if (!Array.isArray(dl)) return [];
      return dl.map((entry) => {
        try {
          return JSON.parse(JSON.stringify(entry));
        } catch {
          return {};
        }
      });
    }) as Record<string, unknown>[];

    // Extract consent state
    const consentState = extractConsentState(networkRequests, dataLayerPushes);

    // Count issues for progress
    const trackingRequests = networkRequests.filter((r) =>
      r.resourceType === 'script' || r.url.includes('/collect') || r.url.includes('fbevents') || r.url.includes('analytics')
    );
    if (phase === 'pre-consent') {
      const preConsentIssues = cookies.filter((c) => !c.httpOnly && (c.name.startsWith('_ga') || c.name.startsWith('_fb') || c.name.startsWith('_gcl'))).length;
      onProgress({ type: 'issues_count', session: sessionNum, totalSessions: 3, label: `${preConsentIssues} cookie(s) analytics avant consentement`, issuesCount: preConsentIssues });
    } else if (phase === 'post-reject') {
      const postRejectIssues = cookies.filter((c) => !c.httpOnly && (c.name.startsWith('_ga') || c.name.startsWith('_fb') || c.name.startsWith('_gcl'))).length;
      onProgress({ type: 'issues_count', session: sessionNum, totalSessions: 3, label: `${postRejectIssues} cookie(s) analytics apres refus`, issuesCount: postRejectIssues });
    } else {
      onProgress({ type: 'issues_count', session: sessionNum, totalSessions: 3, label: `${trackingRequests.length} requetes tracking detectees`, issuesCount: trackingRequests.length });
    }

    return { phase, cookies, networkRequests, consentState, dataLayerPushes, scriptsLoaded };
  } finally {
    await context.close();
  }
}

/* ──────────────────── Main fetcher ──────────────────── */

const noopProgress: OnProgress = () => {};

export async function fetchPage(url: string, onProgress: OnProgress = noopProgress): Promise<ScanContext> {
  const domain = extractDomain(url);
  const start = Date.now();

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  try {
    // ── Session 1: Pre-consent ──
    onProgress({ type: 'session_start', session: 1, totalSessions: 3, label: 'Analyse pre-consentement' });

    // Quick pre-scan to detect CMP
    const detectContext = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      locale: 'fr-FR',
      viewport: { width: 1440, height: 900 },
    });
    const detectPage = await detectContext.newPage();
    let finalUrl = url;

    const pageLoadStart = Date.now();
    await detectPage.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT_MS });
    const pageLoadMs = Date.now() - pageLoadStart;
    finalUrl = detectPage.url();

    // Wait for CMP
    await detectPage.waitForTimeout(CMP_WAIT_MS);
    const { cmp, matchedIndex } = await detectCmp(detectPage, start);

    if (cmp) {
      onProgress({ type: 'step_done', session: 1, totalSessions: 3, label: `CMP detectee : ${cmp.name}` });
    } else {
      onProgress({ type: 'step_done', session: 1, totalSessions: 3, label: 'Aucune CMP detectee' });
    }

    // Capture HTML from detect page
    const html = await detectPage.content();
    const statusCode = 200; // we got past goto

    // Extract headers (limited in Playwright — use response from goto)
    const headers: Record<string, string> = {};

    // Parse scripts from HTML
    const $ = cheerio.load(html);
    const scripts: string[] = [];
    const inlineScripts: string[] = [];
    $('script').each((_, el) => {
      const src = $(el).attr('src');
      if (src) {
        scripts.push(src);
      } else {
        const content = $(el).html();
        if (content && content.trim().length > 0) {
          inlineScripts.push(content);
        }
      }
    });

    // Detect e-commerce platform
    const ecommercePlatform = detectEcommerce($, html, scripts);

    await detectContext.close();

    // Run session 1 (pre-consent)
    const session1 = await runSession(browser, url, domain, 'pre-consent', matchedIndex, onProgress, 1);
    onProgress({ type: 'session_complete', session: 1, totalSessions: 3, label: 'Pre-consentement termine' });

    const sessions: ScanSession[] = [session1];
    const degradedMode = cmp === null;

    if (!degradedMode) {
      // ── Session 2: Post-accept ──
      onProgress({ type: 'session_start', session: 2, totalSessions: 3, label: 'Acceptation des cookies' });
      const session2 = await runSession(browser, url, domain, 'post-accept', matchedIndex, onProgress, 2);
      onProgress({ type: 'session_complete', session: 2, totalSessions: 3, label: 'Post-acceptation termine' });
      sessions.push(session2);

      // ── Session 3: Post-reject ──
      onProgress({ type: 'session_start', session: 3, totalSessions: 3, label: 'Refus des cookies' });
      const session3 = await runSession(browser, url, domain, 'post-reject', matchedIndex, onProgress, 3);
      onProgress({ type: 'session_complete', session: 3, totalSessions: 3, label: 'Post-refus termine' });
      sessions.push(session3);
    } else {
      onProgress({ type: 'step_done', session: 1, totalSessions: 1, label: 'Mode degrade — pas de CMP detectee, sessions consent ignorees' });
    }

    // Use actual page load time, not total scan duration
    const fetchDurationMs = pageLoadMs;

    // Merge cookies from all sessions for backward compatibility
    const allCookies = sessions.flatMap((s) => s.cookies);
    const uniqueCookies = Array.from(
      new Map(allCookies.map((c) => [`${c.name}:${c.domain}`, c])).values()
    );

    return {
      url,
      finalUrl,
      domain,
      html,
      headers,
      cookies: uniqueCookies,
      scripts,
      inlineScripts,
      fetchDurationMs,
      statusCode,
      cmp,
      sessions,
      degradedMode,
      ecommercePlatform,
    };
  } finally {
    await browser.close();
  }
}

/* ──────────────────── E-commerce detection ──────────────────── */

function detectEcommerce($: cheerio.CheerioAPI, html: string, scripts: string[]): string | null {
  // Shopify
  if (html.includes('Shopify.shop') || html.includes('cdn.shopify.com') || scripts.some((s) => s.includes('cdn.shopify.com'))) {
    return 'Shopify';
  }
  // WooCommerce
  if (html.includes('woocommerce') || html.includes('wc-add-to-cart') || $('body').hasClass('woocommerce')) {
    return 'WooCommerce';
  }
  // Magento
  if (html.includes('Magento') || html.includes('mage/cookies') || scripts.some((s) => s.includes('mage/'))) {
    return 'Magento';
  }
  // PrestaShop
  if (html.includes('prestashop') || html.includes('PrestaShop') || $('meta[name="generator"]').attr('content')?.includes('PrestaShop')) {
    return 'PrestaShop';
  }
  // Salesforce Commerce Cloud
  if (html.includes('demandware') || scripts.some((s) => s.includes('demandware'))) {
    return 'Salesforce Commerce Cloud';
  }
  // BigCommerce
  if (html.includes('BigCommerce') || scripts.some((s) => s.includes('bigcommerce.com'))) {
    return 'BigCommerce';
  }
  // Generic cart detection
  const metaGenerator = $('meta[name="generator"]').attr('content') ?? '';
  if (metaGenerator) {
    const lower = metaGenerator.toLowerCase();
    if (lower.includes('shopify')) return 'Shopify';
    if (lower.includes('woocommerce') || lower.includes('wordpress')) {
      if (html.includes('woocommerce')) return 'WooCommerce';
    }
    if (lower.includes('magento')) return 'Magento';
    if (lower.includes('prestashop')) return 'PrestaShop';
  }

  return null;
}
