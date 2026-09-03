// src/services/hanziWriterService.ts
import HanziWriter from 'hanzi-writer';

export interface CharacterJson {
  strokes: string[];
  medians: number[][][];
  radStrokes?: number[];
}

const memoryDataCache = new Map<string, CharacterJson>();

/**
 * Determine if character is Hiragana, Katakana, or Kanji
 */
export function getCharCategory(char: string): 'hiragana' | 'katakana' | 'kanji' | 'other' {
  if (!char) return 'other';
  const code = char.codePointAt(0) || 0;
  if (code >= 0x3040 && code <= 0x309f) return 'hiragana';
  if (code >= 0x30a0 && code <= 0x30ff) return 'katakana';
  if (code >= 0x4e00 && code <= 0x9fff) return 'kanji';
  return 'other';
}

/**
 * Fetch character JSON data with memory and localStorage caching
 */
export async function fetchCharacterData(char: string): Promise<CharacterJson> {
  if (!char) throw new Error('No character provided');
  // Safeguard: if multi-character string is passed, extract the first codepoint
  if (Array.from(char).length > 1) {
    char = Array.from(char)[0];
  }

  // 1. Check memory cache first
  if (memoryDataCache.has(char)) {
    return memoryDataCache.get(char)!;
  }

  // 2. Check localStorage cache
  const cacheKey = `hw_char_data_${encodeURIComponent(char)}`;
  try {
    const local = localStorage.getItem(cacheKey);
    if (local) {
      const parsed: CharacterJson = JSON.parse(local);
      if (parsed && Array.isArray(parsed.strokes) && Array.isArray(parsed.medians)) {
        memoryDataCache.set(char, parsed);
        return parsed;
      }
    }
  } catch (e) {
    // ignore localStorage read error
  }

  const cat = getCharCategory(char);

  // List candidate URLs based on category
  const urls: string[] = [];
  if (cat === 'hiragana' || cat === 'katakana') {
    urls.push(
      `https://cdn.jsdelivr.net/gh/ailectra/kana-json@latest/data/${encodeURIComponent(char)}.json`,
      `https://raw.githubusercontent.com/ailectra/kana-json/master/data/${encodeURIComponent(char)}.json`
    );
  } else {
    urls.push(
      `https://cdn.jsdelivr.net/npm/hanzi-writer-data-jp@latest/${encodeURIComponent(char)}.json`,
      `https://cdn.jsdelivr.net/npm/hanzi-writer-data@latest/${encodeURIComponent(char)}.json`
    );
  }

  for (const url of urls) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const json: CharacterJson = await res.json();
      if (json && Array.isArray(json.strokes) && Array.isArray(json.medians)) {
        memoryDataCache.set(char, json);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(json));
        } catch (e) {
          // localStorage quota ignored
        }
        return json;
      }
    } catch (e) {
      // try next
    }
  }

  throw new Error(`Gagal memuat stroke data untuk karakter ${char}`);
}

/**
 * Custom charDataLoader for HanziWriter supporting Kana (Hiragana & Katakana) + Kanji
 */
export const customCharDataLoader = (
  char: string,
  onComplete: (data: CharacterJson) => void,
  onErr: (err?: any) => void
): void => {
  fetchCharacterData(char)
    .then(onComplete)
    .catch(onErr);
};

/**
 * Preload character data ahead of time for smooth UX
 */
export async function preloadCharacterData(char: string): Promise<void> {
  if (!char) return;
  const chars = Array.from(char);
  await Promise.all(
    chars.map(c => fetchCharacterData(c).catch(() => null))
  );
}

/**
 * Creates a HanziWriter instance with optimal defaults for quiz/writing evaluation
 */
export function createQuizHanziWriter(
  element: HTMLElement | string,
  character: string,
  size = 300,
  options: Record<string, any> = {}
) {
  return HanziWriter.create(element, character, {
    width: size,
    height: size,
    padding: Math.round(size * 0.1),
    showOutline: false,
    showCharacter: false,
    outlineColor: 'rgba(148, 163, 184, 0.22)',
    charDataLoader: customCharDataLoader,
    drawingWidth: 76, // Bold brush stroke matching Japanese font thickness
    strokeColor: '#38bdf8', // Light sky blue for confirmed correct strokes
    drawingColor: '#818cf8', // Indigo for user drawing stroke
    highlightColor: '#34d399', // Emerald for highlights
    renderer: 'svg',
    ...options
  });
}
