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

const PENDING_STREAKS_KEY = 'japanese-quiz-pending-streaks';

const getPendingStreaks = (): string[] => {
  try {
    const stored = localStorage.getItem(PENDING_STREAKS_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) { }
  return [];
};

const addPendingStreak = (char: string) => {
  try {
    const list = getPendingStreaks();
    if (!list.includes(char)) {
      list.push(char);
      localStorage.setItem(PENDING_STREAKS_KEY, JSON.stringify(list));
    }
  } catch (e) { }
};

const clearPendingStreaks = () => {
  try {
    localStorage.removeItem(PENDING_STREAKS_KEY);
  } catch (e) { }
};

export const useMasteryStore = defineStore('mastery', () => {
  const userStreaks = ref<Record<string, number>>(getLocalStreaks());
  const introducedChars = ref<Record<string, boolean>>(getLocalIntroduced());
  const latestTierTransition = ref<TierTransition | null>(null);
  const sessionTierChanges = ref<TierTransition[]>([]);
  const isSyncing = ref(false);
  const lastSyncTime = ref<Date | null>(null);
  const syncError = ref<string | null>(null);

  const fetchServerStreaks = async (userId: string): Promise<Record<string, number>> => {
    let allData: Array<{ character: string; streak: number }> = [];
    const pageSize = 1000;
    let from = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('character, streak')
        .eq('user_id', userId)
        .range(from, from + pageSize - 1);

      if (error) throw error;
      if (data && data.length > 0) {
        allData = allData.concat(data);
        if (data.length < pageSize) {
          hasMore = false;
        } else {
          from += pageSize;
        }
      } else {
        hasMore = false;
      }
    }

    const streaks: Record<string, number> = {};
    allData.forEach(item => { streaks[item.character] = item.streak; });
    return streaks;
  };

  const syncWithServer = async (userId: string): Promise<{ pushed: number; pulled: number }> => {
    if (isSyncing.value) return { pushed: 0, pulled: 0 };
    isSyncing.value = true;
    syncError.value = null;

    try {
      const serverStreaks = await fetchServerStreaks(userId);
      const local = getLocalStreaks();
      const pendingList = new Set(getPendingStreaks());

      const merged: Record<string, number> = { ...local };
      const toUpsert: Array<{
        user_id: string;
        character: string;
        streak: number;
        last_tier?: string;
        tier_changed_at?: string;
        updated_at: string;
      }> = [];

      let pulled = 0;
      let pushed = 0;

      // 1. Merge server into local (if server has higher streak)
      Object.entries(serverStreaks).forEach(([char, serverStreak]) => {
        const localStreak = local[char] || 0;
        if (serverStreak > localStreak) {
          merged[char] = serverStreak;
          pulled++;
        }
      });

      // 2. Identify local streaks that are higher than server or queued in pending
      const now = new Date().toISOString();
      Object.entries(local).forEach(([char, localStreak]) => {
        const serverStreak = serverStreaks[char] || 0;
        if ((localStreak > serverStreak && localStreak > 0) || pendingList.has(char)) {
          const tier = getMasteryTierFromStreak(localStreak);
          toUpsert.push({
            user_id: userId,
            character: char,
            streak: localStreak,
            last_tier: tier,
            tier_changed_at: now,
            updated_at: now
          });
          pushed++;
        }
      });

      // 3. Batch push higher local streaks to Supabase in chunks of 100
      if (toUpsert.length > 0) {
        const chunkSize = 100;
        for (let i = 0; i < toUpsert.length; i += chunkSize) {
          const chunk = toUpsert.slice(i, i + chunkSize);
          const { error } = await supabase
            .from('user_streaks')
            .upsert(chunk, { onConflict: 'user_id,character' });
          if (error) {
            console.error('Failed to push local streaks chunk to server:', error);
            throw error;
          }
        }
      }

      // 4. Clear pending streaks queue on success
      clearPendingStreaks();

      // 5. Update in-memory reactive state and localStorage
      userStreaks.value = merged;
      localStorage.setItem('japanese-quiz-streaks', JSON.stringify(merged));
      loadIntroducedFromStorage();
      lastSyncTime.value = new Date();

      return { pushed, pulled };
    } catch (e: any) {
      console.error('Error during syncWithServer:', e);
      syncError.value = e?.message || 'Gagal sinkronisasi';
      throw e;
    } finally {
      isSyncing.value = false;
    }
  };

  const syncLocalToServer = async (userId: string) => {
    return syncWithServer(userId);
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
        await syncWithServer(authStore.user.id);
      } catch (e) {
        console.error('Error syncing streaks with server on load:', e);
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
      // Logic saat typo (salah ketik 1 huruf):
      // 1. Level Mahkota (streak >= 5):
      //    Turun 1 streak (bisa tetap di Mahkota jika streak > 5, atau turun ke Hafal jika 5 -> 4).
      // 2. Di bawah Mahkota (Hafal & Proses/Belum - streak < 5):
      //    Streak TIDAK BERUBAH (tidak ter-reset, tidak berkurang, dan tidak bertambah).
      if (oldStreak >= 5) {
        newStreak = oldStreak - 1;
      } else {
        newStreak = oldStreak;
      }

      if (newStreak !== oldStreak) {
        userStreaks.value[charKey] = newStreak;
        streakChanged = true;
      }
    } else if (!isCorrectVal) {
      // Salah total (bukan typo / dilewati):
      if (oldStreak >= 5) {
        // Level Mahkota (streak >= 5): turun 2 level -> Level Proses (streak 2)
        newStreak = 2;
      } else if (oldStreak >= 3) {
        // Level Hafal (streak 3-4): turun 1 level -> Level Proses (streak 2)
        newStreak = 2;
      } else if (oldStreak >= 1) {
        // Level Proses (streak 1-2): turun 1 streak (minimal streak 1)
        newStreak = Math.max(1, oldStreak - 1);
      } else {
        // Level Belum (streak 0): tetap 0
        newStreak = 0;
      }

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

      import('./authStore').then(async ({ useAuthStore }) => {
        const authStore = useAuthStore();
        if (authStore.user) {
          try {
            const { error } = await supabase.from('user_streaks').upsert({
              user_id: authStore.user.id,
              character: charKey,
              streak: newStreak,
              last_tier: transition.newTier,
              tier_changed_at: transition.direction !== 'same' ? new Date().toISOString() : undefined,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,character' });

            if (error) {
              console.warn('Background streak upsert failed, queued for next sync:', error);
              addPendingStreak(charKey);
            }
          } catch (err: any) {
            console.warn('Network error during streak upsert, queued for next sync:', err);
            addPendingStreak(charKey);
          }
        } else {
          addPendingStreak(charKey);
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
    isSyncing,
    lastSyncTime,
    syncError,
    fetchServerStreaks,
    syncWithServer,
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
