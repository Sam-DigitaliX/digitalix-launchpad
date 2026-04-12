import * as cheerio from 'cheerio';
import type { ScanContext, ParsedCookie } from './types.js';

const TIMEOUT_MS = 8000;
const MAX_BODY_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_REDIRECTS = 5;

const USER_AGENT =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36';

function extractDomain(url: string): string {
  return new URL(url).hostname.replace(/^www\./, '');
}

function parseCookie(header: string, pageDomain: string): ParsedCookie {
  const parts = header.split(';').map((p) => p.trim());
  const [nameValue, ...attrs] = parts;
  const eqIndex = nameValue.indexOf('=');
  const name = nameValue.substring(0, eqIndex).trim();
  const value = nameValue.substring(eqIndex + 1).trim();

  const cookie: ParsedCookie = { name, value, isThirdParty: false };

  for (const attr of attrs) {
    const lower = attr.toLowerCase();
    if (lower === 'secure') {
      cookie.secure = true;
    } else if (lower === 'httponly') {
      cookie.httpOnly = true;
    } else if (lower.startsWith('samesite=')) {
      cookie.sameSite = attr.split('=')[1]?.trim();
    } else if (lower.startsWith('domain=')) {
      cookie.domain = attr.split('=')[1]?.trim().replace(/^\./, '');
    } else if (lower.startsWith('path=')) {
      cookie.path = attr.split('=')[1]?.trim();
    } else if (lower.startsWith('max-age=')) {
      cookie.maxAge = parseInt(attr.split('=')[1]?.trim() ?? '0', 10);
    } else if (lower.startsWith('expires=')) {
      cookie.expires = attr.substring(attr.indexOf('=') + 1).trim();
    }
  }

  const cookieDomain = (cookie.domain ?? pageDomain).replace(/^www\./, '');
  cookie.isThirdParty = !pageDomain.endsWith(cookieDomain);

  return cookie;
}

export async function fetchPage(url: string): Promise<ScanContext> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const start = Date.now();
  let currentUrl = url;
  let response: Response | null = null;
  const allCookies: ParsedCookie[] = [];
  const domain = extractDomain(url);

  try {
    for (let i = 0; i < MAX_REDIRECTS; i++) {
      response = await fetch(currentUrl, {
        headers: {
          'User-Agent': USER_AGENT,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
          'Accept-Encoding': 'identity',
        },
        redirect: 'manual',
        signal: controller.signal,
      });

      // Collect cookies from this hop
      const setCookies = response.headers.getSetCookie?.() ?? [];
      for (const header of setCookies) {
        allCookies.push(parseCookie(header, domain));
      }

      // Follow redirect
      const location = response.headers.get('location');
      if (location && response.status >= 300 && response.status < 400) {
        currentUrl = new URL(location, currentUrl).href;
        continue;
      }

      break;
    }

    if (!response) {
      throw new Error('No response received');
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) {
      throw new Error(`Unexpected content type: ${contentType}`);
    }

    const buffer = await response.arrayBuffer();
    if (buffer.byteLength > MAX_BODY_SIZE) {
      throw new Error(`Response too large: ${buffer.byteLength} bytes`);
    }

    const html = new TextDecoder().decode(buffer);
    const fetchDurationMs = Date.now() - start;

    // Extract headers as flat record
    const headers: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      headers[key.toLowerCase()] = value;
    });

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

    return {
      url,
      finalUrl: currentUrl,
      domain,
      html,
      headers,
      cookies: allCookies,
      scripts,
      inlineScripts,
      fetchDurationMs,
      statusCode: response.status,
    };
  } finally {
    clearTimeout(timeout);
  }
}
