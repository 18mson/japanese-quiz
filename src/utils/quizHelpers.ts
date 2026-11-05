// Quiz Helper Utilities & Romaji Normalization Engine
import { hiraganaData } from '../data/hiragana';
import { katakanaData } from '../data/katakana';
import { wordsData } from '../data/words';
import { kanjiN5Data } from '../data/kanji';
import { kanjiWritingEntriesMap } from '../data/kanjiWritingPrompts';
import * as wanakana from 'wanakana';

export const normalizeRomajiForComparison = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/\(.*?\)|（.*?）/g, '') // ignore optional parenthetical readings e.g. (どなた)
    .replace(/[^a-z0-9]/g, '') // ignore all spaces, punctuation, symbols, and hyphens
    .replace(/ha/g, 'wa')  // particle 'ha' and 'wa' normalized equally (watashi ha / watashi wa)
    .replace(/nn/g, 'n')  // normalize double n to single n
    .replace(/tsu/g, 'tu') // normalize tsu/tu
    .replace(/shi/g, 'si') // normalize shi/si
    .replace(/chi/g, 'ti') // normalize chi/ti
    .replace(/ji/g, 'zi')  // normalize ji/zi
    .replace(/ou/g, 'o')   // normalize long vowels ou -> o
    .replace(/oo/g, 'o')   // normalize long vowels oo -> o
    .replace(/sh/g, 'sy')  // normalize sha/sho/shu
    .replace(/ch/g, 'ty')  // normalize cha/cho/chu
    .replace(/j/g, 'zy');   // normalize ja/jo/ju
};

export const getLevenshteinDistance = (a: string, b: string): number => {
  const tmp: number[][] = [];
  let i: number, j: number;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
};

export const checkIsCorrect = (userInputClean: string, targetRomaji: string | string[]): boolean => {
  const targets = Array.isArray(targetRomaji) ? targetRomaji : [targetRomaji];
  return targets.some(t => {
    return normalizeRomajiForComparison(userInputClean) === normalizeRomajiForComparison(t);
  });
};

export const checkIsTypo = (userInputClean: string, targetRomaji: string | string[]): boolean => {
  if (!userInputClean || userInputClean.trim() === '') return false;
  // If the user's input already matches any valid romaji target, it is 100% correct, never a typo
  if (checkIsCorrect(userInputClean, targetRomaji)) return false;

  const targets = Array.isArray(targetRomaji) ? targetRomaji : [targetRomaji];
  const normUser = normalizeRomajiForComparison(userInputClean);
  if (!normUser) return false;

  return targets.some(t => {
    const normTarget = normalizeRomajiForComparison(t);
    if (!normTarget || normUser === normTarget) return false;
    const dist = getLevenshteinDistance(normUser, normTarget);
    return dist === 1;
  });
};

export const getQuestionCountFromDuration = (targetDurationMinutes: number, type: string = 'hiragana'): number => {
  if (type === 'kaiwa') {
    return 1; // 1 whole dialog
  }
  if (type === 'renshuu') {
    if (targetDurationMinutes <= 1) return 6;
    if (targetDurationMinutes <= 3) return 14;
    return 25;
  }
  if (['words', 'words_meaning', 'meaning_to_words', 'kanji'].includes(type)) {
    if (targetDurationMinutes <= 1) return 8;
    if (targetDurationMinutes <= 3) return 24;
    return 40;
  }
  if (targetDurationMinutes <= 1) return 16;
  if (targetDurationMinutes <= 3) return 48;
  return 78;
};

/**
 * Extracts multiple normalized candidate phrases from an Indonesian meaning string.
 * Handles synonyms separated by /, ;, or commas, as well as parenthesized notes.
 */
