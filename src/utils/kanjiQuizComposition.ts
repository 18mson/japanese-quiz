import type { MasteryTierKey } from './quizHelpers';
import { getTierFromStreak } from './quizHelpers';

export interface KanjiItem {
  character: string;
  romaji: string | string[];
  kana?: string;
  meaning?: string;
  type?: string;
  lesson?: string;
  category_word?: string;
  [key: string]: any;
}

export interface KanjiQuestion extends KanjiItem {
  questionReason: string;
  reasonLabel: string;
  isFirstAppearance: boolean;
  tier: MasteryTierKey;
}

/**
 * Tier weights specifically designed for Kanji / Kotoba mode.
 * Balanced weights to encourage steady lesson progression while reviewing active words.
 */
export const KANJI_TIER_WEIGHTS: Record<MasteryTierKey, number> = {
  new: 35,
  learning: 40,
  mastered: 20,
  crown: 5
};

/**
 * Gets dynamic cap for new/unlearned unique words in a single session based on total slots.
 */
export const getMaxNewUniquePerSession = (totalSlots: number): number => {
  return Math.max(2, Math.min(8, Math.round(totalSlots * 0.35)));
};

/**
 * Repetition weight per word based on its mastery tier.
 * Keeps repetition natural (1-2x) to ensure high unique word diversity per session.
 */
export const KANJI_REPEAT_WEIGHT: Record<MasteryTierKey, number> = {
  new: 2,
  learning: 2,
  mastered: 1,
  crown: 1
};

export const KANJI_TIER_METADATA: Record<MasteryTierKey, { questionReason: string; reasonLabel: string }> = {
  new: {
    questionReason: 'new_word',
    reasonLabel: '🔴 Kanji Baru (Fokus Hafalan Awal)'
  },
  learning: {
    questionReason: 'learning_word',
    reasonLabel: '🟡 Dalam Proses Belajar'
  },
  mastered: {
    questionReason: 'mastered_word',
    reasonLabel: '🟢 Retensi Hafalan'
  },
  crown: {
    questionReason: 'crown_word',
    reasonLabel: '👑 Crown Review'
  }
};

/**
 * Selects a rich pool of UNIQUE words for the session.
 * Prioritizes natural lesson progression (Pelajaran 1 -> 2 -> 3...) rather than arbitrary character length.
 */
