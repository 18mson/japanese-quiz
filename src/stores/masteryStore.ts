import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { hiraganaData } from '../data/hiragana';
import { katakanaData } from '../data/katakana';
import { wordsData } from '../data/words';
import { kanjiN5Data } from '../data/kanji';
import { supabase } from '../lib/supabaseClient';
import {
  computeCategoryMasteryStats,
  getMasteryTierFromStreak,
  checkTierTransition,
  type TierTransition
} from '../utils/masteryStats';

const getLocalStreaks = (): Record<string, number> => {
  try {
    const stored = localStorage.getItem('japanese-quiz-streaks');
    if (stored) return JSON.parse(stored);
  } catch (e) { }
  return {};
};

const getLocalIntroduced = (): Record<string, boolean> => {
  try {
    const stored = localStorage.getItem('japanese-quiz-introduced');
    if (stored) return JSON.parse(stored);
  } catch (e) { }
  return {};
};

export const useMasteryStore = defineStore('mastery', () => {
  const userStreaks = ref<Record<string, number>>(getLocalStreaks());
  const introducedChars = ref<Record<string, boolean>>(getLocalIntroduced());
  const latestTierTransition = ref<TierTransition | null>(null);
  const sessionTierChanges = ref<TierTransition[]>([]);

  const fetchServerStreaks = async (userId: string): Promise<Record<string, number>> => {
    const { data, error } = await supabase.from('user_streaks').select('character, streak').eq('user_id', userId);
    if (error) throw error;
    const streaks: Record<string, number> = {};
    if (data) data.forEach(item => { streaks[item.character] = item.streak; });
    return streaks;
  };

  const syncLocalToServer = async (userId: string) => {
    const current = getLocalStreaks();
    const entries = Object.entries(current).filter(([_, streak]) => streak > 0);
    if (entries.length === 0) return;

    const rows = entries.map(([character, streak]) => ({
      user_id: userId,
      character,
      streak
    }));

    const { error } = await supabase.from('user_streaks').upsert(rows, { onConflict: 'user_id,character' });
    if (error) console.error('Failed to sync local streaks to server:', error);
  };

  const applyServerStreaks = (serverStreaks: Record<string, number>) => {
    userStreaks.value = serverStreaks;
    try {
      localStorage.setItem('japanese-quiz-streaks', JSON.stringify(serverStreaks));
    } catch (e) { }
  };

  const saveIntroducedToStorage = () => {
    try {
      localStorage.setItem('japanese-quiz-introduced', JSON.stringify(introducedChars.value));
    } catch (e) { }
  };

  const loadIntroducedFromStorage = () => {
    const local = getLocalIntroduced();
    // Any character with a streak > 0 is already known/introduced
    Object.keys(userStreaks.value).forEach(char => {
      if ((userStreaks.value[char] || 0) > 0) {
        local[char] = true;
      }
    });
    introducedChars.value = local;
    saveIntroducedToStorage();
  };

  const loadStreaksFromStorage = async () => {
    const local = getLocalStreaks();
    userStreaks.value = { ...local };
    loadIntroducedFromStorage();
    const { useAuthStore } = await import('./authStore');
    const authStore = useAuthStore();
    if (authStore.user) {
      try {
        const serverStreaks = await fetchServerStreaks(authStore.user.id);
        const merged: Record<string, number> = { ...local };
        Object.entries(serverStreaks).forEach(([char, streak]) => {
          merged[char] = Math.max(merged[char] || 0, streak);
          if (streak > 0) {
            introducedChars.value[char] = true;
          }
        });
        userStreaks.value = merged;
        localStorage.setItem('japanese-quiz-streaks', JSON.stringify(merged));
        saveIntroducedToStorage();
      } catch (e) {
        console.error('Error fetching server streaks:', e);
      }
    }
  };

  const loadStreaksFromServer = loadStreaksFromStorage;

  const kanjiCharSet = new Set(kanjiN5Data.map(k => k.character));

  const getMasteryStreak = (character: string): number => {
    const direct = userStreaks.value[character] || 0;
    if (kanjiCharSet.has(character)) {
      const relatedWords = wordsData.filter(w => w.character.includes(character));
      if (relatedWords.length > 0) {
        let maxWordStreak = 0;
        for (const rw of relatedWords) {
          const s = userStreaks.value[rw.character] || 0;
          if (s > maxWordStreak) maxWordStreak = s;
        }
        return Math.max(direct, maxWordStreak);
      }
    }
    return direct;
  };

  const getMasteryTier = (character: string) => getMasteryTierFromStreak(getMasteryStreak(character));

  const bulkUpdateMasteryTier = async (
    characters: string[],
    targetTier: 'new' | 'learning' | 'mastered' | 'crown'
  ) => {
    if (!characters || characters.length === 0) return;

    const streakMap: Record<'new' | 'learning' | 'mastered' | 'crown', number> = {
      new: 0,
      learning: 1,
      mastered: 3,
      crown: 5
    };
    const targetStreak = streakMap[targetTier];

    // 1. Update in-memory reactive userStreaks immediately
    const updatedStreaks = { ...userStreaks.value };
    const updatedIntroduced = { ...introducedChars.value };

    characters.forEach(char => {
      if (targetStreak === 0) {
        delete updatedStreaks[char];
        delete updatedIntroduced[char];
      } else {
        updatedStreaks[char] = targetStreak;
        updatedIntroduced[char] = true;
      }
    });

    userStreaks.value = updatedStreaks;
    introducedChars.value = updatedIntroduced;

    // 2. Persist to localStorage immediately
    try {
      localStorage.setItem('japanese-quiz-streaks', JSON.stringify(updatedStreaks));
      localStorage.setItem('japanese-quiz-introduced', JSON.stringify(updatedIntroduced));
    } catch (e) {
      console.error('Error saving streaks to localStorage:', e);
    }

    // 3. Batch push to Supabase ONLY if user is actively logged in
    try {
      const { useAuthStore } = await import('./authStore');
      const authStore = useAuthStore();
      const currentUserId = authStore.user?.id;

      if (!currentUserId) {
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user || session.user.id !== currentUserId) {
        return;
      }

      if (targetStreak === 0) {
        const chunkSize = 100;
        for (let i = 0; i < characters.length; i += chunkSize) {
          const chunk = characters.slice(i, i + chunkSize);
          await supabase
            .from('user_streaks')
            .delete()
            .eq('user_id', currentUserId)
            .in('character', chunk);
        }
      } else {
        const now = new Date().toISOString();
        const rows = characters.map(char => ({
          user_id: currentUserId,
          character: char,
          streak: targetStreak,
          last_tier: targetTier,
          tier_changed_at: now,
          updated_at: now
        }));

        const chunkSize = 100;
        for (let i = 0; i < rows.length; i += chunkSize) {
          const chunk = rows.slice(i, i + chunkSize);
          const { error } = await supabase
            .from('user_streaks')
            .upsert(chunk, { onConflict: 'user_id,character' });
          if (error) {
            console.error('Error batch upserting user_streaks to Supabase:', error);
          }
        }
      }
    } catch (err) {
      console.warn('Skipping database push (user offline, unauthenticated, or network issue):', err);
    }
  };

  const hiraganaMasteryStats = computed(() => computeCategoryMasteryStats(hiraganaData, userStreaks.value));
  const katakanaMasteryStats = computed(() => computeCategoryMasteryStats(katakanaData, userStreaks.value));
  const wordsMasteryStats = computed(() => computeCategoryMasteryStats(wordsData, userStreaks.value));
  const kanjiMasteryStats = computed(() => computeCategoryMasteryStats(kanjiN5Data, userStreaks.value, getMasteryStreak));

  const overallMasteryStats = computed(() => {
    const h = hiraganaMasteryStats.value, k = katakanaMasteryStats.value, w = wordsMasteryStats.value, kj = kanjiMasteryStats.value;
    const total = h.total + k.total + w.total + kj.total, mastered = h.mastered + k.mastered + w.mastered + kj.mastered;
    const crown = h.crown + k.crown + w.crown + kj.crown, learning = h.learning + k.learning + w.learning + kj.learning, newItems = h.newItems + k.newItems + w.newItems + kj.newItems;
    return { total, mastered, crown, learning, newItems, percentage: total > 0 ? Math.round((mastered / total) * 100) : 0 };
  });

  const currentUserLevel = computed(() => {
    let level = 1;
    for (let i = 1; i <= 25; i++) {
      const lessonWords = wordsData.filter(w => w.lesson === `Pelajaran ${i}` || (!w.lesson && i === 1));
      if (lessonWords.length > 0 && lessonWords.every(w => (userStreaks.value[w.character] || 0) >= 3)) {
        level = i + 1;
      } else {
        break;
      }
    }
    return level;
  });

  const recordAnswerStreak = (
    charKey: string,
    _isWordOrKanji: boolean,
    isCorrectVal: boolean,
    pointsEarned: number,
    charSessionState?: { attempts: number; failed: boolean; initialStreak: number; streakEvaluated: boolean },
    isTypo: boolean = false
  ) => {
    const oldStreak = userStreaks.value[charKey] || 0;
    let streakChanged = false;
    let newStreak = oldStreak;

    if (isTypo && !isCorrectVal) {
      // Soal yg sudah hafal (streak 3-4) atau mahkota (streak >= 5),
      // lalu hanya typo atau salah 1 huruf:
      // Cukup turun 1 tingkatan saja:
      // - Mahkota (>= 5) -> Hafal (4)
      // - Hafal (3-4) -> Proses (2)
      // - Proses (1-2) -> Belum (0)
      // - Belum (0) -> tetap 0
      if (oldStreak >= 5) {
        newStreak = 4;
      } else if (oldStreak >= 3) {
        newStreak = 2;
      } else {
        newStreak = 0;
      }

      if (newStreak !== oldStreak) {
        userStreaks.value[charKey] = newStreak;
        streakChanged = true;
      }
    } else if (!isCorrectVal) {
      // Salah total atau dilewati -> reset ke 0
      newStreak = 0;
      if (newStreak !== oldStreak) {
        userStreaks.value[charKey] = newStreak;
        streakChanged = true;
      }
    } else {
      // isCorrectVal === true
      if (charSessionState) {
        if (!charSessionState.failed && !charSessionState.streakEvaluated) {
          charSessionState.streakEvaluated = true;
          newStreak = charSessionState.initialStreak + 1;
          userStreaks.value[charKey] = newStreak;
          streakChanged = true;
        }
      } else {
        newStreak = pointsEarned === 4 ? oldStreak + 1 : oldStreak;
        if (newStreak !== oldStreak) {
          userStreaks.value[charKey] = newStreak;
          streakChanged = true;
        }
      }
    }

    try {
      localStorage.setItem('japanese-quiz-streaks', JSON.stringify(userStreaks.value));
    } catch (e) { }

    if (streakChanged) {
      const transition = checkTierTransition(charKey, oldStreak, newStreak);
      if (transition.direction !== 'same') {
        latestTierTransition.value = transition;
        sessionTierChanges.value.push(transition);
      }

      import('./authStore').then(({ useAuthStore }) => {
        const authStore = useAuthStore();
        if (authStore.user) {
          supabase.from('user_streaks').upsert({
            user_id: authStore.user.id,
            character: charKey,
            streak: newStreak,
            last_tier: transition.newTier,
            tier_changed_at: transition.direction !== 'same' ? new Date().toISOString() : undefined,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,character' }).then();
        }
      });
    }

    return { oldStreak, newStreak, streakChanged };
  };

  return {
    userStreaks,
    introducedChars,
    latestTierTransition,
    sessionTierChanges,
    fetchServerStreaks,
    syncLocalToServer,
    applyServerStreaks,
    saveIntroducedToStorage,
    loadIntroducedFromStorage,
    loadStreaksFromStorage,
    loadStreaksFromServer,
    getMasteryStreak,
    getMasteryTier,
    bulkUpdateMasteryTier,
    recordAnswerStreak,
    hiraganaMasteryStats,
    katakanaMasteryStats,
    wordsMasteryStats,
    kanjiMasteryStats,
    overallMasteryStats,
    currentUserLevel,
    getLocalStreaks
  };
});
