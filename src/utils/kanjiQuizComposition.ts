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
  sub_category?: string;
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
  learning: 55,
  new: 25,
  mastered: 15,
  crown: 5
};

/**
 * Gets dynamic cap for new/unlearned unique words in a single session based on total slots
 * and current learning queue size:
 * - > 30 words in learning queue : TIDAK MASUK POOL (0 new words)
 * - > 15 words in learning queue : MASUK UNDIAN BERTAHAP (max 1 new word per 8 slots)
 * - <= 15 words in learning queue: NORMAL UNDIAN (2-3 new words per 8 slots)
 */
export const getMaxNewUniquePerSession = (
  totalSlots: number,
  learningQueueCount: number = 0
): number => {
  // 1. > 30 kata dalam antrean proses: tidak masuk pool
  if (learningQueueCount > 30) {
    return 0;
  }

  // 2. > 15 kata dalam antrean proses: masuk undian pool bertahap
  if (learningQueueCount > 15) {
    return Math.max(1, Math.min(3, Math.round(totalSlots * 0.15)));
  }

  // 3. <= 15 kata dalam antrean proses: normal undian
  return Math.max(2, Math.min(8, Math.round(totalSlots * 0.35)));
};

/**
 * Repetition weight per word based on its mastery tier.
 * Gives learning words higher repetition weight (3) to dominate quiz sessions
 * and accelerate mastery before new words are introduced.
 */
export const KANJI_REPEAT_WEIGHT: Record<MasteryTierKey, number> = {
  learning: 3,
  new: 1.5,
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
 * Parses lesson number integer from a lesson string (e.g. 'Pelajaran 5' -> 5).
 */
export const parseLessonNumber = (lesson?: string): number => {
  if (!lesson) return 1;
  const match = lesson.match(/\d+/);
  return match ? parseInt(match[0], 10) : 1;
};

/**
 * Detects the highest active lesson number from candidates where the player has streak > 0.
 */
export const getHighestActiveLessonNumber = (
  pool: KanjiItem[],
  getMasteryStreak: (character: string) => number,
  fallbackLesson: number = 1
): number => {
  let highest = fallbackLesson;
  for (const item of pool) {
    if (getMasteryStreak(item.character) > 0) {
      const num = parseLessonNumber(item.lesson);
      if (num > highest) {
        highest = num;
      }
    }
  }
  return highest;
};

/**
 * Calculates selection weight for a candidate item in 'learning' (Proses) tier.
 * Words from earlier lessons that are lagging behind the user's current progress
 * get a significantly higher probability of being sampled.
 *
 * Formula:
 * lag = Math.max(0, currentLesson - itemLesson)
 * weight = (1 + lag * lagMultiplier) * streakUrgencyMultiplier
 */
/**
 * Calculates selection weight for a candidate item in 'learning' (Proses) tier.
 * Words from earlier lessons that are lagging behind the user's current progress
 * get an exponentially higher probability of being sampled (power-law scaling: (1 + lag)^3).
 *
 * Formula:
 * lag = Math.max(0, currentLesson - itemLesson)
 * baseLagWeight = Math.pow(1 + lag, power)
 * weight = baseLagWeight * streakUrgencyMultiplier
 */
export const calculateLearningItemWeight = (
  item: KanjiItem,
  currentLesson: number,
  streak: number,
  power: number = 3.0
): number => {
  const itemLesson = parseLessonNumber(item.lesson);
  const lag = Math.max(0, currentLesson - itemLesson);

  // Semakin tertinggal dari bab aktif saat ini, semakin tinggi bobotnya (power-law scaling: (1 + lag)^3)
  // Contoh jika currentLesson = 11:
  // - Bab 11 (lag 0): 1^3 = 1
  // - Bab 10 (lag 1): 2^3 = 8
  // - Bab 9  (lag 2): 3^3 = 27
  // - Bab 8  (lag 3): 4^3 = 64
  // - Bab 7  (lag 4): 5^3 = 125
  // - Bab 6  (lag 5): 6^3 = 216
  // - Bab 5  (lag 6): 7^3 = 343
  const baseLagWeight = Math.pow(1 + lag, power);

  // Streak 1 (baru gagal / typo / baru turun) memiliki urgensi lebih tinggi dari streak 2
  const streakMultiplier = streak <= 1 ? 1.5 : 1.0;

  return baseLagWeight * streakMultiplier;
};

/**
 * Picks an item from learning array using Weighted Random Sampling (Roulette Wheel Selection),
 * then removes it from the array in-place.
 */
export const pickWeightedLearningItem = (
  items: KanjiItem[],
  currentLesson: number,
  getMasteryStreak: (character: string) => number,
  power: number = 3.0
): KanjiItem | null => {
  if (!items || items.length === 0) return null;
  if (items.length === 1) return items.splice(0, 1)[0];

  const weights = items.map(item => {
    const streak = getMasteryStreak(item.character);
    return calculateLearningItemWeight(item, currentLesson, streak, power);
  });

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight <= 0) return items.splice(0, 1)[0];

  let randomVal = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    randomVal -= weights[i];
    if (randomVal <= 0 || i === items.length - 1) {
      return items.splice(i, 1)[0];
    }
  }

  return items.splice(0, 1)[0];
};

