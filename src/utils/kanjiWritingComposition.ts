// src/utils/kanjiWritingComposition.ts
// Composition generator for Writing Kanji N5 mode
// Implements lesson-based SRS, 1-2 new kanji per session, in-progress throttling,
// Kotoba-aligned tier weights & slot repetitions, dynamic prompt variations, and spacing constraints.

import type { KanjiWritingEntry } from '../data/kanjiWritingPrompts';
import {
  KANJI_TIER_WEIGHTS,
  KANJI_TIER_METADATA,
  distributeKanjiSlots,
  shuffleWithSpacingConstraint
} from './kanjiQuizComposition';
import { getTierFromStreak, type MasteryTierKey } from './quizHelpers';

export interface BuildWritingSessionOptions {
  maxNewOverride?: number;
  inProgressThreshold?: number; // Default: 3 (if >= 3 in progress, do not add new kanji)
}

export interface KanjiWritingSessionResult {
  questions: any[];
  newKanjiEntries: any[];
  inProgressCount: number;
  newCount: number;
}

/**
 * Builds a session queue of questions for Writing Kanji N5.
 * 
 * Rules:
 * 1. 1 - 2 new kanji per session maximum.
 * 2. If in-progress kanji count >= 3 (or 4), maxNew = 0 (focus on mastering in-progress kanji first).
 * 3. Question count matches Kotoba mode (8 / 24 / 40 slots).
 * 4. Tier selection weights: new: 35, learning: 40, mastered: 20, crown: 5.
 * 5. Repetition weights: new: 2, learning: 2, mastered: 1, crown: 1.
 * 6. Dynamic prompt variation per repeated appearance.
 * 7. Spacing constraint (|idx_a - idx_b| >= 2).
 */
