import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { scrapeWithCheerio } from './cheerioScraper.js';

puppeteer.use(StealthPlugin());

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const CAPTCHA_PATTERNS = [
  'g-recaptcha',
  'h-captcha',
  'cf-turnstile',
  'iframe[src*="captcha"]',
  'iframe[src*="recaptcha"]',
  'iframe[src*="hcaptcha"]',
  'iframe[src*="turnstile"]',
  '#captcha',
  '.g-recaptcha',
  '.h-captcha',
  '[data-sitekey]',
];

let browserInstance = null;

function parseProxyServer(proxyUrl) {
  if (!proxyUrl?.trim()) return null;

  try {
    const url = new URL(proxyUrl.trim());
    const port = url.port || (url.protocol === 'https:' ? '443' : '80');
    return {
      proxyHost: `${url.protocol}//${url.hostname}:${port}`,
      username: decodeURIComponent(url.username || ''),
      password: decodeURIComponent(url.password || ''),
      hasAuth: Boolean(url.username && url.password),
    };
  } catch {
    return {
      proxyHost: proxyUrl.trim(),
      username: '',
      password: '',
      hasAuth: false,
    };
  }
}

function getLaunchArgs() {
  const args = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--disable-gpu',
    '--disable-blink-features=AutomationControlled',
  ];

  const proxy = parseProxyServer(process.env.PROXY_SERVER);
  if (proxy?.proxyHost) {
    args.push(`--proxy-server=${proxy.proxyHost}`);
    console.log('[Puppeteer] Proxy enabled:', proxy.proxyHost);
  }

  return { args, proxy };
}

async function getBrowser() {
  if (!browserInstance) {
    const { args } = getLaunchArgs();
    browserInstance = await puppeteer.launch({
      headless: 'new',
      args,
    });
  }
  return browserInstance;
}

async function configurePage(page) {
  const { proxy } = getLaunchArgs();

  await page.setUserAgent(DEFAULT_USER_AGENT);
  await page.setViewport({ width: 1280, height: 800 });

  if (proxy?.hasAuth) {
    await page.authenticate({
      username: proxy.username,
      password: proxy.password,
    });
  }

  await page.setExtraHTTPHeaders({
    'Accept-Language': 'en-US,en;q=0.9',
  });
}

