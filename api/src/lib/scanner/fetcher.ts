import { chromium, type Browser, type BrowserContext, type Page } from 'playwright';
import * as cheerio from 'cheerio';
import {
  CMP_DEFINITIONS,
  CMP_SCRIPT_PATTERNS,
  TCF_CMP_IDS,
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
  RedirectHop,
  OnProgress,
} from './types.js';

const PAGE_TIMEOUT_MS = 15000;
const CMP_WAIT_MS = 10000;
const POST_CONSENT_WAIT_MS = 6000;
const NETWORK_IDLE_TIMEOUT_MS = 5000;

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

// Scan the whole page for a reject button via ARIA/text patterns. Returns the label found, or null.
async function findRejectLabelFallback(page: Page): Promise<string | null> {
  // ARIA labels
  for (const sel of ARIA_REJECT_SELECTORS) {
    try {
      const btn = await page.$(sel);
      if (btn && await btn.isVisible()) {
        const ariaLabel = await btn.getAttribute('aria-label');
        return ariaLabel ?? (await btn.textContent())?.trim() ?? sel;
      }
    } catch { /* continue */ }
  }
  // Text patterns
  for (const text of TEXT_REJECT_PATTERNS) {
    try {
      const btn = page.getByRole('button', { name: text, exact: false });
      if (await btn.isVisible({ timeout: 300 }).catch(() => false)) {
        return text;
      }
    } catch { /* continue */ }
  }
  return null;
}

function isContinueWithoutPattern(label: string | null): boolean {
  if (!label) return false;
  const lower = label.toLowerCase();
  return lower.includes('continuer sans') || lower.includes('continue without');
}

// IAB TCF API — definitive CMP identification (bypasses DOM / proxified URL obstacles)
async function queryTcfCmp(page: Page): Promise<{ cmpId: number; cmpVersion?: number; name: string } | null> {
  try {
    const tcData = await page.evaluate(() =>
      new Promise<{ cmpId?: number; cmpVersion?: number } | null>((resolve) => {
        const w = window as unknown as { __tcfapi?: (cmd: string, v: number, cb: (data: unknown, ok: boolean) => void) => void };
        if (typeof w.__tcfapi !== 'function') { resolve(null); return; }
        const timeout = setTimeout(() => resolve(null), 2000);
        try {
          w.__tcfapi('getTCData', 2, (data: unknown, ok: boolean) => {
            clearTimeout(timeout);
            if (!ok || !data || typeof data !== 'object') { resolve(null); return; }
            const d = data as { cmpId?: number; cmpVersion?: number };
            resolve({ cmpId: d.cmpId, cmpVersion: d.cmpVersion });
          });
        } catch {
          clearTimeout(timeout);
          resolve(null);
        }
      })
    );
    if (!tcData || typeof tcData.cmpId !== 'number') return null;
    const name = TCF_CMP_IDS[tcData.cmpId] ?? `CMP TCF #${tcData.cmpId}`;
    return { cmpId: tcData.cmpId, cmpVersion: tcData.cmpVersion, name };
  } catch {
    return null;
  }
}

