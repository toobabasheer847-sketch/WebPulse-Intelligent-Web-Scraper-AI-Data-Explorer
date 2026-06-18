import * as cheerio from 'cheerio';

function parseQuotesToScrape($) {
  const items = [];
  $('.quote').each((_, el) => {
    const text = $(el).find('.text').text().trim();
    const author = $(el).find('.author').text().trim();
    const tags = $(el)
      .find('.tags .tag')
      .map((__, tag) => $(tag).text().trim())
      .get();
    if (text || author) {
      items.push({ text, author, tags });
    }
  });
  return items;
}

function isQuotesToScrapeUrl(url) {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return hostname === 'quotes.toscrape.com';
  } catch {
    return url.includes('quotes.toscrape.com');
  }
}

function parseBooksToScrape($, url) {
  const items = [];
  $('.product_pod').each((_, el) => {
    const title = $(el).find('h3 a').attr('title') || $(el).find('h3 a').text().trim();
    const price = $(el).find('.price_color').text().trim();
    const ratingClass = $(el).find('.star-rating').attr('class');
    const rating = ratingClass ? ratingClass.replace('star-rating', '').trim() : 'N/A';
    const image = $(el).find('.image_container img').attr('src');
    const image_url = image ? `http://books.toscrape.com/${image.replace('../', '')}` : null;
    if (title) {
      items.push({ title, price, rating, image_url });
    }
  });
  return items;
}

function isBooksToScrapeUrl(url) {
  if (!url) return false;
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return hostname === 'books.toscrape.com';
  } catch {
    return url.includes('books.toscrape.com');
  }
}

export async function scrapeWithCheerio(html, { selectors = {}, extractionConfig = {}, url = '' } = {}) {
  const $ = cheerio.load(html);
  const data = {
    text: [],
    tables: [],
    links: [],
    images: [],
    metadata: {},
    custom: {},
    items: [],
  };

  console.log('[Cheerio] Page title:', $('title').text().trim());

  // Force-Parser for Books to Scrape
  if (url.includes('books.toscrape.com')) {
    console.log("Auto-detect: Applying Force-Parser for Books to Scrape...");
    $('.product_pod').each((i, el) => {
      const title = $(el).find('h3 a').attr('title') || $(el).find('h3 a').text().trim();
      const price = $(el).find('.price_color').text().trim();
      const image = $(el).find('.image_container img').attr('src');
      data.items.push({
        title: title,
        price: price,
        image_url: image ? `http://books.toscrape.com/${image.replace('../', '').replace('media/', '')}` : null
      });
    });
  }
  // Force-Parser for Quotes to Scrape
  else if (url.includes('quotes.toscrape.com')) {
    console.log("Auto-detect: Applying Force-Parser for Quotes to Scrape...");
    $('.quote').each((i, el) => {
      data.items.push({
        text: $(el).find('.text').text().trim(),
        author: $(el).find('.author').text().trim(),
        tags: $(el).find('.tag').map((i, tag) => $(tag).text().trim()).get()
      });
    });
  }
  // Generic Fallback for other websites
  else {
    const textSelector = selectors.text || extractionConfig.textSelector || 'p, h1, h2, h3, h4, h5, h6, li';

    console.log('[Cheerio] CSS selectors:', { textSelector, custom: selectors });
    console.log('[Cheerio] Elements found with text selector:', $(textSelector).length);

    for (const [key, selector] of Object.entries(selectors)) {
      if (key === 'text') continue;
      const count = $(selector).length;
      console.log(`[Cheerio] Elements found with selector "${key}" (${selector}):`, count);
    }

    // Text extraction
    $(textSelector).each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 2) {
        data.text.push({ content: text, tag: el.tagName });
      }
    });

    // Custom selectors
    for (const [key, selector] of Object.entries(selectors)) {
      if (['text'].includes(key)) continue;
      const values = [];
      $(selector).each((_, el) => {
        values.push($(el).text().trim());
      });
      if (values.length) data.custom[key] = values;
    }
  }

  // Metadata
  data.metadata = {
    title: $('title').text().trim(),
    description: $('meta[name="description"]').attr('content') || '',
    keywords: $('meta[name="keywords"]').attr('content') || '',
    ogTitle: $('meta[property="og:title"]').attr('content') || '',
    ogDescription: $('meta[property="og:description"]').attr('content') || '',
    canonical: $('link[rel="canonical"]').attr('href') || '',
  };

  // Tables
  $('table').each((i, table) => {
    const rows = [];
    $(table).find('tr').each((_, row) => {
      const cells = [];
      $(row).find('th, td').each((__, cell) => {
        cells.push($(cell).text().trim());
      });
      if (cells.length) rows.push(cells);
    });
    if (rows.length) data.tables.push({ index: i, rows });
  });

  // Links
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().trim();
    if (href) data.links.push({ href, text });
  });

  // Images
  $('img').each((_, el) => {
    const src = $(el).attr('src');
    const alt = $(el).attr('alt') || '';
    if (src) data.images.push({ src, alt });
  });

  console.log(`Scraper successfully extracted ${data.items.length} items.`);
  console.log("Cheerio extracted and saved " + data.items.length + " records for project URL: " + url);
  console.log('[Cheerio] Successfully extracted items to save:', data.items.length);
  if (data.items.length === 0) {
    console.warn("WARNING: Extracted data is empty for URL: " + url);
  }
  return data;
}

export function countRawExtractedItems(rawData) {
  if (!rawData) return 0;

  if (Array.isArray(rawData.items) && rawData.items.length > 0) {
    return rawData.items.length;
  }

  const customTotal = Object.values(rawData.custom || {}).reduce(
    (sum, values) => sum + (Array.isArray(values) ? values.length : 0),
    0
  );
  if (customTotal > 0) return customTotal;

  const textCount = (rawData.text || []).length;
  const tableRows = (rawData.tables || []).reduce((sum, table) => sum + (table.rows?.length || 0), 0);

  return textCount + tableRows;
}