function extractSiteKey(html) {
  const patterns = [
    /data-sitekey=["']([^"']+)["']/i,
    /sitekey["']\s*:\s*["']([^"']+)["']/i,
    /grecaptcha\.render\([^,]+,\s*\{\s*['"]?sitekey['"]?\s*:\s*['"]([^'"]+)['"]/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

function detectCaptchaType(html) {
  if (/g-recaptcha|google\.com\/recaptcha/i.test(html)) return 'recaptcha';
  if (/h-captcha|hcaptcha\.com/i.test(html)) return 'hcaptcha';
  if (/cf-turnstile|challenges\.cloudflare\.com/i.test(html)) return 'turnstile';
  if (/iframe[^>]+src=["'][^"']*captcha/i.test(html)) return 'generic';
  return null;
}

/**
 * Boilerplate hook for connecting to a third-party CAPTCHA solver (e.g. 2Captcha, Anti-Captcha).
 * Returns the solved token string when a real API key and integration are configured.
 */
export async function solveCaptcha(page, siteKey, serviceKey = process.env.CAPTCHA_API_KEY) {
  if (!serviceKey) {
    console.warn('[Puppeteer] CAPTCHA_API_KEY is not configured — skipping automated solve.');
    return null;
  }

  if (!siteKey) {
    console.warn('[Puppeteer] No sitekey found — cannot submit CAPTCHA to solver service.');
    return null;
  }

  const pageUrl = page.url();
  console.log('[Puppeteer] Submitting CAPTCHA to solver service for:', pageUrl);

  // --- 2Captcha-style boilerplate (mock — replace with real HTTP calls in production) ---
  //
  // 1. Submit task:
  //    POST https://2captcha.com/in.php
  //    { key: serviceKey, method: 'userrecaptcha', googlekey: siteKey, pageurl: pageUrl, json: 1 }
  //
  // 2. Poll for result:
  //    GET https://2captcha.com/res.php?key=...&action=get&id=...&json=1
  //
  // 3. Inject solved token into page:
  //    await page.evaluate((token) => {
  //      document.querySelector('#g-recaptcha-response').value = token;
  //      // or trigger hCaptcha / Turnstile callback
  //    }, solvedToken);

  const mockSolvedToken = null;

  if (!mockSolvedToken) {
    console.warn(
      '[Puppeteer] solveCaptcha() is a template stub. Wire up 2Captcha/Anti-Captcha API calls here.'
    );
    return null;
  }

  await page.evaluate((token) => {
    const responseField =
      document.querySelector('#g-recaptcha-response') ||
      document.querySelector('[name="g-recaptcha-response"]') ||
      document.querySelector('[name="h-captcha-response"]');

    if (responseField) {
      responseField.value = token;
      responseField.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }, mockSolvedToken);

  return mockSolvedToken;
}

export async function checkForAndSolveCaptcha(page) {
  const html = await page.content();
  const hasCaptcha = CAPTCHA_PATTERNS.some((pattern) => {
    if (pattern.startsWith('iframe') || pattern.startsWith('[') || pattern.startsWith('.')) {
      return new RegExp(pattern, 'i').test(html);
    }
    return html.toLowerCase().includes(pattern.toLowerCase());
  });

  if (!hasCaptcha) return false;

  console.warn('⚠️ CAPTCHA detected on page!');

  const captchaType = detectCaptchaType(html);
  const siteKey = extractSiteKey(html);

  console.warn(`[Puppeteer] CAPTCHA type: ${captchaType || 'unknown'}, siteKey: ${siteKey || 'not found'}`);

  const token = await solveCaptcha(page, siteKey, process.env.CAPTCHA_API_KEY);
  return Boolean(token);
}

export async function scrapeWithPuppeteer(url, options = {}) {
  let browser;
  let page;
  try {
    browser = await getBrowser();
    page = await browser.newPage();
    await configurePage(page);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    await checkForAndSolveCaptcha(page);

    const pageTitle = await page.title();
    const contentLength = (await page.content()).length;
    console.log('Puppeteer loaded page title:', pageTitle);
    console.log('Puppeteer page content length:', contentLength);

    if (options.waitForSelector) {
      await page.waitForSelector(options.waitForSelector, { timeout: 30000 });
    }

    const html = await page.content();
    return scrapeWithCheerio(html, options);
  } catch (error) {
    console.error('Puppeteer error:', error.message);
    throw error;
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (err) {
        console.error('Error closing page:', err.message);
      }
    }
  }
}

export async function detectRenderMode(url) {
  let browser;
  let page;
  try {
    browser = await getBrowser();
    page = await browser.newPage();
    await configurePage(page);

    const staticResponse = await fetch(url, {
      headers: { 'User-Agent': DEFAULT_USER_AGENT },
    }).catch(() => null);

    if (staticResponse?.ok) {
      const staticHtml = await staticResponse.text();
      const hasAppShell =
        staticHtml.includes('__NEXT_DATA__') ||
        staticHtml.includes('id="root"') ||
        staticHtml.includes('id="app"') ||
        staticHtml.includes('ng-app') ||
        staticHtml.includes('data-reactroot');

      if (!hasAppShell && staticHtml.length > 500) {
        return 'cheerio';
      }
    }

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    await checkForAndSolveCaptcha(page);

    const renderedText = await page.evaluate(() => document.body?.innerText?.length || 0);
    const staticText = staticResponse?.ok
      ? (await staticResponse.text()).replace(/<[^>]+>/g, '').length
      : 0;

    return renderedText > staticText * 1.5 ? 'puppeteer' : 'cheerio';
  } catch (error) {
    console.error('Puppeteer error in detectRenderMode:', error.message);
    return 'puppeteer';
  } finally {
    if (page) {
      try {
        await page.close();
      } catch (err) {
        console.error('Error closing page in detectRenderMode:', err.message);
      }
    }
  }
}

export async function closeBrowser() {
  if (browserInstance) {
    try {
      await browserInstance.close();
    } catch (err) {
      console.error('Error closing browser:', err.message);
    }
    browserInstance = null;
  }
}
