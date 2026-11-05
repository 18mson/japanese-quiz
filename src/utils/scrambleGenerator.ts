// src/utils/scrambleGenerator.ts
import { toRomaji, toHiragana } from 'wanakana';

export interface ScrambleTile {
  id: string;
  text: string;
  isDistractor: boolean;
}

export interface ScrambleResult {
  tiles: ScrambleTile[];
  isMultiWord: boolean;
  targetChunks: string[];
}

/**
 * Split Japanese kana string into morae.
 * Handles youon (きゃ, きゅ, きょ) and optionally attaches sokuon (っ) to the next syllable.
 */
export function splitKanaIntoMorae(kana: string, attachSokuon = false): string[] {
  const morae: string[] = [];
  const chars = Array.from(kana.trim());
  
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const next = chars[i + 1];

    if (attachSokuon && (c === 'っ' || c === 'ッ') && next) {
      const afterNext = chars[i + 2];
      if (afterNext && /[ゃゅょャュョぁぃぅぇぉゎァィゥェォ]/.test(afterNext)) {
        morae.push(c + next + afterNext);
        i += 2;
      } else {
        morae.push(c + next);
        i += 1;
      }
      continue;
    }

    if (next && /[ゃゅょャュョぁぃぅぇぉゎァィゥェォ]/.test(next)) {
      morae.push(c + next);
      i++;
    } else {
      morae.push(c);
    }
  }

  return morae.filter(m => m.trim().length > 0);
}

/**
 * Common distractor morae pool for Japanese kana and romaji.
 */
export const COMMON_KANA_DISTRACTORS = [
  'か', 'し', 'た', 'な', 'て', 'り', 'ま', 'く', 'と', 'ん',
  'さ', 'き', 'す', 'る', 'い', 'よ', 'ら', 'こ', 'に', 'わ',
  'お', 'え', 'う', 'あ', 'め', 'み', 'ね', 'け', 'せ', 'そ'
];

export const COMMON_ROMAJI_DISTRACTORS = [
  'ka', 'shi', 'ta', 'te', 'na', 'to', 'ma', 'ri', 'ku', 'ru',
  'sa', 'ki', 'su', 'ko', 'ni', 'wa', 'ya', 'mo', 'no', 'ne',
  'o', 'e', 'u', 'a', 'me', 'mi', 'ke', 'se', 'so', 'ha'
];

/**
 * Common distractor letter pool for Indonesian words (huruf).
 */
export const COMMON_INDONESIAN_LETTERS = [
  'a', 'e', 'i', 'o', 'u',
  'b', 'd', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'w', 'y'
];

/**
 * Common distractor word pool for Indonesian multi-word phrases.
 */
export const COMMON_INDONESIAN_WORDS = [
  'rumah', 'kamar', 'tempat', 'jalan', 'orang', 'waktu', 'buku', 'makan',
  'air', 'uang', 'toko', 'hari', 'kota', 'baju', 'mobil', 'meja', 'pintu',
  'kantor', 'stasiun', 'sekolah', 'besar', 'kecil', 'baru', 'masuk', 'keluar'
];

/**
 * Extracts clean individual meanings from raw Indonesian meaning string.
 */