async function detectCmp(page: Page, startTime: number): Promise<{ cmp: DetectedCmp | null; matchedIndex: number }> {
  // Try known CMP selectors
  for (let i = 0; i < CMP_DEFINITIONS.length; i++) {
    const def = CMP_DEFINITIONS[i];
    try {
      const banner = await page.$(def.bannerSelector);
      if (banner && await banner.isVisible()) {
        const acceptBtn = await page.$(def.acceptSelector);
        const rejectBtn = await page.$(def.rejectSelector);

        let rejectButtonFound = rejectBtn !== null;
        let rejectButtonLabel: string | null = null;

        if (rejectBtn) {
          rejectButtonLabel = (await rejectBtn.getAttribute('aria-label'))
            ?? (await rejectBtn.textContent())?.trim()
            ?? null;
        } else {
          // Specific selector missed — try ARIA / text fallback before declaring missing
          const fallbackLabel = await findRejectLabelFallback(page);
          if (fallbackLabel) {
            rejectButtonFound = true;
            rejectButtonLabel = fallbackLabel;
          }
        }

        return {
          cmp: {
            name: def.name,
            appearanceDelayMs: Date.now() - startTime,
            acceptButtonFound: acceptBtn !== null,
            rejectButtonFound,
            rejectButtonLabel,
            rejectIsContinueWithout: isContinueWithoutPattern(rejectButtonLabel),
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
      const rejectLabel = await findRejectLabelFallback(page);

      // Priority 1: TCF API — definitive identification via IAB CMP ID
      // (works even on server-side setups where script URLs are proxified)
      const tcf = await queryTcfCmp(page);

      // Priority 2: script URL signatures (the CMP's own CDN domain)
      let vendorFromScripts: string | null = null;
      if (!tcf) {
        const scriptUrls = await page.evaluate(() =>
          Array.from(document.scripts).map((s) => s.src).filter(Boolean).join(' ')
        ).catch(() => '');
        const lower = scriptUrls.toLowerCase();
        const matched = CMP_SCRIPT_PATTERNS.find((sig) =>
          sig.patterns.some((p) => lower.includes(p.toLowerCase()))
        );
        if (matched) vendorFromScripts = matched.name;
      }

      const name = tcf?.name
        ?? vendorFromScripts
        ?? `CMP custom (${genericCmp.tag}${genericCmp.id ? '#' + genericCmp.id : ''})`;

      return {
        cmp: {
          name,
          appearanceDelayMs: Date.now() - startTime,
          acceptButtonFound: true, // we'll try text fallback
          rejectButtonFound: rejectLabel !== null,
          rejectButtonLabel: rejectLabel,
          rejectIsContinueWithout: isContinueWithoutPattern(rejectLabel),
        },
        matchedIndex: -1, // will use ARIA/text fallback for clicking
      };
    }
  } catch {
    // evaluate failed
  }

  return { cmp: null, matchedIndex: -1 };
}

// Poll detectCmp every POLL_INTERVAL_MS up to maxWaitMs, return on first detection
async function pollDetectCmp(
  page: Page,
  startTime: number,
  maxWaitMs: number,
): Promise<{ cmp: DetectedCmp | null; matchedIndex: number }> {
  const POLL_INTERVAL_MS = 200;
  const deadline = startTime + maxWaitMs;

  while (Date.now() < deadline) {
    const result = await detectCmp(page, startTime);
    if (result.cmp) return result;
    await page.waitForTimeout(POLL_INTERVAL_MS);
  }

  // Last attempt at the deadline
  return detectCmp(page, startTime);
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

  // gcs/gcd params are discriminant on their own — accept them on any URL
  // (sGTM proxied setups can route GA4 traffic to custom endpoints)
  for (const req of requests) {
    try {
      const params = new URL(req.url).searchParams;
      const gcs = params.get('gcs');
      const gcd = params.get('gcd');
      // gcs format is G1xx (G100, G101, G111) — filter against random query strings
      if (gcs && /^G1\d{2}$/.test(gcs)) gcsValues.push(gcs);
      if (gcd && gcd.length >= 4) gcdValues.push(gcd);
    } catch {
      // malformed URL
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

    // Trigger lazy-loaded scripts (WP Rocket, etc.)
    // WP Rocket listens for: keydown, mousedown, mousemove, touchmove, touchstart, touchend, wheel
    await page.evaluate(() => {
      const events = ['mousemove', 'touchstart', 'touchend', 'wheel', 'keydown'];
      for (const evt of events) {
        window.dispatchEvent(new Event(evt, { bubbles: true }));
      }
      window.scrollBy(0, 300);
    });
    try {
      await page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_TIMEOUT_MS });
    } catch {
      // Some sites never reach networkidle
    }
    onProgress({ type: 'step_done', session: sessionNum, totalSessions: 3, label: 'Page chargée' });

    // Wait for CMP to appear (needs time for lazy-loaders + CMP script load + render)
    await page.waitForTimeout(5000);

    if (phase === 'pre-consent') {
      // Just wait and observe — no interaction
      await page.waitForTimeout(POST_CONSENT_WAIT_MS);
      try {
        await page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_TIMEOUT_MS });
      } catch {
        // timeout is fine
      }
      onProgress({ type: 'step_done', session: sessionNum, totalSessions: 3, label: 'Requêtes et cookies capturés' });
    } else {
      // Wait for CMP and click
      const action = phase === 'post-accept' ? 'accept' : 'reject';
      const actionLabel = phase === 'post-accept' ? 'Consentement accepté' : 'Consentement refusé';

      const clicked = await clickCmpButton(page, action, matchedCmpIndex);
      if (clicked) {
        onProgress({ type: 'step_done', session: sessionNum, totalSessions: 3, label: actionLabel });
      } else {
        onProgress({ type: 'step_done', session: sessionNum, totalSessions: 3, label: `Bouton ${action} non trouvé` });
      }

      // Wait for tags to fire after consent action
      await page.waitForTimeout(POST_CONSENT_WAIT_MS);
      try {
        await page.waitForLoadState('networkidle', { timeout: NETWORK_IDLE_TIMEOUT_MS });
      } catch {
        // timeout is fine — some sites never reach network idle
      }
      onProgress({ type: 'step_done', session: sessionNum, totalSessions: 3, label: 'Tags et requêtes analysées' });
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
      onProgress({ type: 'issues_count', session: sessionNum, totalSessions: 3, label: `${postRejectIssues} cookie(s) analytics après refus`, issuesCount: postRejectIssues });
    } else {
      onProgress({ type: 'issues_count', session: sessionNum, totalSessions: 3, label: `${trackingRequests.length} requêtes tracking détectées`, issuesCount: trackingRequests.length });
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
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
  });

  try {
    // ── Session 1: Pre-consent ──
    onProgress({ type: 'session_start', session: 1, totalSessions: 3, label: 'Analyse pré-consentement' });

    // Quick pre-scan to detect CMP
    const detectContext = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      locale: 'fr-FR',
      viewport: { width: 1440, height: 900 },
    });
    const detectPage = await detectContext.newPage();
    let finalUrl = url;

    const pageLoadStart = Date.now();
    const mainResponse = await detectPage.goto(url, { waitUntil: 'domcontentloaded', timeout: PAGE_TIMEOUT_MS });
    const pageLoadMs = Date.now() - pageLoadStart;
    finalUrl = detectPage.url();

    // Reconstruct the HTTP redirect chain by walking backwards from the final response
    const redirectChain: RedirectHop[] = [];
    if (mainResponse) {
      redirectChain.push({
        url: mainResponse.url(),
        statusCode: mainResponse.status(),
        method: mainResponse.request().method(),
      });
      let cursor = mainResponse.request().redirectedFrom();
      while (cursor) {
        const prevResponse = await cursor.response().catch(() => null);
        redirectChain.unshift({
          url: cursor.url(),
          statusCode: prevResponse?.status() ?? 0,
          method: cursor.method(),
        });
        cursor = cursor.redirectedFrom();
      }
    }

    // Trigger lazy-loaded scripts (WP Rocket, etc.) before waiting for CMP
    await detectPage.evaluate(() => {
      const events = ['mousemove', 'touchstart', 'touchend', 'wheel', 'keydown'];
      for (const evt of events) {
        window.dispatchEvent(new Event(evt, { bubbles: true }));
      }
      window.scrollBy(0, 300);
    });

    // Poll for CMP (lazy-loaded scripts need time to load GTM → GTM loads CMP)
    // Returns on first detection — appearanceDelayMs reflects real CMP appearance, not the poll timeout
    const { cmp, matchedIndex } = await pollDetectCmp(detectPage, pageLoadStart, CMP_WAIT_MS);

    if (cmp) {
      onProgress({ type: 'step_done', session: 1, totalSessions: 3, label: `CMP détectée : ${cmp.name}` });
    } else {
      onProgress({ type: 'step_done', session: 1, totalSessions: 3, label: 'Aucune CMP détectée' });
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
    onProgress({ type: 'session_complete', session: 1, totalSessions: 3, label: 'Pré-consentement terminé' });

    const sessions: ScanSession[] = [session1];
    const degradedMode = cmp === null;

    if (!degradedMode) {
      // ── Session 2: Post-accept ──
      onProgress({ type: 'session_start', session: 2, totalSessions: 3, label: 'Acceptation des cookies' });
      const session2 = await runSession(browser, url, domain, 'post-accept', matchedIndex, onProgress, 2);
      onProgress({ type: 'session_complete', session: 2, totalSessions: 3, label: 'Post-acceptation terminé' });
      sessions.push(session2);

      // ── Session 3: Post-reject ──
      onProgress({ type: 'session_start', session: 3, totalSessions: 3, label: 'Refus des cookies' });
      const session3 = await runSession(browser, url, domain, 'post-reject', matchedIndex, onProgress, 3);
      onProgress({ type: 'session_complete', session: 3, totalSessions: 3, label: 'Post-refus terminé' });
      sessions.push(session3);
    } else {
      onProgress({ type: 'step_done', session: 1, totalSessions: 1, label: 'Mode dégradé — pas de CMP détectée, sessions consent ignorées' });
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
      redirectChain,
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
