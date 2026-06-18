import { scrapeWithCheerio, countRawExtractedItems } from './cheerioScraper.js';
import { scrapeWithPuppeteer, detectRenderMode } from './puppeteerScraper.js';

export async function scrape(project) {
  const { website_url: url, scraper_type: scraperType, selectors, extraction_config: extractionConfig } = project;
  const parsedExtraction =
    typeof extractionConfig === 'string' ? JSON.parse(extractionConfig) : extractionConfig || {};
  const options = {
    selectors: typeof selectors === 'string' ? JSON.parse(selectors) : selectors || {},
    extractionConfig: parsedExtraction,
    url,
  };

  console.log('[Scraper] Fetching URL:', url);
  console.log('[Scraper] Scraper type:', scraperType);
  console.log('[Scraper] Selectors:', JSON.stringify(options.selectors));
  console.log('[Scraper] Extraction config:', JSON.stringify(options.extractionConfig));

  let rawData;
  let scraperUsed;

  // Handle both 'auto-detect' and 'auto'
  const isAutoDetect = scraperType === 'auto-detect' || scraperType === 'auto';

  if (isAutoDetect) {
    // Try Cheerio first
    try {
      const response = await fetch(url, {
        headers: { 'User-Agent': 'WebPulse/1.0 (+https://webpulse.app)' },
      });

      console.log('[Scraper] HTTP response status (Cheerio try):', response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      }

      const html = await response.text();
      const preview = html.replace(/\s+/g, ' ').slice(0, 200);
      console.log('[Scraper] HTML preview (first 200 chars):', preview);

      rawData = await scrapeWithCheerio(html, options);
      const itemCount = countRawExtractedItems(rawData);

      if (itemCount > 0) {
        scraperUsed = 'cheerio';
        console.log('[Scraper] Auto-detect: Cheerio extracted', itemCount, 'records. Using Cheerio.');
      } else {
        console.log("Auto-detect: Cheerio returned 0 records. Falling back to Puppeteer for URL: " + url);
        // Fallback to Puppeteer
        rawData = await scrapeWithPuppeteer(url, options);
        scraperUsed = 'puppeteer';
        const puppeteerItemCount = countRawExtractedItems(rawData);
        console.log('[Scraper] Auto-detect: Puppeteer extracted', puppeteerItemCount, 'records.');
      }
    } catch (cheerioError) {
      console.warn('[Scraper] Auto-detect: Cheerio failed, trying Puppeteer. Error:', cheerioError.message);
      // Fallback to Puppeteer
      rawData = await scrapeWithPuppeteer(url, options);
      scraperUsed = 'puppeteer';
    }
  } else if (scraperType === 'puppeteer') {

    rawData = await scrapeWithPuppeteer(url, options);
    scraperUsed = 'puppeteer';
  } else {
    // Default to Cheerio
    const response = await fetch(url, {
      headers: { 'User-Agent': 'WebPulse/1.0 (+https://webpulse.app)' },
    });

    console.log('[Scraper] HTTP response status:', response.status, response.statusText);

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const preview = html.replace(/\s+/g, ' ').slice(0, 200);
    console.log('[Scraper] HTML preview (first 200 chars):', preview);

    rawData = await scrapeWithCheerio(html, options);
    scraperUsed = 'cheerio';
  }

  return { data: rawData, scraperUsed };
}