export const selectKanjiUniquePool = (
  pool: KanjiItem[],
  totalSlots: number,
  getMasteryStreak: (character: string) => number
): { item: KanjiItem; tier: MasteryTierKey }[] => {
  if (!pool || pool.length === 0) return [];

  // Group available candidates by tier
  const tierBuckets: Record<MasteryTierKey, KanjiItem[]> = {
    new: [],
    learning: [],
    mastered: [],
    crown: []
  };

  pool.forEach(item => {
    const streak = getMasteryStreak(item.character);
    const tier = getTierFromStreak(streak);
    tierBuckets[tier].push(item);
  });

  // Sort 'new' tier candidates by lesson order ascending (Pelajaran 1 -> 25)
  tierBuckets.new.sort((a, b) => {
    const numA = parseInt((a.lesson || 'Pelajaran 1').replace(/\D/g, '')) || 1;
    const numB = parseInt((b.lesson || 'Pelajaran 1').replace(/\D/g, '')) || 1;
    if (numA !== numB) return numA - numB;
    return 0;
  });

  // Random shuffle within other buckets for variety
  (['learning', 'mastered', 'crown'] as MasteryTierKey[]).forEach(tier => {
    tierBuckets[tier].sort(() => 0.5 - Math.random());
  });

  // Determine target number of unique words (e.g. 5-6 unique words for 8 slots, 14-16 for 24 slots)
  const targetUniqueCount = Math.max(
    2,
    Math.min(pool.length, Math.max(Math.round(totalSlots * 0.65), Math.min(5, totalSlots)))
  );

  const maxNewCount = getMaxNewUniquePerSession(totalSlots);
  const selectedUnique: { item: KanjiItem; tier: MasteryTierKey }[] = [];
  let newCount = 0;

  // Track remaining items available per tier
  const available: Record<MasteryTierKey, KanjiItem[]> = {
    new: [...tierBuckets.new],
    learning: [...tierBuckets.learning],
    mastered: [...tierBuckets.mastered],
    crown: [...tierBuckets.crown]
  };

  while (selectedUnique.length < targetUniqueCount) {
    // Check which tiers still have candidates and are within caps
    const eligibleTiers = (['new', 'learning', 'mastered', 'crown'] as MasteryTierKey[]).filter(tier => {
      if (available[tier].length === 0) return false;
      if (tier === 'new' && newCount >= maxNewCount) return false;
      return true;
    });

    if (eligibleTiers.length === 0) {
      // If we already reached the max new items cap and have enough items, break
      if (newCount >= maxNewCount && selectedUnique.length >= 2) {
        break;
      }

      // Fallback: pick any remaining item from any tier that still has items
      const fallbackTier = (['learning', 'mastered', 'crown', 'new'] as MasteryTierKey[]).find(
        tier => available[tier].length > 0 && (tier !== 'new' || newCount < maxNewCount)
      );
      if (!fallbackTier) break; // Exhausted eligible items
      const item = available[fallbackTier].shift()!;
      selectedUnique.push({ item, tier: fallbackTier });
      if (fallbackTier === 'new') newCount++;
      continue;
    }

    // Calculate normalized weights for eligible tiers
    const tierWeightsSum = eligibleTiers.reduce((sum, tier) => sum + KANJI_TIER_WEIGHTS[tier], 0);
    const rand = Math.random() * tierWeightsSum;
    let cum = 0;
    let chosenTier: MasteryTierKey = eligibleTiers[0];

    for (const tier of eligibleTiers) {
      cum += KANJI_TIER_WEIGHTS[tier];
      if (rand <= cum) {
        chosenTier = tier;
        break;
      }
    }

    const item = available[chosenTier].shift()!;
    selectedUnique.push({ item, tier: chosenTier });
    if (chosenTier === 'new') newCount++;
  }

  return selectedUnique;
};

/**
 * Distributes repetition slots across unique items proportional to REPEAT_WEIGHT,
 * using Largest Remainder (Hamilton) method to guarantee total slots === totalSlots.
 */
export const distributeKanjiSlots = (
  uniqueList: { item: KanjiItem; tier: MasteryTierKey }[],
  totalSlots: number
): { item: KanjiItem; tier: MasteryTierKey }[] => {
  if (uniqueList.length === 0) return [];
  if (uniqueList.length >= totalSlots) {
    return uniqueList.slice(0, totalSlots);
  }

  const repeatWeights = uniqueList.map(u => KANJI_REPEAT_WEIGHT[u.tier] || 1);
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

    // Sort by remainder descending, tie-break by higher weight
    remainders.sort((a, b) => b.remainder !== a.remainder ? b.remainder - a.remainder : b.weight - a.weight);

    let i = 0;
    while (currentTotal < totalSlots && i < remainders.length) {
      baseCounts[remainders[i].index]++;
      currentTotal++;
      i++;
    }
  } else if (currentTotal > totalSlots) {
    // If over-allocated (due to max(1, ...)), decrement from items with count > 1 and smallest remainder
    const reductionCandidates = quotas.map((q, idx) => ({
      index: idx,
      remainder: q - Math.floor(q),
      count: baseCounts[idx]
    })).filter(c => c.count > 1);

    reductionCandidates.sort((a, b) => a.remainder - b.remainder);

    let i = 0;
    while (currentTotal > totalSlots && i < reductionCandidates.length) {
      baseCounts[reductionCandidates[i].index]--;
      currentTotal--;
      i++;
    }
  }

  // Expand into flat array of slots
  const expandedSlots: { item: KanjiItem; tier: MasteryTierKey }[] = [];
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
 * Uses retry-shuffle with greedy interleaving fallback to guarantee optimal spacing.
 */
