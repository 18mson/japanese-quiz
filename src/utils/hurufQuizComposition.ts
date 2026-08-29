// Composition Engine for Huruf (Hiragana / Katakana / Mix) Mode
import type { MasteryTierKey } from './quizHelpers';
import { getTierFromStreak } from './quizHelpers';

export interface HurufItem {
  character: string;
  romaji: string | string[];
  kana?: string;
  meaning?: string;
  type?: 'basic' | 'dakuten' | 'combination' | string;
  [key: string]: any;
}

export interface HurufQuestion extends HurufItem {
  questionReason: string;
  reasonLabel: string;
  isFirstAppearance: boolean;
  tier: MasteryTierKey;
}

/**
 * Dedicated Tier Weights for Huruf (Hiragana / Katakana / Mix) mode.
 * Continuous stream of new and learning characters without artificial session caps,
 * providing smooth progressive flow for kana mastery.
 */
export const HURUF_TIER_WEIGHTS: Record<MasteryTierKey, number> = {
  new: 40,
  learning: 45,
  mastered: 12,
  crown: 3
};

export const HURUF_TIER_METADATA: Record<MasteryTierKey, { questionReason: string; reasonLabel: string }> = {
  new: {
    questionReason: 'new_letter',
    reasonLabel: '🔴 Belum Terhitung / Belum Benar (Probabilitas 40%)'
  },
  learning: {
    questionReason: 'learning_letter',
    reasonLabel: '🟡 Dalam Proses Belajar (Probabilitas 45%)'
  },
  mastered: {
    questionReason: 'mastered_letter',
    reasonLabel: '🟢 Retensi Hafalan (Probabilitas 12%)'
  },
  crown: {
    questionReason: 'crown_letter',
    reasonLabel: '👑 Crown / Mahkota (Probabilitas 3%)'
  }
};

/**
 * Builds questions for Huruf mode as a continuous probabilistic stream.
 * - Each question is chosen independently based on HURUF_TIER_WEIGHTS per slot.
 * - No duplicates within the initial session questions unless user answers incorrectly (repeat round).
 * - No session pool capping (MAX_NEW_PER_SESSION) or wave preview blocking.
 */
export const buildHurufSessionQuestions = (
  pool: HurufItem[],
  count: number,
  getMasteryStreak: (character: string) => number
): HurufQuestion[] => {
  if (!pool || pool.length === 0) return [];

  const questions: HurufQuestion[] = [];
  let candidatePool = [...pool];

  while (questions.length < count) {
    if (candidatePool.length === 0) {
      const alreadyChosenChars = new Set(questions.map(q => q.character));
      const unchosen = pool.filter(item => !alreadyChosenChars.has(item.character));
      candidatePool = unchosen.length > 0 ? [...unchosen] : [...pool];
    }

    // Count items in each tier within current candidatePool
    const tierCounts: Record<MasteryTierKey, number> = { new: 0, learning: 0, mastered: 0, crown: 0 };
    candidatePool.forEach(item => {
      const streak = getMasteryStreak(item.character);
      const tier = getTierFromStreak(streak);
      tierCounts[tier]++;
    });

    // Compute item weights: w_i = HURUF_TIER_WEIGHTS[tier] / tierCounts[tier]
    const itemWeights = candidatePool.map(item => {
      const streak = getMasteryStreak(item.character);
      const tier = getTierFromStreak(streak);
      const countInTier = tierCounts[tier];
      return countInTier > 0 ? HURUF_TIER_WEIGHTS[tier] / countInTier : 0;
    });

    const totalWeight = itemWeights.reduce((acc, w) => acc + w, 0);

    if (totalWeight <= 0) {
      const index = Math.floor(Math.random() * candidatePool.length);
      const picked = candidatePool.splice(index, 1)[0];
      const streak = getMasteryStreak(picked.character);
      const tier = getTierFromStreak(streak);
      const meta = HURUF_TIER_METADATA[tier] || {
        questionReason: 'letter_practice',
        reasonLabel: 'Latihan Huruf'
      };
      questions.push({
        ...picked,
        tier,
        questionReason: meta.questionReason,
        reasonLabel: meta.reasonLabel,
        isFirstAppearance: true
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
    const meta = HURUF_TIER_METADATA[tier] || {
      questionReason: 'letter_practice',
      reasonLabel: 'Latihan Huruf'
    };
    questions.push({
      ...picked,
      tier,
      questionReason: meta.questionReason,
      reasonLabel: meta.reasonLabel,
      isFirstAppearance: true
    });
  }

  return questions;
};
