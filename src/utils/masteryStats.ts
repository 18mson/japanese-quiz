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
