// src/services/strokeDataService.ts

export interface StrokeData {
  strokes?: string[];
  order?: number[];
  skip?: boolean;
  error?: boolean;
  type?: 'kanji' | 'hiragana' | 'katakana' | 'other';
  unicodeHex?: string;
}

const memoryCache = new Map<string, StrokeData>();

export function getCharacterType(char: string): 'kanji' | 'hiragana' | 'katakana' | 'other' {
  if (!char) return 'other';
  const code = char.codePointAt(0) || 0;
  if (code >= 0x4e00 && code <= 0x9fff) return 'kanji';
  if (code >= 0x3040 && code <= 0x309f) return 'hiragana';
  if (code >= 0x30a0 && code <= 0x30ff) return 'katakana';
  return 'other';
}

export function getUnicodeHex(char: string): string {
  const code = char.codePointAt(0) || 0;
  return code.toString(16).padStart(5, '0').toLowerCase();
}

/**
 * Fetch and parse KanjiVG SVG from CDN (jsDelivr GitHub repo or raw GitHub fallback)
 * KanjiVG includes full stroke datasets for Kanji, Hiragana, and Katakana.
 */
async function fetchKanjiVgStrokeData(char: string, type: 'kanji' | 'hiragana' | 'katakana'): Promise<StrokeData> {
  const hex = getUnicodeHex(char);
  const cacheKey = `kanjivg_stroke_${hex}`;

  // 1. Check localStorage cache first
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed: StrokeData = JSON.parse(cached);
      if (parsed && Array.isArray(parsed.strokes) && parsed.strokes.length > 0) {
        memoryCache.set(char, parsed);
        return parsed;
      }
    }
  } catch (e) {
    // localStorage may be unavailable
  }

  // Primary URL (jsDelivr GH mirror) & fallback URL (Raw GitHub)
  const urls = [
    `https://cdn.jsdelivr.net/gh/KanjiVG/kanjivg@master/kanji/${hex}.svg`,
    `https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${hex}.svg`
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;

      const svgText = await res.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(svgText, 'image/svg+xml');
      
      // Select all stroke path elements
      const pathNodes = doc.querySelectorAll('path');
      const strokes: string[] = [];

      pathNodes.forEach(node => {
        const d = node.getAttribute('d');
        if (d && d.trim().length > 0) {
          strokes.push(d.trim());
        }
      });

      if (strokes.length > 0) {
        const result: StrokeData = {
          strokes,
          order: strokes.map((_, i) => i + 1),
          skip: false,
          type,
          unicodeHex: hex
        };

        // Cache in memory
        memoryCache.set(char, result);

        // Cache in localStorage
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch (e) {
          // ignore localStorage quota errors
        }

        return result;
      }
    } catch (e) {
      // Try next URL
    }
  }

  // Graceful fallback if not found or offline
  const fallback: StrokeData = { skip: true, error: true, type, unicodeHex: hex };
  memoryCache.set(char, fallback);
  return fallback;
}

/**
 * Resolve stroke data for a single character (Kanji, Hiragana, Katakana)
 */
export async function resolveCharacter(char: string): Promise<StrokeData> {
  if (!char || char.length === 0) {
    return { skip: true };
  }

  // 1. Check memory cache first
  if (memoryCache.has(char)) {
    return memoryCache.get(char)!;
  }

  const type = getCharacterType(char);

  // 2. Symbols, punctuation, or Latin letters -> skip stroke animation
  if (type === 'other') {
    const result: StrokeData = { skip: true, type: 'other' };
    memoryCache.set(char, result);
    return result;
  }

  // 3. For Kanji, Hiragana, & Katakana: fetch from KanjiVG
  return await fetchKanjiVgStrokeData(char, type);
}

export default {
  resolveCharacter,
  getCharacterType,
  getUnicodeHex
};
