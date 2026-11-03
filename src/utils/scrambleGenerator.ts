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
const COMMON_KANA_DISTRACTORS = [
  'か', 'し', 'た', 'な', 'て', 'り', 'ま', 'く', 'と', 'ん',
  'さ', 'き', 'す', 'る', 'い', 'よ', 'ら', 'こ', 'に', 'わ'
];

const COMMON_ROMAJI_DISTRACTORS = [
  'ka', 'shi', 'ta', 'te', 'na', 'to', 'ma', 'ri', 'ku', 'ru',
  'sa', 'ki', 'su', 'ko', 'ni', 'wa', 'ya', 'mo', 'no', 'ne'
];

/**
 * Split Indonesian meaning string into meaningful chunks.
 */
export function splitMeaningIntoChunks(meaning: string): string[] {
  // If multiple words, split by space
  const words = meaning.trim().split(/\s+/).filter(Boolean);
  if (words.length > 1) {
    return words;
  }
  // Single word: if longer than 5 chars, split into 2-3 parts
  const word = words[0] || '';
  if (word.length <= 4) {
    return [word];
  }
  const mid = Math.ceil(word.length / 2);
  return [word.slice(0, mid), word.slice(mid)];
}

/**
 * Calculate dynamic distractor quota based on target chunk length N.
 * Max total tiles on mobile: <= 7.
 */
export function calculateDistractorCount(targetLength: number): number {
  if (targetLength >= 6) return 0;
  if (targetLength >= 4) return 1;
  if (targetLength === 3) return 2;
  return 2; // For 1 or 2 chunks, add 2 distractors (total 3-4 tiles)
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
  const isMultiWord = cleanTarget.includes(' ');
  let targetChunks: string[] = [];

  if (isMultiWord) {
    targetChunks = cleanTarget.split(/\s+/).filter(Boolean);
  } else if (mode === 'kana') {
    targetChunks = splitKanaIntoMorae(cleanTarget, false);
  } else if (mode === 'romaji') {
    // Single romaji word: convert to kana morae, then to romaji chunks
    const kana = toHiragana(cleanTarget);
    const morae = splitKanaIntoMorae(kana, true);
    targetChunks = morae.map(m => toRomaji(m).toLowerCase());
  } else {
    // meaning
    targetChunks = splitMeaningIntoChunks(cleanTarget);
  }

  // Fallback if split produced empty
  if (targetChunks.length === 0) {
    targetChunks = [cleanTarget];
  }

  const distractorCount = calculateDistractorCount(targetChunks.length);
  const distractors: string[] = [];

  if (distractorCount > 0) {
    if (mode === 'kana') {
      const candidates = COMMON_KANA_DISTRACTORS.filter(d => !targetChunks.includes(d));
      const shuffledCandidates = shuffleArray(candidates);
      distractors.push(...shuffledCandidates.slice(0, distractorCount));
    } else if (mode === 'romaji') {
      const candidates = COMMON_ROMAJI_DISTRACTORS.filter(d => !targetChunks.map(c => c.toLowerCase()).includes(d));
      const shuffledCandidates = shuffleArray(candidates);
      distractors.push(...shuffledCandidates.slice(0, distractorCount));
    } else {
      // Meaning distractors
      const generalMeaningWords = ['tidak', 'selalu', 'sudah', 'bisa', 'akan', 'lebih'];
      const candidates = generalMeaningWords.filter(d => !targetChunks.includes(d));
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

