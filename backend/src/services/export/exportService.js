export function toJSON(data, pretty = true) {
  return JSON.stringify(data, null, pretty ? 2 : 0);
}

export function toCSV(data) {
  if (!Array.isArray(data) || data.length === 0) {
    return 'No data';
  }

  const rows = [];
  const flatRows = data.map((item) => flattenObject(item.content_json || item));

  const allKeys = [...new Set(flatRows.flatMap((r) => Object.keys(r)))];
  rows.push(allKeys.join(','));

  for (const row of flatRows) {
    const values = allKeys.map((key) => {
      const val = row[key] ?? '';
      const str = String(val).replace(/"/g, '""');
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str}"`
        : str;
    });
    rows.push(values.join(','));
  }

  return rows.join('\n');
}

function flattenObject(obj, prefix = '') {
  const result = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else if (Array.isArray(value)) {
      result[newKey] = value
        .slice(0, 10)
        .map((v) => (typeof v === 'object' ? JSON.stringify(v) : v))
        .join(' | ');
    } else {
      result[newKey] = value;
    }
  }

  return result;
}