export function extractCleanMeanings(rawMeaning: string): string[] {
  if (!rawMeaning) return [];
  const parts = rawMeaning.split(/[/;,\n]| atau /i);
  const cleanList: string[] = [];

  for (const part of parts) {
    const noNotes = part.replace(/\(.*?\)|（.*?）|\[.*?\]|【.*?】/g, '');
    const cleaned = noNotes
      .replace(/[~～.。!！?？\"'“”]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .toLowerCase();
    if (cleaned && cleaned.length >= 2 && !cleanList.includes(cleaned)) {
      cleanList.push(cleaned);
    }
  }

  if (cleanList.length === 0) {
    const fallback = rawMeaning.replace(/[~～.。!！?？\"'“”]/g, '').trim().toLowerCase();
    if (fallback) cleanList.push(fallback);
  }

  return cleanList;
}

/**
 * Split Indonesian meaning string into meaningful chunks.
 * For single words: splits into individual letters (huruf) so user has rich letter suggestions!
 * For multi-word phrases: splits into words.
 */
export function splitMeaningIntoChunks(meaning: string): { chunks: string[]; isMultiWord: boolean } {
  const cleanMeanings = extractCleanMeanings(meaning);
  const primary = cleanMeanings[0] || meaning.trim().toLowerCase();
  
  if (primary.includes(' ')) {
    return {
      chunks: primary.split(/\s+/).filter(Boolean),
      isMultiWord: true
    };
  }

  // Single word: split into individual letters (saran huruf)
  // If it has hyphens e.g. "sendiri-sendiri", strip hyphen so user spells letters
  const letters = Array.from(primary).filter(ch => ch !== ' ' && ch !== '-');
  return {
    chunks: letters.length > 0 ? letters : [primary],
    isMultiWord: false
  };
}

/**
 * Calculate dynamic distractor quota.
 * Target: total tiles around 9-14 so that the bubble area is comfortably filled
 * matching the tall keyboard height.
 */
export function calculateDistractorCount(targetLength: number): number {
  if (targetLength >= 14) return 0;
  if (targetLength >= 11) return 2;
  if (targetLength >= 8) return 3;
  if (targetLength >= 6) return 5;
  if (targetLength >= 4) return 6;
  if (targetLength === 3) return 7;
  return 8; // For 1 or 2 chunks, add 8 distractors (total 9-10 tiles)
}

/**
 * Fisher-Yates shuffle array with a safeguard that the shuffled array
 * does not match the original order if length > 1.
 */
export function shuffleArray<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Main generator to build tiles (target chunks + dynamic distractors)
 */
export function generateScrambleTiles(
  target: string,
  mode: 'romaji' | 'kana' | 'meaning'
): ScrambleResult {
  const cleanTarget = target.trim();
  let targetChunks: string[] = [];
  let isMultiWord = false;
  const secondaryChunks: string[] = [];

  if (mode === 'meaning') {
    const cleanMeanings = extractCleanMeanings(cleanTarget);
    const primary = cleanMeanings[0] || cleanTarget;
    const split = splitMeaningIntoChunks(primary);
    targetChunks = split.chunks;
    isMultiWord = split.isMultiWord;

    // Collect letters or words from secondary meanings as high-priority distractors/alternatives
    const secondaries = cleanMeanings.slice(1);
    for (const sec of secondaries) {
      if (isMultiWord) {
        const secWords = sec.split(/\s+/).filter(Boolean);
        for (const w of secWords) {
          if (!targetChunks.includes(w) && !secondaryChunks.includes(w)) {
            secondaryChunks.push(w);
          }
        }
      } else {
        const secLetters = Array.from(sec).filter(ch => ch !== ' ' && ch !== '-');
        for (const l of secLetters) {
          if (!targetChunks.includes(l) && !secondaryChunks.includes(l)) {
            secondaryChunks.push(l);
          }
        }
      }
    }
  } else if (cleanTarget.includes(' ')) {
    // Multi-word romaji sentence
    targetChunks = cleanTarget.split(/\s+/).filter(Boolean);
    isMultiWord = true;
  } else if (mode === 'kana') {
    targetChunks = splitKanaIntoMorae(cleanTarget, false);
    isMultiWord = false;
  } else {
    // Single romaji word: convert to kana morae, then to romaji chunks
    const kana = toHiragana(cleanTarget);
    const morae = splitKanaIntoMorae(kana, true);
    targetChunks = morae.map(m => toRomaji(m).toLowerCase());
    isMultiWord = false;
  }

  // Fallback if split produced empty
  if (targetChunks.length === 0) {
    targetChunks = [cleanTarget];
  }

  const distractorCount = calculateDistractorCount(targetChunks.length);
  const distractors: string[] = [];

  if (distractorCount > 0) {
    if (mode === 'meaning') {
      // 1. Add secondary meaning chunks first
      for (const s of secondaryChunks) {
        if (distractors.length < distractorCount && !distractors.includes(s)) {
          distractors.push(s);
        }
      }

      // 2. Fill remaining from common pool
      if (distractors.length < distractorCount) {
        const needed = distractorCount - distractors.length;
        if (isMultiWord) {
          const candidates = COMMON_INDONESIAN_WORDS.filter(w => !targetChunks.includes(w) && !distractors.includes(w));
          const shuffled = shuffleArray(candidates);
          distractors.push(...shuffled.slice(0, needed));
        } else {
          const candidates = COMMON_INDONESIAN_LETTERS.filter(l => !targetChunks.includes(l) && !distractors.includes(l));
          const shuffled = shuffleArray(candidates);
          distractors.push(...shuffled.slice(0, needed));
        }
      }
    } else if (mode === 'kana') {
      const candidates = COMMON_KANA_DISTRACTORS.filter(d => !targetChunks.includes(d));
      const shuffledCandidates = shuffleArray(candidates);
      distractors.push(...shuffledCandidates.slice(0, distractorCount));
    } else {
      // Romaji
      const candidates = COMMON_ROMAJI_DISTRACTORS.filter(d => !targetChunks.map(c => c.toLowerCase()).includes(d));
      const shuffledCandidates = shuffleArray(candidates);
      distractors.push(...shuffledCandidates.slice(0, distractorCount));
    }
  }

  // Create tile objects
  const rawTiles: ScrambleTile[] = [
    ...targetChunks.map((text, idx) => ({
      id: `target_${idx}_${text}`,
      text,
      isDistractor: false
    })),
    ...distractors.map((text, idx) => ({
      id: `distractor_${idx}_${text}`,
      text,
      isDistractor: true
    }))
  ];

  // Shuffle until order is not identical to targetChunks
  let shuffled = shuffleArray(rawTiles);
  if (targetChunks.length > 1 && shuffled.slice(0, targetChunks.length).every((t, i) => t.text === targetChunks[i])) {
    shuffled = shuffleArray(rawTiles);
  }

  return {
    tiles: shuffled,
    isMultiWord,
    targetChunks
  };
}
