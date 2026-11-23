/**
 * Pure Danish speech key & phonetic preprocessing helpers.
 * Shared between the browser speech service and the offline MP3 generator script.
 */

export function normalizeSpeechKey(text: string): string {
  return text.trim().replace(/\s+/g, ' ');
}

/**
 * Deterministic 64-bit FNV-1a hash encoded as 16 lowercase hex chars.
 * Fast, synchronous, zero dependencies across Node and browser.
 */
export function hashSpeechKey(text: string): string {
  const normalized = normalizeSpeechKey(text);
  let h1 = 0x811c9dc5;
  let h2 = 0x811c9dc5 ^ 0x9e3779b9;

  for (let i = 0; i < normalized.length; i += 1) {
    const code = normalized.charCodeAt(i);
    h1 ^= code;
    h1 = Math.imul(h1, 0x01000193);
    h2 ^= code + ((i + 1) & 0xff);
    h2 = Math.imul(h2, 0x01000193);
  }

  return (h1 >>> 0).toString(16).padStart(8, '0') + (h2 >>> 0).toString(16).padStart(8, '0');
}

/**
 * Splits a numbered exam ticket line like "1. Du skal give tegn..." into
 * its prefix ("1.") and body ("Du skal give tegn..."), if applicable.
 */
export function splitNumberedSpeechItem(text: string): { prefix: string; body: string } | null {
  const normalized = normalizeSpeechKey(text);
  const match = normalized.match(/^([1-9]\.)\s+(.+)$/);
  if (!match) return null;
  return { prefix: match[1], body: match[2] };
}

/**
 * Converts Danish driving-theory abbreviations, punctuation, and symbols
 * into natural spoken Danish before passing to neural TTS or Web Speech.
 */