export const shuffleWithSpacingConstraint = (
  slots: { item: KanjiItem; tier: MasteryTierKey }[],
  maxAttempts: number = 200
): { item: KanjiItem; tier: MasteryTierKey }[] => {
  if (slots.length <= 1) return [...slots];

  const isValidSpacing = (arr: { item: KanjiItem; tier: MasteryTierKey }[]): boolean => {
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i].item.character === arr[i + 1].item.character) {
        return false;
      }
    }
    return true;
  };

  const countCollisions = (arr: { item: KanjiItem; tier: MasteryTierKey }[]): number => {
    let collisions = 0;
    for (let i = 0; i < arr.length - 1; i++) {
      if (arr[i].item.character === arr[i + 1].item.character) {
        collisions++;
      }
    }
    return collisions;
  };

  let bestArrangement = [...slots];
  let minCollisions = countCollisions(bestArrangement);

  // 1. Randomized Fisher-Yates with retry
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const shuffled = [...slots];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    if (isValidSpacing(shuffled)) {
      return shuffled;
    }

    const collisions = countCollisions(shuffled);
    if (collisions < minCollisions) {
      minCollisions = collisions;
      bestArrangement = shuffled;
    }
  }

  // 2. Greedy bucket interleave if random shuffle didn't find 0 collisions
  const groups: Record<string, { item: KanjiItem; tier: MasteryTierKey }[]> = {};
  slots.forEach(s => {
    const k = s.item.character;
    if (!groups[k]) groups[k] = [];
    groups[k].push(s);
  });

  // Sort groups by size descending
  const sortedGroupKeys = Object.keys(groups).sort((a, b) => groups[b].length - groups[a].length);
  const interleaved: { item: KanjiItem; tier: MasteryTierKey }[] = [];
  const maxGroupLen = groups[sortedGroupKeys[0]].length;

  for (let round = 0; round < maxGroupLen; round++) {
    for (const key of sortedGroupKeys) {
      if (round < groups[key].length) {
        interleaved.push(groups[key][round]);
      }
    }
  }

  if (isValidSpacing(interleaved) || countCollisions(interleaved) < minCollisions) {
    return interleaved;
  }

  return bestArrangement;
};

/**
 * Assigns question metadata and sets isFirstAppearance = true ONLY on the first appearance
 * of each word in the session.
 */
export const assignFirstAppearanceFlags = (
  slots: { item: KanjiItem; tier: MasteryTierKey }[]
): KanjiQuestion[] => {
  const seenCharacters = new Set<string>();

  return slots.map(slot => {
    const char = slot.item.character;
    const isFirst = !seenCharacters.has(char);
    if (isFirst) {
      seenCharacters.add(char);
    }

    const meta = KANJI_TIER_METADATA[slot.tier] || {
      questionReason: 'word_practice',
      reasonLabel: 'Latihan Kanji'
    };

    return {
      ...slot.item,
      type: 'word',
      tier: slot.tier,
      isFirstAppearance: isFirst,
      questionReason: meta.questionReason,
      reasonLabel: meta.reasonLabel
    };
  });
};

/**
 * Master composition function for Kanji / Kotoba typing mode.
 * 1. Selects unique pool (max 2 new words, weighted by KANJI_TIER_WEIGHTS).
 * 2. Distributes 8 slots proportional to REPEAT_WEIGHT.
 * 3. Shuffles with spacing constraint (|idx1 - idx2| >= 2).
 * 4. Assigns isFirstAppearance flag.
 */
export const buildKanjiSessionQuestions = (
  pool: KanjiItem[],
  totalSlots: number,
  getMasteryStreak: (character: string) => number
): KanjiQuestion[] => {
  if (!pool || pool.length === 0) return [];

  // 1. Select unique pool
  const uniquePool = selectKanjiUniquePool(pool, totalSlots, getMasteryStreak);
  if (uniquePool.length === 0) return [];

  // 2. Distribute repetition slots
  const distributedSlots = distributeKanjiSlots(uniquePool, totalSlots);

  // 3. Shuffle with spacing constraint
  const spacedSlots = shuffleWithSpacingConstraint(distributedSlots, 100);

  // 4. Assign isFirstAppearance flags and metadata
  return assignFirstAppearanceFlags(spacedSlots);
};
