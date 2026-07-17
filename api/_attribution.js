const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function normalize(value) {
  if (typeof value !== 'string') return '';
  if (/[^\s@]+@[^\s@]+\.[^\s@]+/.test(value)) return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 100);
}

export function safeAttribution(body = {}, defaults = {}) {
  return Object.fromEntries(
    UTM_KEYS.flatMap((key) => {
      const value = normalize(body[key]) || normalize(defaults[key]);
      return value ? [[key, value]] : [];
    }),
  );
}