export function prepareDanishSpeechText(raw: string): string {
  let s = normalizeSpeechKey(raw);
  if (!s) return '';

  const standaloneDigitMap: Record<string, string> = {
    '1.': 'Et:',
    '2.': 'To:',
    '3.': 'Tre:',
    '4.': 'Fire:',
    '5.': 'Fem:',
    '6.': 'Seks:',
  };
  if (standaloneDigitMap[s]) {
    return standaloneDigitMap[s];
  }

  // Visual separators & quotes -> natural spoken pauses
  s = s.replace(/[«»„“”]/g, '"');
  s = s.replace(/\s*[·•→➔➤]\s*/g, ', ');
  s = s.replace(/\s*—\s*/g, ', ');
  s = s.replace(/\s*[&+]\s*/g, ' og ');
  s = s.replace(/~\s*(\d)/g, 'cirka $1');

  // Danish DD.MM.YYYY dates -> spoken "D. month YYYY"
  const danishMonths = [
    '', 'januar', 'februar', 'marts', 'april', 'maj', 'juni',
    'juli', 'august', 'september', 'oktober', 'november', 'december',
  ];
  s = s.replace(/\b(\d{2})\.(\d{2})\.(\d{4})\b/g, (_m, dd, mm, yyyy) => {
    const d = Number(dd);
    const m = Number(mm);
    if (d >= 1 && d <= 31 && m >= 1 && m <= 12) {
      return `${d}. ${danishMonths[m]} ${yyyy}`;
    }
    return `${dd}.${mm}.${yyyy}`;
  });

  // Acronyms that TTS otherwise reads as awkward syllables
  s = s.replace(/\bMIN\b/g, 'minimum');
  s = s.replace(/\bMAX\b/g, 'maksimum');
  s = s.replace(/\bMC\b/g, 'motorcykel');
  s = s.replace(/\bABS\b/g, 'A B S');
  s = s.replace(/\bESP\b/g, 'E S P');
  s = s.replace(/\bKTA\b/g, 'K T A');
  s = s.replace(/\bTWI\b/g, 'T W I');

  // Specific compound rate / ratio forms
  s = s.replace(/km\/t\b/gi, 'kilometer i timen');
  s = s.replace(/m\/sek\.?\b/gi, 'meter i sekundet');
  s = s.replace(/m\/s\b/gi, 'meter i sekundet');
  s = s.replace(/o\/min\b/gi, 'omdrejninger i minuttet');
  s = s.replace(/blink\/min\b/gi, 'blink i minuttet');
  s = s.replace(/(\d+)\s*\/\s*min\b/gi, '$1 i minuttet');
  s = s.replace(/\bl\/100\b/gi, 'liter per 100');
  s = s.replace(/\b24\/7\b/g, '24 timer i døgnet');
  s = s.replace(/\b20\/25\b/g, '20 ud af 25');
  s = s.replace(/\b3\/26\b/g, '3 ud af 26');
  s = s.replace(/\b78\/148\b/g, '78 ud af 148');

  // Symbols & legal marks
  s = s.replace(/(\d)\s*‰/g, '$1 promille');
  s = s.replace(/‰/g, 'promille');
  s = s.replace(/(\d)\s*%/g, '$1 procent');
  s = s.replace(/§\s*(\d+)/g, 'paragraf $1');
  s = s.replace(/°/g, ' grader');

  // Common Danish abbreviations in køreskole / Færdselsloven
  s = s.replace(/\bf\.eks\./gi, 'for eksempel');
  s = s.replace(/\bfx\b\.?/gi, 'for eksempel');
  s = s.replace(/\bbl\.a\./gi, 'blandt andet');
  s = s.replace(/\bca\./gi, 'cirka');
  s = s.replace(/\bmaks\./gi, 'maksimum');
  s = s.replace(/\bmax\./gi, 'maksimum');
  // Case-sensitive "min." / "Min." so uppercase engine marker "MIN." is left as MIN
  s = s.replace(/\bmin\.(?=\s*\d)/g, 'mindst');
  s = s.replace(/\bMin\.(?=\s*\d)/g, 'Mindst');
  s = s.replace(/(\d)\s*min\.(?!\w)/gi, '$1 minutter');
  s = s.replace(/(\d)\s*sek\.(?!\w)/gi, '$1 sekunder');
  s = s.replace(/\bomdr\./gi, 'omdrejninger');
  s = s.replace(/\bpga\./gi, 'på grund af');
  s = s.replace(/\bdvs\./gi, 'det vil sige');
  s = s.replace(/\bosv\./gi, 'og så videre');
  s = s.replace(/\bm\.m\./gi, 'med mere');
  s = s.replace(/\bevt\./gi, 'eventuelt');
  s = s.replace(/\binkl\./gi, 'inklusive');
  s = s.replace(/\bincl\./gi, 'inklusive');
  s = s.replace(/\bekskl\./gi, 'eksklusive');
  s = s.replace(/\bpr\./gi, 'per');
  s = s.replace(/\bkr\./gi, 'kroner');
  s = s.replace(/\bkl\./gi, 'klokken');
  s = s.replace(/\bmdr\./gi, 'måneder');
  s = s.replace(/\bstk\./gi, 'styk');
  s = s.replace(/\bnr\./gi, 'nummer');
  s = s.replace(/\bell\./gi, 'eller');
  s = s.replace(/\bvs\./gi, 'kontra');
  s = s.replace(/\bobs\b\.?/gi, 'bemærk');

  // Hyphenated slash compounds: "vinter-/helårsdæk" -> "vinter eller helårsdæk"
  s = s.replace(/([A-Za-zÆØÅæøå]+)-\/([A-Za-zÆØÅæøå]+)/g, '$1 eller $2');
  // General slash pairs: "op/ned", "ABS/ESP", "50/100" -> "$1 eller $2"
  s = s.replace(/([A-Za-zÆØÅæøå0-9]+)\/([A-Za-zÆØÅæøå0-9]+)/g, '$1 eller $2');

  // Numeric ranges: "200–300", "25-35" -> "200 til 300"
  s = s.replace(/(\d+)\s*[–-]\s*(\d+)/g, '$1 til $2');

  // Step markers like "1) ... 2) ..." -> "1. ... 2. ..."
  s = s.replace(/(^|\s)(\d)\)\s*/g, '$1$2. ');

  // Metric units right after digits
  s = s.replace(/(\d)\s*mm\b/g, '$1 millimeter');
  s = s.replace(/(\d)\s*cm\b/g, '$1 centimeter');
  s = s.replace(/(\d)\s*m\b(?![a-zæøå])/g, '$1 meter');

  // Clean extra spaces / repeated commas
  s = s.replace(/\s+,/g, ',');
  s = s.replace(/,\s*,+/g, ',');
  s = s.replace(/\s{2,}/g, ' ').trim();

  return s;
}