export const buildKanjiWritingSessionQuestions = (
  candidateEntries: KanjiWritingEntry[],
  totalSlots: number,
  getMasteryStreak: (kanji: string) => number,
  introducedChars: Record<string, boolean> = {},
  options?: BuildWritingSessionOptions
): KanjiWritingSessionResult => {
  if (!candidateEntries || candidateEntries.length === 0) {
    return { questions: [], newKanjiEntries: [], inProgressCount: 0, newCount: 0 };
  }

  // 1. Group candidate kanji by tier
  const tierBuckets: Record<MasteryTierKey, KanjiWritingEntry[]> = {
    new: [],
    learning: [],
    mastered: [],
    crown: []
  };

  candidateEntries.forEach(entry => {
    const streak = getMasteryStreak(entry.kanji);
    const isIntro = !!introducedChars[entry.kanji];
    const tier = getTierFromStreak(streak);

    if (tier === 'new' && isIntro) {
      // Streak is 0 but was already introduced/previewed: treat as learning
      tierBuckets.learning.push(entry);
    } else {
      tierBuckets[tier].push(entry);
    }
  });

  // 2. Count kanji currently in-progress
  const inProgressCount = tierBuckets.learning.length;

  // 3. Determine maximum allowed new kanji for this session
  const inProgressThreshold = options?.inProgressThreshold ?? 3;
  let maxNewKanji = 2;

  if (options?.maxNewOverride !== undefined) {
    maxNewKanji = options.maxNewOverride;
  } else if (inProgressCount >= inProgressThreshold) {
    // Ada 3 atau lebih kanji yang masih dalam proses belajar: jangan tambah huruf baru dulu!
    maxNewKanji = 0;
  } else if (inProgressCount === inProgressThreshold - 1) {
    // Sisa 1 slot sebelum mencapai batas in-progress
    maxNewKanji = 1;
  } else {
    // Diizinkan 1 - 2 huruf baru
    maxNewKanji = 2;
  }

  // 4. Sort 'new' tier by curriculum order (Lesson number ascending, then order in data)
  tierBuckets.new.sort((a, b) => {
    if (a.primaryLessonNumber !== b.primaryLessonNumber) {
      return a.primaryLessonNumber - b.primaryLessonNumber;
    }
    return 0;
  });

  // Randomize other buckets for natural practice variety
  (['learning', 'mastered', 'crown'] as MasteryTierKey[]).forEach(tier => {
    tierBuckets[tier].sort(() => 0.5 - Math.random());
  });

  // 5. Build available candidates pool respecting maxNewKanji
  const available: Record<MasteryTierKey, KanjiWritingEntry[]> = {
    new: tierBuckets.new.slice(0, maxNewKanji),
    learning: [...tierBuckets.learning],
    mastered: [...tierBuckets.mastered],
    crown: [...tierBuckets.crown]
  };

  const totalAvailableCount =
    available.new.length +
    available.learning.length +
    available.mastered.length +
    available.crown.length;

  if (totalAvailableCount === 0) {
    // Fallback: pick any from candidateEntries if all buckets were somehow empty
    const fallbackEntry = candidateEntries[0];
    available.learning.push(fallbackEntry);
  }

  // 6. Target unique kanji: ~4 for 8 slots, ~10 for 24 slots, ~16 for 40 slots
  const targetUniqueCount = Math.max(
    1,
    Math.min(
      totalAvailableCount || 1,
      Math.max(Math.round(totalSlots * 0.5), Math.min(4, totalSlots))
    )
  );

  const selectedUnique: { entry: KanjiWritingEntry; tier: MasteryTierKey }[] = [];
  let newCount = 0;

  // 7. Weighted unique selection
  while (selectedUnique.length < targetUniqueCount) {
    const eligibleTiers = (['new', 'learning', 'mastered', 'crown'] as MasteryTierKey[]).filter(tier => {
      if (available[tier].length === 0) return false;
      if (tier === 'new' && newCount >= maxNewKanji) return false;
      return true;
    });

    if (eligibleTiers.length === 0) {
      // Fallback: pick any remaining available item from any non-empty tier
      const fallbackTier = (['learning', 'mastered', 'crown', 'new'] as MasteryTierKey[]).find(
        tier => available[tier].length > 0 && (tier !== 'new' || newCount < maxNewKanji)
      );
      if (!fallbackTier) break;
      const entry = available[fallbackTier].shift()!;
      selectedUnique.push({ entry, tier: fallbackTier });
      if (fallbackTier === 'new') newCount++;
      continue;
    }

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

    const entry = available[chosenTier].shift()!;
    selectedUnique.push({ entry, tier: chosenTier });
    if (chosenTier === 'new') newCount++;
  }

  if (selectedUnique.length === 0 && candidateEntries.length > 0) {
    selectedUnique.push({ entry: candidateEntries[0], tier: 'learning' });
  }

  // 8. Extract unique unlearned kanji for flashcard wave preview
  const newKanjiEntries = selectedUnique
    .filter(u => u.tier === 'new')
    .map(u => ({
      character: u.entry.kanji,
      kana: (u.entry.kunyomi && u.entry.kunyomi.length > 0 ? u.entry.kunyomi[0] : u.entry.onyomi[0] || ''),
      romaji: u.entry.kunyomi.concat(u.entry.onyomi),
      meaning: u.entry.meaning,
      onyomi: u.entry.onyomi,
      kunyomi: u.entry.kunyomi,
      examples: u.entry.examples,
      lesson: u.entry.primaryLesson,
      type: 'kanji',
      category: 'kanji'
    }));

  // 9. Distribute repetition slots across unique kanji (Hamilton method)
  const slotCandidates = selectedUnique.map(u => ({
    item: {
      character: u.entry.kanji,
      entry: u.entry
    },
    tier: u.tier
  }));

  const distributedSlots = distributeKanjiSlots(slotCandidates as any, totalSlots);

  // 10. Shuffle with spacing constraint (|idx_a - idx_b| >= 2)
  const spacedSlots = shuffleWithSpacingConstraint(distributedSlots as any, 150);

  // 11. Assign dynamic prompt variations & metadata
  const promptUsageCounts: Record<string, number> = {};
  const seenCharacters = new Set<string>();

  const questions = spacedSlots.map((slot: any) => {
    const entry: KanjiWritingEntry = slot.item.entry;
    const kanji = entry.kanji;
    const count = promptUsageCounts[kanji] || 0;
    promptUsageCounts[kanji] = count + 1;

    // Pick dynamic prompt variation
    const promptIndex = count % entry.prompts.length;
    const prompt = entry.prompts[promptIndex];

    const isFirst = !seenCharacters.has(kanji);
    if (isFirst) {
      seenCharacters.add(kanji);
    }

    const meta = KANJI_TIER_METADATA[slot.tier as MasteryTierKey] || {
      questionReason: 'kanji_practice',
      reasonLabel: 'Latihan Menulis Kanji'
    };

    return {
      character: entry.kanji,
      romaji: prompt.targetKana,
      kana: prompt.fullKana,
      fullWord: prompt.word,
      prefixKana: prompt.prefixKana,
      targetKana: prompt.targetKana,
      suffixKana: prompt.suffixKana,
      meaning: prompt.meaning,
      kanjiMeaning: entry.meaning,
      lesson: prompt.lesson,
      lessonNumber: prompt.lessonNumber,
      onyomi: entry.onyomi,
      kunyomi: entry.kunyomi,
      examples: entry.examples,
      type: 'kanji',
      category: 'kanji',
      tier: slot.tier,
      isFirstAppearance: isFirst,
      questionReason: meta.questionReason,
      reasonLabel: meta.reasonLabel
    };
  });

  return {
    questions,
    newKanjiEntries,
    inProgressCount,
    newCount
  };
};
