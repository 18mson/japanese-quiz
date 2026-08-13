export type MasteryTier = 'new' | 'learning' | 'mastered' | 'crown';

export interface MasteryCategoryStats {
  total: number;
  mastered: number;
  crown: number;
  learning: number;
  newItems: number;
  percentage: number;
}

export const getMasteryTierFromStreak = (streak: number): MasteryTier => {
  if (streak >= 5) return 'crown';
  if (streak >= 3) return 'mastered';
  if (streak >= 1) return 'learning';
  return 'new';
};

export const computeCategoryMasteryStats = (
  dataset: any[],
  userStreaks: Record<string, number>
): MasteryCategoryStats => {
  const total = dataset.length;
  let mastered = 0;
  let crown = 0;
  let learning = 0;
  let newItems = 0;

  dataset.forEach(item => {
    const streak = userStreaks[item.character] || 0;
    const tier = getMasteryTierFromStreak(streak);
    if (tier === 'crown') { crown++; mastered++; }
    else if (tier === 'mastered') { mastered++; }
    else if (tier === 'learning') { learning++; }
    else { newItems++; }
  });

  const percentage = total > 0 ? Math.round((mastered / total) * 100) : 0;
  return { total, mastered, crown, learning, newItems, percentage };
};

export interface TierTransition {
  character: string;
  oldTier: MasteryTier;
  newTier: MasteryTier;
  direction: 'up' | 'down' | 'same';
  label: string;
}

export const checkTierTransition = (
  character: string,
  oldStreak: number,
  newStreak: number
): TierTransition => {
  const oldTier = getMasteryTierFromStreak(oldStreak);
  const newTier = getMasteryTierFromStreak(newStreak);

  const tierRanks: Record<MasteryTier, number> = {
    new: 0,
    learning: 1,
    mastered: 2,
    crown: 3
  };

  const oldRank = tierRanks[oldTier];
  const newRank = tierRanks[newTier];

  let direction: 'up' | 'down' | 'same' = 'same';
  if (newRank > oldRank) direction = 'up';
  else if (newRank < oldRank) direction = 'down';

  const tierLabels: Record<MasteryTier, string> = {
    new: 'Belum',
    learning: 'Proses',
    mastered: 'Hafal',
    crown: 'Crown'
  };

  return {
    character,
    oldTier,
    newTier,
    direction,
    label: `${character} → ${tierLabels[newTier]}!`
  };
};
