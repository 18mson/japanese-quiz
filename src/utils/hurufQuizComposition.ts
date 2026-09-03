// Composition Engine for Huruf (Hiragana / Katakana / Mix) Mode
import type { MasteryTierKey } from './quizHelpers';
import { getTierFromStreak } from './quizHelpers';
import { sortInGojuonOrder } from '../data/gojuonOrder';

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
 * Tier weights for Huruf mode.
 */
export const HURUF_TIER_WEIGHTS: Record<MasteryTierKey, number> = {
  new: 40,
  learning: 45,
  mastered: 12,
  crown: 3
};

/**
 * Repetition weight per letter based on its mastery tier.
 * New and learning letters get higher repetition so learners reinforce memory.
 */
export const HURUF_REPEAT_WEIGHT: Record<MasteryTierKey, number> = {
  new: 3,
  learning: 2,
  mastered: 1,
  crown: 1
};

export const HURUF_TIER_METADATA: Record<MasteryTierKey, { questionReason: string; reasonLabel: string }> = {
  new: {
    questionReason: 'new_letter',
    reasonLabel: '🔴 Huruf Baru (Fokus Hafalan Awal)'
  },
  learning: {
    questionReason: 'learning_letter',
    reasonLabel: '🟡 Dalam Proses Belajar'
  },
  mastered: {
    questionReason: 'mastered_letter',
    reasonLabel: '🟢 Retensi Hafalan'
  },
  crown: {
    questionReason: 'crown_letter',
    reasonLabel: '👑 Crown / Mahkota'
  }
};

/**
 * Selects a targeted pool of UNIQUE letters for the session.
 * Rules:
 * 1. Max 5 new letters per game (3 to 5 letters per batch, e.g. Gojuon row).
 * 2. If there are already many letters in progress (learning count >= 3), DO NOT introduce new letters yet (focus on learning/review).
 * 3. For first-time play (all letters are new), take the first 5 new letters (e.g. あいうえお), and repeat them throughout the session.
 * 4. In subsequent games, dynamically mixes new letters (if capacity allows), learning letters, and mastered retention letters.
 */