/**
 * Selects a rich pool of UNIQUE words for the session.
 * Prioritizes natural lesson progression (Pelajaran 1 -> 2 -> 3...) rather than arbitrary character length.
 * Incorporates Lesson Lag Weighted Sampling for 'learning' (Proses) words so lagging lessons appear promptly.
 */
export const selectKanjiUniquePool = (
  pool: KanjiItem[],
  totalSlots: number,
  getMasteryStreak: (character: string) => number,
  currentLessonNumber?: number
): { item: KanjiItem; tier: MasteryTierKey }[] => {
  if (!pool || pool.length === 0) return [];

  const highestActive = getHighestActiveLessonNumber(pool, getMasteryStreak, currentLessonNumber || 1);
  const effectiveCurrentLesson = Math.max(currentLessonNumber || 1, highestActive);

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

  const maxNewCount = getMaxNewUniquePerSession(totalSlots, tierBuckets.learning.length);
  const selectedUnique: { item: KanjiItem; tier: MasteryTierKey }[] = [];
  let newCount = 0;

  // Track remaining items available per tier
  const available: Record<MasteryTierKey, KanjiItem[]> = {
    new: [...tierBuckets.new],
    learning: [...tierBuckets.learning],
    mastered: [...tierBuckets.mastered],
    crown: [...tierBuckets.crown]
  };

  // --- Priority Allocation for Lagging Unmastered Words ---
  // If there are words in 'learning' from earlier lessons (lag >= 1),
  // guarantee at least 1 slot (or 2 slots if totalSlots >= 16) specifically
  // for the lagging pool so unmastered words from previous lessons appear promptly.
  const maxLaggingSlots = totalSlots >= 16 ? 2 : 1;
  let laggingSlotsCount = 0;

  while (
    laggingSlotsCount < maxLaggingSlots &&
    selectedUnique.length < targetUniqueCount &&
    available.learning.length > 0
  ) {
    const laggingCandidates = available.learning.filter(item => {
      const itemLesson = parseLessonNumber(item.lesson);
      return (effectiveCurrentLesson - itemLesson) >= 1;
    });

    if (laggingCandidates.length === 0) break;

    const picked = pickWeightedLearningItem(
      laggingCandidates,
      effectiveCurrentLesson,
      getMasteryStreak
    );

    if (picked) {
      const removeIdx = available.learning.findIndex(it => it.character === picked.character);
      if (removeIdx !== -1) {
        available.learning.splice(removeIdx, 1);
      }
      selectedUnique.push({ item: picked, tier: 'learning' });
      laggingSlotsCount++;
    } else {
      break;
    }
  }

  // --- Thematic Clustering Setup (~60% dominant theme) ---
  // Detect or establish primaryTheme to create cohesive, thematic practice sessions
  let primaryTheme: string | null = null;
  const targetThemeCount = Math.max(1, Math.round(targetUniqueCount * 0.6));

  // If a lagging item was picked and has a sub_category, use it as initial theme candidate
  const initialThemeWord = selectedUnique.find(u => !!u.item.sub_category);
  if (initialThemeWord && initialThemeWord.item.sub_category) {
    primaryTheme = initialThemeWord.item.sub_category;
  } else {
    // Detect theme with highest representation in remaining candidates (>= 2 items)
    const themeCounts: Record<string, number> = {};
    [...available.learning, ...available.new, ...available.mastered].forEach(it => {
      if (it.sub_category) {
        themeCounts[it.sub_category] = (themeCounts[it.sub_category] || 0) + 1;
      }
    });
    const candidateThemes = Object.keys(themeCounts).filter(k => themeCounts[k] >= 2);
    if (candidateThemes.length > 0) {
      candidateThemes.sort((a, b) => themeCounts[b] - themeCounts[a]);
      // Pick top theme with slight randomization among top 2 for variety across sessions
      const topIdx = candidateThemes.length > 1 && Math.random() < 0.35 ? 1 : 0;
      primaryTheme = candidateThemes[topIdx];
    }
  }

  const pickCandidateWithTheme = (
    candidates: KanjiItem[],
    theme?: string | null,
    affinityChance: number = 0.75
  ): KanjiItem | null => {
    if (!candidates || candidates.length === 0) return null;
    if (theme && Math.random() < affinityChance) {
      const matchIdx = candidates.findIndex(it => it.sub_category === theme);
      if (matchIdx !== -1) {
        return candidates.splice(matchIdx, 1)[0];
      }
    }
    return candidates.shift() || null;
  };

  while (selectedUnique.length < targetUniqueCount) {
    const currentThemeCount = primaryTheme
      ? selectedUnique.filter(u => u.item.sub_category === primaryTheme).length
      : 0;
    const shouldBoostTheme = !!primaryTheme && currentThemeCount < targetThemeCount;

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

      let item: KanjiItem;
      if (fallbackTier === 'learning') {
        if (shouldBoostTheme) {
          const themeCandidates = available.learning.filter(it => it.sub_category === primaryTheme);
          const picked = themeCandidates.length > 0
            ? pickWeightedLearningItem(themeCandidates, effectiveCurrentLesson, getMasteryStreak)
            : null;
          if (picked) {
            const removeIdx = available.learning.findIndex(it => it.character === picked.character);
            if (removeIdx !== -1) available.learning.splice(removeIdx, 1);
            item = picked;
          } else {
            const fallbackPicked = pickWeightedLearningItem(available.learning, effectiveCurrentLesson, getMasteryStreak);
            item = fallbackPicked || available.learning.shift()!;
          }
        } else {
          const picked = pickWeightedLearningItem(available.learning, effectiveCurrentLesson, getMasteryStreak);
          item = picked || available.learning.shift()!;
        }
      } else {
        item = (shouldBoostTheme ? pickCandidateWithTheme(available[fallbackTier], primaryTheme) : null) || available[fallbackTier].shift()!;
      }

      selectedUnique.push({ item, tier: fallbackTier });
      if (!primaryTheme && item.sub_category) primaryTheme = item.sub_category;
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

    let item: KanjiItem;
    if (chosenTier === 'learning') {
      if (shouldBoostTheme) {
        const themeCandidates = available.learning.filter(it => it.sub_category === primaryTheme);
        const picked = themeCandidates.length > 0
          ? pickWeightedLearningItem(themeCandidates, effectiveCurrentLesson, getMasteryStreak)
          : null;
        if (picked) {
          const removeIdx = available.learning.findIndex(it => it.character === picked.character);
          if (removeIdx !== -1) available.learning.splice(removeIdx, 1);
          item = picked;
        } else {
          const fallbackPicked = pickWeightedLearningItem(available.learning, effectiveCurrentLesson, getMasteryStreak);
          item = fallbackPicked || available.learning.shift()!;
        }
      } else {
        const picked = pickWeightedLearningItem(available.learning, effectiveCurrentLesson, getMasteryStreak);
        item = picked || available.learning.shift()!;
      }
    } else {
      item = (shouldBoostTheme ? pickCandidateWithTheme(available[chosenTier], primaryTheme) : null) || available[chosenTier].shift()!;
    }

    selectedUnique.push({ item, tier: chosenTier });
    if (!primaryTheme && item.sub_category) primaryTheme = item.sub_category;
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
  getMasteryStreak: (character: string) => number,
  currentLessonNumber?: number
): KanjiQuestion[] => {
  if (!pool || pool.length === 0) return [];

  // 1. Select unique pool with adaptive lesson lag weighting
  const uniquePool = selectKanjiUniquePool(pool, totalSlots, getMasteryStreak, currentLessonNumber);
  if (uniquePool.length === 0) return [];

  // 2. Distribute repetition slots
  const distributedSlots = distributeKanjiSlots(uniquePool, totalSlots);

  // 3. Shuffle with spacing constraint
  const spacedSlots = shuffleWithSpacingConstraint(distributedSlots, 100);

  // 4. Assign isFirstAppearance flags and metadata
  return assignFirstAppearanceFlags(spacedSlots);
};
