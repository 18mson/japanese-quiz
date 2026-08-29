// Quiz Helper Utilities & Romaji Normalization Engine
import { hiraganaData } from '../data/hiragana';
import { katakanaData } from '../data/katakana';
import { wordsData } from '../data/words';

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
  const targets = Array.isArray(targetRomaji) ? targetRomaji : [targetRomaji];
  return targets.some(t => {
    const normUser = normalizeRomajiForComparison(userInputClean);
    const normTarget = normalizeRomajiForComparison(t);
    if (normUser === normTarget) return false;
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
  if (type === 'words') {
    if (targetDurationMinutes <= 1) return 8;
    if (targetDurationMinutes <= 3) return 24;
    return 40;
  }
  if (targetDurationMinutes <= 1) return 16;
  if (targetDurationMinutes <= 3) return 48;
  return 78;
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
  if (type === 'words') {
    return wordsData.filter(w => {
      const cleanKana = (w.kana || '').replace(/[～ー\-?？\s]/g, '');
      return cleanKana.length > 1;
    });
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

export { HURUF_TIER_WEIGHTS, HURUF_TIER_METADATA, buildHurufSessionQuestions, buildHurufSessionQuestions as buildSmartAdaptiveQuestions } from './hurufQuizComposition';

