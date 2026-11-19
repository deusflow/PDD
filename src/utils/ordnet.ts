const DDO_BASE_URL = 'https://ordnet.dk/ddo/ordbog?query=';

const STOP_WORDS = new Set([
  'og',
  'for',
  'i',
  'på',
  'af',
  'til',
  'om',
  'ved',
  'med',
  'fra',
  'efter',
  'før',
  'eller',
  'som',
  'den',
  'det',
  'de',
  'en',
  'et',
  'er',
  'har',
  'kan',
  'skal',
  'må',
  'ved',
  'under',
  'over',
  'mod',
  'vs',
  'max',
  'min',
  'ca',
  'fx',
  'km',
  'kr',
  'stk',
  'nr',
  'kl',
]);

/** Clean a raw token for ordnet.dk/ddo lookup. */
export function normalizeOrdnetWord(raw: string): string {
  return raw
    .replace(/[.,:;!?()"'«»—–/‰&+<>]/g, ' ')
    .trim()
    .split(/\s+/)[0] ?? '';
}

/** Build a deep-link to Den Danske Ordbog (ordnet.dk/ddo) for a single word or phrase. */
export function getOrdnetUrl(query: string): string {
  const clean = query.replace(/[()«»—–]/g, ' ').replace(/\s+/g, ' ').trim();
  return `${DDO_BASE_URL}${encodeURIComponent(clean)}`;
}

/**
 * Extract up to `maxWords` meaningful Danish content words from a card title
 * (skipping road-sign codes like A11/C62, numbers, and prepositions) for quick DDO lookup.
 */
export function extractOrdnetLookupWords(textDa: string, maxWords: number = 3): string[] {
  const tokens = textDa
    .replace(/[.,:;!?()"'«»—–/‰&+<>]/g, ' ')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter(Boolean);

  const picked: string[] = [];
  const seen = new Set<string>();

  for (const tok of tokens) {
    // Skip pure numbers or sign codes like A11, B15, C55-80, E42, D11
    if (/^[A-E]\d+(?:-[a-z0-9]+)?$/i.test(tok) || /^\d+$/.test(tok)) continue;
    const lower = tok.toLowerCase();
    if (lower.length < 3 || STOP_WORDS.has(lower)) continue;
    if (seen.has(lower)) continue;
    seen.add(lower);
    picked.push(tok);
    if (picked.length >= maxWords) break;
  }

  return picked;
}