export const selectHurufUniquePool = (
  pool: HurufItem[],
  totalSlots: number,
  getMasteryStreak: (character: string) => number,
  introducedCharsMap: Record<string, boolean> = {}
): { item: HurufItem; tier: MasteryTierKey }[] => {
  if (!pool || pool.length === 0) return [];

  // Group pool items by tier
  const tierBuckets: Record<MasteryTierKey, HurufItem[]> = {
    new: [],
    learning: [],
    mastered: [],
    crown: []
  };

  pool.forEach(item => {
    const streak = getMasteryStreak(item.character);
    const isIntroduced = !!introducedCharsMap[item.character];
    let tier = getTierFromStreak(streak);
    // If streak is 0 but item was already introduced/practiced before, it is in learning/recovery tier, not brand new
    if (streak === 0 && isIntroduced) {
      tier = 'learning';
    }
    tierBuckets[tier].push(item);
  });

  // Sort 'new' tier candidates by Gojūon curriculum order (a -> ka -> sa -> ta -> na ...)
  tierBuckets.new = sortInGojuonOrder(tierBuckets.new);

  // Shuffle learning and review buckets for natural variety
  (['learning', 'mastered', 'crown'] as MasteryTierKey[]).forEach(tier => {
    tierBuckets[tier].sort(() => 0.5 - Math.random());
  });

  const learningCount = tierBuckets.learning.length;
  const masteredCount = tierBuckets.mastered.length + tierBuckets.crown.length;
  const newCountAvailable = tierBuckets.new.length;

  // SCENARIO 1: First time playing in this category (no learning letters, no mastered letters)
  if (learningCount === 0 && masteredCount === 0) {
    // Pick the first batch of 5 new letters (or whatever remains up to 5)
    const initialNewCount = Math.min(5, newCountAvailable);
    const firstBatch = tierBuckets.new.slice(0, initialNewCount);
    return firstBatch.map(item => ({ item, tier: 'new' as MasteryTierKey }));
  }

  // SCENARIO 2 & 3: Subsequent games
  // Rule: Do NOT introduce new letters if user has >= 3 letters still in learning progress
  let maxNewCount = 0;
  if (learningCount < 3 && newCountAvailable > 0) {
    // Capacity allows new letters: batch size between 3 and 5 (standard Gojūon row size)
    const batchSize = Math.min(5, Math.max(3, 5 - learningCount));
    // If remaining new letters in pool is small (< 3), allow taking whatever is left
    maxNewCount = Math.min(newCountAvailable, newCountAvailable < 3 ? newCountAvailable : batchSize);
  }

  // Determine target unique letters for this session (e.g. 5-7 unique letters for 8 slots, 8-12 for 22 slots)
  const targetUniqueCount = Math.max(
    3,
    Math.min(pool.length, Math.max(Math.round(totalSlots * 0.6), Math.min(5, totalSlots)))
  );

  const selectedUnique: { item: HurufItem; tier: MasteryTierKey }[] = [];
  const selectedChars = new Set<string>();

  // 1. Add new letters batch (if eligible)
  if (maxNewCount > 0) {
    const newBatch = tierBuckets.new.slice(0, maxNewCount);
    newBatch.forEach(item => {
      selectedUnique.push({ item, tier: 'new' });
      selectedChars.add(item.character);
    });
  }

  // 2. Add learning letters (top priority to reinforce)
  tierBuckets.learning.forEach(item => {
    if (!selectedChars.has(item.character) && selectedUnique.length < targetUniqueCount) {
      selectedUnique.push({ item, tier: 'learning' });
      selectedChars.add(item.character);
    }
  });

  // 3. Fill remaining slots with Mastered & Crown letters for long-term retention
  const reviewPool = [...tierBuckets.mastered, ...tierBuckets.crown];
  reviewPool.forEach(item => {
    if (!selectedChars.has(item.character) && selectedUnique.length < targetUniqueCount) {
      const streak = getMasteryStreak(item.character);
      const tier = getTierFromStreak(streak);
      selectedUnique.push({ item, tier });
      selectedChars.add(item.character);
    }
  });

  // 4. Fallback if still under minimum unique count
  if (selectedUnique.length < Math.min(pool.length, 3)) {
    pool.forEach(item => {
      if (!selectedChars.has(item.character) && selectedUnique.length < targetUniqueCount) {
        const streak = getMasteryStreak(item.character);
        const isIntroduced = !!introducedCharsMap[item.character];
        let tier = getTierFromStreak(streak);
        if (streak === 0 && isIntroduced) tier = 'learning';
        selectedUnique.push({ item, tier });
        selectedChars.add(item.character);
      }
    });
  }

  return selectedUnique;
};

/**
 * Distributes repetition slots across unique items proportional to REPEAT_WEIGHT,
 * using Largest Remainder (Hamilton) method to guarantee total slots === totalSlots.
 */
export const distributeHurufSlots = (
  uniqueList: { item: HurufItem; tier: MasteryTierKey }[],
  totalSlots: number
): { item: HurufItem; tier: MasteryTierKey }[] => {
  if (uniqueList.length === 0) return [];
  if (uniqueList.length >= totalSlots) {
    return uniqueList.slice(0, totalSlots);
  }

  const repeatWeights = uniqueList.map(u => HURUF_REPEAT_WEIGHT[u.tier] || 1);
  const sumWeights = repeatWeights.reduce((a, b) => a + b, 0);

  // Largest remainder allocation
  const quotas = repeatWeights.map(w => (w / sumWeights) * totalSlots);
  const baseCounts = quotas.map(q => Math.max(1, Math.floor(q)));
  let currentTotal = baseCounts.reduce((a, b) => a + b, 0);

  if (currentTotal < totalSlots) {
    const remainders = quotas.map((q, idx) => ({
      index: idx,
      remainder: q - Math.floor(q),
      weight: repeatWeights[idx]
    }));

    remainders.sort((a, b) => (b.remainder !== a.remainder ? b.remainder - a.remainder : b.weight - a.weight));

    let i = 0;
    while (currentTotal < totalSlots && i < remainders.length) {
      baseCounts[remainders[i].index]++;
      currentTotal++;
      i++;
    }
  } else if (currentTotal > totalSlots) {
    const reductionCandidates = quotas
      .map((q, idx) => ({
        index: idx,
        remainder: q - Math.floor(q),
        count: baseCounts[idx]
      }))
      .filter(c => c.count > 1);

    reductionCandidates.sort((a, b) => a.remainder - b.remainder);

    let i = 0;
    while (currentTotal > totalSlots && i < reductionCandidates.length) {
      baseCounts[reductionCandidates[i].index]--;
      currentTotal--;
      i++;
    }
  }

  // Expand into flat array of slots
  const expandedSlots: { item: HurufItem; tier: MasteryTierKey }[] = [];
  uniqueList.forEach((u, idx) => {
    const count = baseCounts[idx];
    for (let c = 0; c < count; c++) {
      expandedSlots.push({ ...u });
    }
  });

  return expandedSlots;
};

