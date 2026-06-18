export function processScrapedData(rawData) {
  const cleaned = {
    metadata: cleanMetadata(rawData.metadata),
    text: deduplicateByKey(rawData.text || [], 'content'),
    tables: rawData.tables || [],
    links: deduplicateByKey(rawData.links || [], 'href'),
    images: deduplicateByKey(rawData.images || [], 'src'),
    custom: rawData.custom || {},
    items: rawData.items || [],
    summary: {},
  };

  cleaned.summary = {
    textCount: cleaned.text.length,
    tableCount: cleaned.tables.length,
    linkCount: cleaned.links.length,
    imageCount: cleaned.images.length,
    itemCount: cleaned.items.length,
    scrapedAt: new Date().toISOString(),
  };

  return cleaned;
}

export function countExtractedItems(processed) {
  if (!processed) return 0;

  if (Array.isArray(processed.items) && processed.items.length > 0) {
    return processed.items.length;
  }

  const customTotal = Object.values(processed.custom || {}).reduce(
    (sum, values) => sum + (Array.isArray(values) ? values.length : 0),
    0
  );
  if (customTotal > 0) return customTotal;

  const textCount = processed.summary?.textCount ?? (processed.text || []).length;
  const tableRows = (processed.tables || []).reduce(
    (sum, table) => sum + (table.rows?.length || 0),
    0
  );

  return textCount + tableRows;
}

function cleanMetadata(metadata = {}) {
  const cleaned = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value && typeof value === 'string') {
      cleaned[key] = value.trim();
    }
  }
  return cleaned;
}

function deduplicateByKey(items, key) {
  const seen = new Set();
  return items.filter((item) => {
    const val = item[key];
    if (!val || seen.has(val)) return false;
    seen.add(val);
    return true;
  });
}

export function flattenForComparison(data) {
  const flat = {};

  if (data.metadata) {
    for (const [k, v] of Object.entries(data.metadata)) {
      flat[`metadata.${k}`] = String(v);
    }
  }

  (data.text || []).forEach((t, i) => {
    flat[`text.${i}`] = t.content;
  });

  (data.links || []).forEach((l, i) => {
    flat[`links.${i}`] = `${l.text}|${l.href}`;
  });

  (data.images || []).forEach((img, i) => {
    flat[`images.${i}`] = `${img.alt}|${img.src}`;
  });

  for (const [key, values] of Object.entries(data.custom || {})) {
    (values || []).forEach((v, i) => {
      flat[`custom.${key}.${i}`] = String(v);
    });
  }

  (data.items || []).forEach((item, i) => {
    flat[`items.${i}`] = typeof item === 'object' ? JSON.stringify(item) : String(item);
  });

  return flat;
}