export const extractMeaningCandidates = (raw: string): string[] => {
  if (!raw) return [];
  const results = new Set<string>();

  const cleanBase = (s: string) => s
    .toLowerCase()
    .replace(/[~～.。!！?？\"'“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  const addWithVariants = (s: string) => {
    const c = cleanBase(s);
    if (!c || c.length < 2) return;
    results.add(c);
    if (c.includes('-')) {
      results.add(cleanBase(c.replace(/-/g, ' ')));
      results.add(cleanBase(c.replace(/-/g, '')));
      // Reduplication support: e.g. "sendiri-sendiri" also accepts "sendiri"
      const parts = c.split('-');
      if (parts[0] && parts[0].length >= 3) {
        results.add(cleanBase(parts[0]));
      }
    }
  };

  // 1. Direct raw clean
  addWithVariants(raw);

  // 2. Remove parenthesized text
  const noParens = cleanBase(raw.replace(/\(.*?\)|（.*?）|\[.*?\]|【.*?】/g, ''));
  if (noParens) addWithVariants(noParens);

  // 3. Extract text inside parentheses as possible synonym or colon phrase
  const parenMatches = raw.match(/\((.*?)\)|（(.*?)）|\[(.*?)\]|【.*?】/g);
  if (parenMatches) {
    for (const m of parenMatches) {
      const inner = m.slice(1, -1);
      if (inner.includes(':')) {
        const afterColon = inner.split(':')[1];
        if (afterColon) addWithVariants(afterColon);
      } else if (
        !inner.includes('dekat') && 
        !inner.includes('sebagai') && 
        !inner.includes('sopan') && 
        !inner.includes('profesi') && 
        inner.length < 30
      ) {
        addWithVariants(inner);
      }
    }
  }

  // 4. Split by delimiters /, ;, comma, or ' atau '
  const splitChunks = (str: string) => {
    const parts = str.split(/[/;,\n]| atau /i);
    for (const p of parts) {
      addWithVariants(p);
      const pNoParen = p.replace(/\(.*?\)|（.*?）|\[.*?\]|【.*?】/g, '');
      addWithVariants(pNoParen);
    }
  };

  splitChunks(raw);
  if (noParens) splitChunks(noParens);

  return Array.from(results).filter(Boolean);
};

export const checkIsMeaningCorrect = (userInput: string, targetMeaning: string): boolean => {
  if (!userInput || !targetMeaning) return false;
  const cleanUser = userInput
    .toLowerCase()
    .replace(/[~～.。!！?？\"'“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanUser) return false;

  const candidates = extractMeaningCandidates(targetMeaning);
  if (candidates.some(c => c === cleanUser)) return true;

  const cleanUserNoHyphen = cleanUser.replace(/-/g, ' ');
  if (candidates.some(c => c === cleanUserNoHyphen)) return true;

  return false;
};

export const checkIsMeaningTypo = (userInput: string, targetMeaning: string): boolean => {
  if (!userInput || !targetMeaning) return false;
  if (checkIsMeaningCorrect(userInput, targetMeaning)) return false;

  const cleanUser = userInput
    .toLowerCase()
    .replace(/[~～.。!！?？\"'“”]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleanUser || cleanUser.length < 3) return false;

  const candidates = extractMeaningCandidates(targetMeaning);
  return candidates.some(c => {
    if (c.length >= 4) {
      const dist = getLevenshteinDistance(cleanUser, c);
      return dist === 1;
    }
    return false;
  });
};

export const checkIsJapaneseCorrect = (
  userInput: string,
  word: { character: string; kana?: string; romaji: string | string[] }
): boolean => {
  if (!userInput || !word) return false;
  const rawClean = userInput.trim().replace(/[\s\u3000。、！？.,!?~～\-—_–/\\()（）「」『』\"':;\`]/g, '');
  if (!rawClean) return false;

  // 1. Direct character match (Kanji or Kana)
  const targetCharClean = word.character.replace(/[\s\u3000。、！？.,!?~～\-—_–/\\()（）「」『』\"':;\`]/g, '');
  if (rawClean === targetCharClean) return true;

  // 2. Direct Kana match
  if (word.kana) {
    const targetKanaClean = word.kana.replace(/[\s\u3000。、！？.,!?~～\-—_–/\\()（）「」『』\"':;\`]/g, '');
    if (rawClean === targetKanaClean) return true;
    if (wanakana.toHiragana(rawClean) === wanakana.toHiragana(targetKanaClean)) return true;
  }

  // 3. Convert user input to Hiragana and compare with target Kana or Character
  const inputAsHiragana = wanakana.toHiragana(rawClean);
  if (word.kana && inputAsHiragana === word.kana) return true;
  if (inputAsHiragana === targetCharClean) return true;

  // 4. Romaji match (using existing robust normalizeRomajiForComparison)
  if (checkIsCorrect(rawClean, word.romaji)) return true;

  // 5. User input converted to Romaji compared to target romaji
  const inputAsRomaji = wanakana.toRomaji(rawClean);
  if (checkIsCorrect(inputAsRomaji, word.romaji)) return true;

  return false;
};

export const checkIsJapaneseTypo = (
  userInput: string,
  word: { character: string; kana?: string; romaji: string | string[] }
): boolean => {
  if (!userInput || userInput.trim() === '') return false;
  if (checkIsJapaneseCorrect(userInput, word)) return false;

  const rawClean = userInput.trim().replace(/[\s\u3000。、！？.,!?~～\-—_–/\\()（）「」『』\"':;\`]/g, '');
  if (!rawClean) return false;

  // 1. Check romaji typo
  if (checkIsTypo(rawClean, word.romaji)) return true;

  // 2. Check kana typo
  if (word.kana) {
    const inputHiragana = wanakana.toHiragana(rawClean);
    const targetHiragana = wanakana.toHiragana(word.kana);
    if (targetHiragana.length >= 3 && getLevenshteinDistance(inputHiragana, targetHiragana) === 1) {
      return true;
    }
  }

  return false;
};

export const getFallbackLocalPool = (type: string, _level: string = 'basic'): any[] => {
  if (type === 'hiragana') {
    // Selalu return semua hiragana (basic + dakuten + combination)
    return hiraganaData;
  }
  if (type === 'katakana') {
    // Selalu return semua katakana (basic + dakuten + combination)
    return katakanaData;
  }
  if (type === 'mix') {
    return [...hiraganaData, ...katakanaData];
  }
  if (['words', 'words_meaning', 'meaning_to_words'].includes(type)) {
    return wordsData.filter(w => !!w.character && w.character.trim().length > 0);
  }
  if (type === 'kanji') {
    return kanjiN5Data;
  }
  return [];
};

export type MasteryTierKey = 'new' | 'learning' | 'mastered' | 'crown';

export const getTierFromStreak = (streak: number): MasteryTierKey => {
  if (streak >= 5) return 'crown';
  if (streak >= 3) return 'mastered';
  if (streak >= 1) return 'learning';
  return 'new';
};

export const buildRepeatedQuestion = (current: any): any => {
  let repeated = { ...current, questionReason: 'repeat', reasonLabel: 'Babak Perbaikan: Ulang Sampai Benar', isFirstAppearance: false };
  if (current.type === 'kanji') {
    const entry = kanjiWritingEntriesMap[current.character];
    if (entry && entry.prompts.length > 1) {
      const others = entry.prompts.filter(p => p.word !== current.fullWord);
      if (others.length > 0) {
        const newPrompt = others[Math.floor(Math.random() * others.length)];
        repeated = {
          ...repeated,
          romaji: newPrompt.targetKana,
          kana: newPrompt.fullKana,
          fullWord: newPrompt.word,
          prefixKana: newPrompt.prefixKana,
          targetKana: newPrompt.targetKana,
          suffixKana: newPrompt.suffixKana,
          meaning: newPrompt.meaning
        };
      }
    }
  }
  return repeated;
};