/**
 * Shuffles items ensuring no identical character appears with distance < 2
 * (i.e. identical characters cannot be in adjacent slots: |idx_a - idx_b| >= 2).
 */
export const shuffleWithSpacingConstraint = (
  slots: { item: HurufItem; tier: MasteryTierKey }[],
  maxAttempts: number = 200
): { item: HurufItem; tier: MasteryTierKey }[] => {
  if (slots.length <= 1) return [...slots];


  const countCollisions = (arr: { item: HurufItem; tier: MasteryTierKey }[]): number => {
    let collisions = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i].item.character === arr[i + 1].item.character) {
        collisions++;
      }
    }
    return collisions;
  };

  let bestArr = [...slots];
  let minCollisions = countCollisions(bestArr);

  if (minCollisions === 0) return bestArr;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = [...slots].sort(() => 0.5 - Math.random());
    const collisions = countCollisions(candidate);
    if (collisions === 0) {
      return candidate;
    }
    if (collisions < minCollisions) {
      minCollisions = collisions;
      bestArr = candidate;
    }
  }

  // Greedy interleaving fallback
  const charGroups: Record<string, { item: HurufItem; tier: MasteryTierKey }[]> = {};
  slots.forEach(s => {
    const key = s.item.character;
    if (!charGroups[key]) charGroups[key] = [];
    charGroups[key].push(s);
  });

  const sortedKeys = Object.keys(charGroups).sort((a, b) => charGroups[b].length - charGroups[a].length);
  const result: { item: HurufItem; tier: MasteryTierKey }[] = new Array(slots.length);
  let pos = 0;

  sortedKeys.forEach(k => {
    const group = charGroups[k];
    group.forEach(item => {
      if (pos >= slots.length) {
        pos = 1;
      }
      result[pos] = item;
      pos += 2;
    });
  });

  const compactResult = result.filter(Boolean);
  return compactResult.length === slots.length ? compactResult : bestArr;
};

/**
 * Builds questions for Huruf mode:
 * - Smart selection of unique pool with Gojūon curriculum order.
 * - Caps new letters at max 5 per game (min 3, max 5).
 * - Suppresses new letters if user has >= 3 letters in progress (learning).
 * - Repeats the 5 new letters across the session for beginners.
 * - Enforces repetition weights and adjacent spacing constraint.
 */
export const buildHurufSessionQuestions = (
  pool: HurufItem[],
  count: number,
  getMasteryStreak: (character: string) => number,
  introducedCharsMap: Record<string, boolean> = {}
): HurufQuestion[] => {
  if (!pool || pool.length === 0) return [];

  const uniquePool = selectHurufUniquePool(pool, count, getMasteryStreak, introducedCharsMap);
  const distributedSlots = distributeHurufSlots(uniquePool, count);
  const finalOrderedSlots = shuffleWithSpacingConstraint(distributedSlots);

  const seenCharacters = new Set<string>();

  return finalOrderedSlots.map(slot => {
    const isFirstAppearance = !seenCharacters.has(slot.item.character);
    seenCharacters.add(slot.item.character);

    const meta = HURUF_TIER_METADATA[slot.tier] || {
      questionReason: 'letter_practice',
      reasonLabel: 'Latihan Huruf'
    };

    return {
      ...slot.item,
      tier: slot.tier,
      questionReason: meta.questionReason,
      reasonLabel: meta.reasonLabel,
      isFirstAppearance
    };
  });
};
