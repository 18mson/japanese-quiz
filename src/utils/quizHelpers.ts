// Quiz Helper Utilities & Romaji Normalization Engine
import { hiraganaData } from '../data/hiragana';
import { katakanaData } from '../data/katakana';
import { wordsData } from '../data/words';

export const normalizeRomajiForComparison = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]/g, '') // ignore all spaces, punctuation, symbols, and hyphens
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

export const getQuestionCountFromDuration = (targetDurationMinutes: number): number => {
  if (targetDurationMinutes <= 1) return 8;  // ~1 minute session
  if (targetDurationMinutes <= 3) return 22; // ~3 minute session
  return 35;                                 // ~5 minute session
};

export const getFallbackLocalPool = (type: string, level: string): any[] => {
  if (type === 'hiragana') {
    return level === 'basic' ? hiraganaData.filter(c => c.type === 'basic') : hiraganaData;
  }
  if (type === 'katakana') {
    return level === 'basic' ? katakanaData.filter(k => k.type === 'basic') : katakanaData;
  }
  if (type === 'words') {
    const multiCharWords = wordsData.filter(w => {
      const cleanKana = (w.kana || '').replace(/[～ー\-?？\s]/g, '');
      return cleanKana.length > 1;
    });
    return level === 'basic' ? multiCharWords.filter(w => !/[\u4e00-\u9faf\u3400-\u4dbf]/.test(w.character)) : multiCharWords;
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

const TIER_WEIGHTS: Record<MasteryTierKey, number> = {
  new: 45,       // Belum (45%)
  learning: 45,  // Proses (45%)
  mastered: 9,   // Hafalan (9%)
  crown: 1       // Crown (1% - Sangat jarang)
};

const TIER_METADATA: Record<MasteryTierKey, { questionReason: string; reasonLabel: string }> = {
  new: {
    questionReason: 'weak',
    reasonLabel: '🔴 Belum Terhitung / Belum Benar (Probabilitas 45%)'
  },
  learning: {
    questionReason: 'review',
    reasonLabel: '🟡 Dalam Proses (Probabilitas 45%)'
  },
  mastered: {
    questionReason: 'retention',
    reasonLabel: '🟢 Hafalan (Probabilitas 9%)'
  },
  crown: {
    questionReason: 'crown',
    reasonLabel: '👑 Crown / Mahkota (Sangat Jarang - Probabilitas 1%)'
  }
};

export const buildSmartAdaptiveQuestions = (
  pool: any[],
  count: number,
  getMasteryStreak: (character: string) => number
): any[] => {
  if (!pool || pool.length === 0) return [];

  const questions: any[] = [];
  let candidatePool = [...pool];

  while (questions.length < count) {
    if (candidatePool.length === 0) {
      candidatePool = [...pool];
    }

    // Count items in each tier within current candidatePool
    const tierCounts: Record<MasteryTierKey, number> = { new: 0, learning: 0, mastered: 0, crown: 0 };
    candidatePool.forEach(item => {
      const streak = getMasteryStreak(item.character);
      const tier = getTierFromStreak(streak);
      tierCounts[tier]++;
    });

    // Compute item weights: w_i = TIER_WEIGHTS[tier] / tierCounts[tier]
    const itemWeights = candidatePool.map(item => {
      const streak = getMasteryStreak(item.character);
      const tier = getTierFromStreak(streak);
      const countInTier = tierCounts[tier];
      return countInTier > 0 ? TIER_WEIGHTS[tier] / countInTier : 0;
    });

    const totalWeight = itemWeights.reduce((acc, w) => acc + w, 0);

    if (totalWeight <= 0) {
      const index = Math.floor(Math.random() * candidatePool.length);
      const picked = candidatePool.splice(index, 1)[0];
      const streak = getMasteryStreak(picked.character);
      const tier = getTierFromStreak(streak);
      questions.push({
        ...picked,
        questionReason: TIER_METADATA[tier].questionReason,
        reasonLabel: TIER_METADATA[tier].reasonLabel
      });
      continue;
    }

    // Weighted random selection
    const randomVal = Math.random() * totalWeight;
    let cumulative = 0;
    let selectedIndex = 0;

    for (let i = 0; i < itemWeights.length; i++) {
      cumulative += itemWeights[i];
      if (randomVal <= cumulative) {
        selectedIndex = i;
        break;
      }
    }

    const picked = candidatePool.splice(selectedIndex, 1)[0];
    const streak = getMasteryStreak(picked.character);
    const tier = getTierFromStreak(streak);
    questions.push({
      ...picked,
      questionReason: TIER_METADATA[tier].questionReason,
      reasonLabel: TIER_METADATA[tier].reasonLabel
    });
  }

  return questions;
};
