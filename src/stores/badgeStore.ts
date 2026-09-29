import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { BADGE_LIST, type Badge } from '../data/badges';
import { supabase } from '../lib/supabaseClient';
import { useMasteryStore } from './masteryStore';

const STORAGE_KEY_HIGHEST_LEVEL = 'japanese_quiz_highest_level';
const STORAGE_KEY_AVATAR_BADGE = 'japanese_quiz_avatar_badge';
const STORAGE_KEY_CLAIMED_LEVEL = 'japanese_quiz_claimed_level';

export const useBadgeStore = defineStore('badge', () => {
  const getInitialHighestLevel = (): number => {
    let base = 1;
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_HIGHEST_LEVEL);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 1) base = val;
      }
    }
    try {
      const masteryStore = useMasteryStore();
      if (masteryStore.currentUserLevel > base) {
        base = masteryStore.currentUserLevel;
      }
    } catch (e) { }
    return base;
  };

  const getInitialClaimedLevel = (): number => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_CLAIMED_LEVEL);
      if (saved) {
        const val = parseInt(saved, 10);
        if (!isNaN(val) && val >= 1) return val;
      }
    }
    // If not previously saved in localStorage, default to 2 if user already claimed level 2, otherwise 1
    const highest = getInitialHighestLevel();
    if (highest >= 2) {
      return 2;
    }
    return 1;
  };

  const getInitialAvatarBadge = (): string => {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_AVATAR_BADGE);
      if (saved && BADGE_LIST.some(b => b.id === saved)) {
        return saved;
      }
    }
    return 'badge_lvl_1';
  };

  const highestLevelReached = ref<number>(getInitialHighestLevel());
  const claimedLevel = ref<number>(getInitialClaimedLevel());
  const selectedAvatarBadgeId = ref<string>(getInitialAvatarBadge());
  const showProfileBadgeModal = ref<boolean>(false);

  const syncWithMasteryLevel = () => {
    try {
      const masteryStore = useMasteryStore();
      if (masteryStore.currentUserLevel > highestLevelReached.value) {
        highestLevelReached.value = masteryStore.currentUserLevel;
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem(STORAGE_KEY_HIGHEST_LEVEL, highestLevelReached.value.toString());
        }
      }
    } catch (e) { }
  };

  // Sync right upon store execution
  syncWithMasteryLevel();

  // Computed properties
  const allBadges = computed<Badge[]>(() => BADGE_LIST);

  const isBadgeUnlocked = (badgeId: string): boolean => {
    syncWithMasteryLevel();
    const badge = BADGE_LIST.find(b => b.id === badgeId);
    if (!badge) return false;

    // Special: Alphabet 100% mastery badges
    if (badge.id === 'badge_hiragana_master') {
      try {
        const masteryStore = useMasteryStore();
        return masteryStore.hiraganaMasteryStats.percentage >= 100;
      } catch (e) {
        return false;
      }
    }
    if (badge.id === 'badge_katakana_master') {
      try {
        const masteryStore = useMasteryStore();
        return masteryStore.katakanaMasteryStats.percentage >= 100;
      } catch (e) {
        return false;
      }
    }
    if (badge.id === 'badge_kanji_n5_master') {
      try {
        const masteryStore = useMasteryStore();
        return masteryStore.kanjiMasteryStats.percentage >= 100;
      } catch (e) {
        return false;
      }
    }

    return badge.levelRequired <= highestLevelReached.value;
  };

  const unlockedBadges = computed<Badge[]>(() => {
    syncWithMasteryLevel();
    return BADGE_LIST.filter(b => isBadgeUnlocked(b.id));
  });

  const lockedBadges = computed<Badge[]>(() => {
    syncWithMasteryLevel();
    return BADGE_LIST.filter(b => !isBadgeUnlocked(b.id));
  });

  const activeAvatarBadge = computed<Badge>(() => {
    syncWithMasteryLevel();
    const found = BADGE_LIST.find(b => b.id === selectedAvatarBadgeId.value);
    if (found && isBadgeUnlocked(found.id)) {
      return found;
    }
    return BADGE_LIST[0]; // Fallback to starter
  });

  const totalBadges = computed(() => BADGE_LIST.length);
  const unlockedCount = computed(() => unlockedBadges.value.length);
  const completionPercentage = computed(() => {
    return Math.round((unlockedCount.value / totalBadges.value) * 100);
  });

  const getBadgeByLevel = (level: number): Badge | undefined => {
    return BADGE_LIST.find(b => b.levelRequired === level && b.category !== 'alphabet');
  };

  const effectiveLevel = computed(() => {
    try {
      const masteryStore = useMasteryStore();
      return Math.max(highestLevelReached.value, masteryStore.currentUserLevel);
    } catch {
      return highestLevelReached.value;
    }
  });

  const hasUnclaimedLevels = computed(() => {
    return effectiveLevel.value > claimedLevel.value;
  });

  const nextUnclaimedLevel = computed(() => {
    if (hasUnclaimedLevels.value) {
      return claimedLevel.value + 1;
    }
    return null;
  });

  const hasMoreThanOneUnclaimed = computed(() => {
    return (effectiveLevel.value - claimedLevel.value) > 1;
  });

  // Actions
  const claimLevel = async (level: number) => {
    if (level > claimedLevel.value) {
      claimedLevel.value = level;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_CLAIMED_LEVEL, level.toString());
      }
    }

    if (level > highestLevelReached.value) {
      highestLevelReached.value = level;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_HIGHEST_LEVEL, level.toString());
      }
    }
    
    // Also sync to Supabase user metadata if logged in
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.auth.updateUser({
          data: {
            highest_level: highestLevelReached.value,
            claimed_level: claimedLevel.value,
            avatar_badge: selectedAvatarBadgeId.value
          }
        });
      }
    } catch (err) {
      console.warn('Failed to sync highest_level/claimed_level to user metadata:', err);
    }
  };

  const setAvatarBadge = async (badgeId: string): Promise<boolean> => {
    const badge = BADGE_LIST.find(b => b.id === badgeId);
    if (!badge) return false;

    // Must be unlocked
    if (!isBadgeUnlocked(badge.id)) {
      return false;
    }

    selectedAvatarBadgeId.value = badgeId;
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_AVATAR_BADGE, badgeId);
    }

    // Sync to Supabase user metadata if logged in
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await supabase.auth.updateUser({
          data: {
            avatar_badge: badgeId
          }
        });
      }
    } catch (err) {
      console.warn('Failed to sync avatar_badge to user metadata:', err);
    }

    return true;
  };

  const syncFromUser = (user: any, masteryLevel?: number) => {
    if (!user) return;
    const metaHighest = user.user_metadata?.highest_level;
    const metaAvatar = user.user_metadata?.avatar_badge;
    const metaClaimed = user.user_metadata?.claimed_level;

    let candidateLevel = highestLevelReached.value;
    if (typeof metaHighest === 'number' && metaHighest > candidateLevel) {
      candidateLevel = metaHighest;
    }
    if (typeof masteryLevel === 'number' && masteryLevel > candidateLevel) {
      candidateLevel = masteryLevel;
    }

    if (candidateLevel > highestLevelReached.value) {
      highestLevelReached.value = candidateLevel;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_HIGHEST_LEVEL, candidateLevel.toString());
      }
    }

    if (typeof metaClaimed === 'number' && metaClaimed > claimedLevel.value) {
      claimedLevel.value = metaClaimed;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_CLAIMED_LEVEL, metaClaimed.toString());
      }
    }

    if (metaAvatar && BADGE_LIST.some(b => b.id === metaAvatar)) {
      selectedAvatarBadgeId.value = metaAvatar;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_AVATAR_BADGE, metaAvatar);
      }
    }
  };

  const openProfileBadgeModal = () => {
    showProfileBadgeModal.value = true;
  };

  const closeProfileBadgeModal = () => {
    showProfileBadgeModal.value = false;
  };

  return {
    highestLevelReached,
    claimedLevel,
    effectiveLevel,
    hasUnclaimedLevels,
    nextUnclaimedLevel,
    hasMoreThanOneUnclaimed,
    selectedAvatarBadgeId,
    showProfileBadgeModal,
    allBadges,
    unlockedBadges,
    lockedBadges,
    activeAvatarBadge,
    totalBadges,
    unlockedCount,
    completionPercentage,
    isBadgeUnlocked,
    getBadgeByLevel,
    claimLevel,
    setAvatarBadge,
    syncFromUser,
    openProfileBadgeModal,
    closeProfileBadgeModal
  };
});
