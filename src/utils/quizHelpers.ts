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

export const buildSmartAdaptiveQuestions = (
  pool: any[],
  count: number,
  getMasteryStreak: (character: string) => number
): any[] => {
  if (pool.length === 0) return [];

  const weakPool = pool.filter(item => getMasteryStreak(item.character) === 0);
  const learningPool = pool.filter(item => {
    const s = getMasteryStreak(item.character);
    return s >= 1 && s < 3;
  });
  const masteredPool = pool.filter(item => getMasteryStreak(item.character) >= 3);

  // If ALL characters in pool are Mastered (streak >= 3)
  if (masteredPool.length === pool.length) {
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count).map(item => ({
      ...item,
      questionReason: 'all_mastered',
      reasonLabel: '👑 ALL MASTERED — Mode Pengulangan Acak'
    }));
  }

  // Weighted Adaptive Blend: ~60% Weak, ~30% Learning, ~10% Mastered Retention
  const targetWeak = Math.max(1, Math.round(count * 0.6));
  const targetLearning = Math.max(1, Math.round(count * 0.3));
  const targetMastered = Math.max(1, count - targetWeak - targetLearning);

  const pickedWeak = [...weakPool]
    .sort(() => 0.5 - Math.random())
    .slice(0, targetWeak)
    .map(item => ({
      ...item,
      questionReason: 'weak',
      reasonLabel: '🔴 Fokus Latihan (Belum Dipelajari / Sering Salah)'
    }));

  const pickedLearning = [...learningPool]
    .sort(() => 0.5 - Math.random())
    .slice(0, targetLearning)
    .map(item => ({
      ...item,
      questionReason: 'review',
      reasonLabel: '🟡 Penguatan Memori (Dalam Proses)'
    }));

  const pickedMastered = [...masteredPool]
    .sort(() => 0.5 - Math.random())
    .slice(0, targetMastered)
    .map(item => ({
      ...item,
      questionReason: 'retention',
      reasonLabel: '🟢 Uji Retensi (Sudah Hafal)'
    }));

  let combined = [...pickedWeak, ...pickedLearning, ...pickedMastered];

  if (combined.length < count) {
    const pickedChars = new Set(combined.map(c => c.character));
    const remaining = pool
      .filter(c => !pickedChars.has(c.character))
      .sort((a, b) => getMasteryStreak(a.character) - getMasteryStreak(b.character));

    const filled = remaining.slice(0, count - combined.length).map(item => {
      const s = getMasteryStreak(item.character);
      let reason = 'weak';
      let label = '🔴 Fokus Latihan (Belum Dipelajari)';
      if (s >= 3) { reason = 'retention'; label = '🟢 Uji Retensi (Sudah Hafal)'; }
      else if (s >= 1) { reason = 'review'; label = '🟡 Penguatan Memori (Dalam Proses)'; }

      return { ...item, questionReason: reason, reasonLabel: label };
    });

    combined = [...combined, ...filled];
  }

  return combined.sort(() => 0.5 - Math.random()).slice(0, count);
};
