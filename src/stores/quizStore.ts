import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { hiraganaData } from '../data/hiragana';
import { katakanaData } from '../data/katakana';
import { wordsData } from '../data/words';
import { sentencesData } from '../data/sentences';
import { supabase } from '../lib/supabaseClient';
import { playCorrectSound, playIncorrectSound } from '../utils/battleSoundManager';
import { checkIsCorrect, checkIsTypo, getQuestionCountFromDuration, getFallbackLocalPool } from '../utils/quizHelpers';
import { getMasteryTierFromStreak, computeCategoryMasteryStats, checkTierTransition, TierTransition } from '../utils/masteryStats';
import { submitLeaderboardScore } from '../services/leaderboardService';
import { buildHurufSessionQuestions } from '../utils/hurufQuizComposition';
import { buildKanjiSessionQuestions } from '../utils/kanjiQuizComposition';
import { useGoalsStore } from './goalsStore';
import { fetchLessonBunkei, fetchLessonKaiwa, buildRenshuuSession, fetchRenshuuProgress, saveRenshuuItemResult, DEFAULT_RENSHUU_SESSION_SIZE } from '../services/lessonService';
import { GrammarPoint, Kaiwa, RenshuuSessionQuestion, RenshuuProgressStats } from '../types/lesson';

export const useQuizStore = defineStore('quiz', () => {
  const isLoading = ref(false);
  const userStreaks = ref<Record<string, number>>({});
  const sentenceStats = ref<{ wpm: number; cpm: number; accuracy: number; errorCount: number; totalKeystrokes: number } | null>(null);

  // Kaiwa & Renshuu state
  const currentLessonNumber = ref<number>(1);
  const bunkeiList = ref<GrammarPoint[]>([]);
  const kaiwaData = ref<Kaiwa | null>(null);
  const renshuuSessionQuestions = ref<RenshuuSessionQuestion[]>([]);
  const renshuuProgressStats = ref<RenshuuProgressStats>({
    masteredCount: 0,
    totalCount: 45,
    progressPercent: 0
  });
  const showLessonMaterial = ref<boolean>(false);
  const isLessonMaterialCompleted = ref<boolean>(false);

  const getLocalStreaks = (): Record<string, number> => {
    try {
      const stored = localStorage.getItem('japanese-quiz-streaks');
      if (stored) return JSON.parse(stored);
    } catch (e) { }
    return {};
  };

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

  const introducedChars = ref<Record<string, boolean>>({});

  const getLocalIntroduced = (): Record<string, boolean> => {
    try {
      const stored = localStorage.getItem('japanese-quiz-introduced');
      if (stored) return JSON.parse(stored);
    } catch (e) { }
    return {};
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

  const getMasteryStreak = (character: string): number => userStreaks.value[character] || 0;
  const getMasteryTier = (character: string) => getMasteryTierFromStreak(getMasteryStreak(character));

  const hiraganaMasteryStats = computed(() => computeCategoryMasteryStats(hiraganaData, userStreaks.value));
  const katakanaMasteryStats = computed(() => computeCategoryMasteryStats(katakanaData, userStreaks.value));
  const wordsMasteryStats = computed(() => computeCategoryMasteryStats(wordsData, userStreaks.value));

  const overallMasteryStats = computed(() => {
    const h = hiraganaMasteryStats.value, k = katakanaMasteryStats.value, w = wordsMasteryStats.value;
    const total = h.total + k.total + w.total, mastered = h.mastered + k.mastered + w.mastered;
    const crown = h.crown + k.crown + w.crown, learning = h.learning + k.learning + w.learning, newItems = h.newItems + k.newItems + w.newItems;
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

  const questionType = ref('hiragana');
  const quizLevel = ref<'basic' | 'n5'>('basic');
  const targetDurationMinutes = ref<number>(1);
  const selectedKanaCategory = ref<'all' | 'basic' | 'dakuten' | 'combination'>('all');
  const isTypingMode = computed(() => quizLevel.value === 'n5' || questionType.value === 'words' || questionType.value === 'sentences' || questionType.value === 'renshuu' || questionType.value === 'kaiwa');

  const userInput = ref('');
  const showReadingHint = ref(false);
  const showMeaningHint = ref(false);
  const currentQuestionIndex = ref(0);
  const score = ref(0);
  const questions = ref<any[]>([]);
  const initialQuestionCount = ref<number>(0);
  const selectedAnswer = ref<string | null>(null);
  const isAnswerCorrect = ref<boolean | null>(null);
  const quizCompleted = ref(false);
  const startTime = ref(0);
  const endTime = ref(0);
  const newRecordAchieved = ref(false);
  const levelBeforeQuiz = ref(1);
  const showLevelUpScreen = ref(false);
  const quizLesson = ref<string>('Pelajaran 1');
  const speedAchievement = ref<{ timeSavedSeconds: number; bonusPoints: number; isFaster: boolean; rankText: string; } | null>(null);
  const userAnswers = ref<any[]>([]);

  // Fully reactive tracking objects for Vue 3
  const masteredChars = ref<Record<string, boolean>>({});
  const attemptedChars = ref<Record<string, boolean>>({});
  const firstTryCorrectCount = ref<number>(0);

  const previewMode = ref<'none' | 'full_wave' | 'micro'>('none');
  const justClosedPreview = ref(false);
  const previewClosedTimestamp = ref<number>(0);

  const completeWavePreview = () => {
    if (currentWaveItems.value.length > 0) {
      currentWaveItems.value.forEach(item => {
        previewedItems.value[item.character] = true;
        introducedChars.value[item.character] = true;
      });
      saveIntroducedToStorage();
    }
    isWavePreviewActive.value = false;
    justClosedPreview.value = true;
    previewClosedTimestamp.value = Date.now();
    setTimeout(() => {
      justClosedPreview.value = false;
    }, 500);
  };

  const completeMicroPreview = () => {
    if (microPreviewItem.value) {
      previewedItems.value[microPreviewItem.value.character] = true;
      introducedChars.value[microPreviewItem.value.character] = true;
      saveIntroducedToStorage();
    }
    showMicroPreviewModal.value = false;
    microPreviewItem.value = null;
    justClosedPreview.value = true;
    previewClosedTimestamp.value = Date.now();
    setTimeout(() => {
      justClosedPreview.value = false;
    }, 500);
  };
  const previewedItems = ref<Record<string, boolean>>({});
  const fullWaveBatches = ref<any[]>([]);
  const currentWaveIndex = ref<number>(0);
  const isWavePreviewActive = ref<boolean>(false);
  const currentWaveItems = ref<any[]>([]);
  const microPreviewItem = ref<any | null>(null);
  const showMicroPreviewModal = ref<boolean>(false);

  const latestTierTransition = ref<TierTransition | null>(null);
  const sessionTierChanges = ref<TierTransition[]>([]);
  const sessionCharAttempts = ref<Record<string, { attempts: number; failed: boolean; initialStreak: number; streakEvaluated: boolean }>>({});

  const resetQuizSessionState = async (targetDuration: number, type: string, level: 'basic' | 'n5') => {
    isLoading.value = true; questionType.value = type; quizLevel.value = level; targetDurationMinutes.value = targetDuration;
    currentQuestionIndex.value = 0; score.value = 0; quizCompleted.value = false; selectedAnswer.value = null; isAnswerCorrect.value = null;
    userAnswers.value = []; userInput.value = ''; showReadingHint.value = false; showMeaningHint.value = false;
    newRecordAchieved.value = false; showLevelUpScreen.value = false; speedAchievement.value = null;
    sentenceStats.value = null;
    masteredChars.value = {}; attemptedChars.value = {}; firstTryCorrectCount.value = 0;
    sessionCharAttempts.value = {};

    // Reset lesson material states
    bunkeiList.value = [];
    kaiwaData.value = null;
    renshuuSessionQuestions.value = [];
    showLessonMaterial.value = false;
    isLessonMaterialCompleted.value = false;

    // Reset preview & tier transition states
    previewMode.value = 'none';
    fullWaveBatches.value = [];
    currentWaveIndex.value = 0;
    isWavePreviewActive.value = false;
    currentWaveItems.value = [];
    microPreviewItem.value = null;
    showMicroPreviewModal.value = false;
    latestTierTransition.value = null;
    sessionTierChanges.value = [];

    await loadStreaksFromServer();
    levelBeforeQuiz.value = currentUserLevel.value;
    quizLesson.value = `Pelajaran ${currentUserLevel.value}`;
    startTime.value = Date.now();
  };

  const startQuiz = async (
    targetDuration: number = 1,
    type: string = 'hiragana',
    level: 'basic' | 'n5' = 'basic',
    kanaCategory: 'all' | 'basic' | 'dakuten' | 'combination' = selectedKanaCategory.value
  ) => {
    selectedKanaCategory.value = kanaCategory;
    await resetQuizSessionState(targetDuration, type, level);

    if (type === 'kaiwa') {
      const data = await fetchLessonKaiwa(currentLessonNumber.value);
      kaiwaData.value = data;
      showLessonMaterial.value = true;
      isLessonMaterialCompleted.value = false;
      initialQuestionCount.value = data.lines.length;
      isLoading.value = false;
      return;
    }

    if (type === 'renshuu') {
      const authUserId = (await supabase.auth.getUser()).data.user?.id || null;
      const sessionData = await buildRenshuuSession(currentLessonNumber.value, authUserId, DEFAULT_RENSHUU_SESSION_SIZE);
      const allBunkei = await fetchLessonBunkei(currentLessonNumber.value);

      if (sessionData.relevantBunkeiIds.length > 0) {
        const filtered = allBunkei.filter(b => b.id && sessionData.relevantBunkeiIds.includes(b.id));
        bunkeiList.value = filtered.length > 0 ? filtered : allBunkei;
      } else {
        bunkeiList.value = allBunkei;
      }

      renshuuSessionQuestions.value = sessionData.questions;
      renshuuProgressStats.value = {
        masteredCount: sessionData.totalMastered,
        totalCount: sessionData.totalAtomic,
        progressPercent: sessionData.totalAtomic > 0 ? Math.round((sessionData.totalMastered / sessionData.totalAtomic) * 100) : 0
      };

      showLessonMaterial.value = true;
      isLessonMaterialCompleted.value = false;
      initialQuestionCount.value = sessionData.questions.length;
      isLoading.value = false;
      return;
    }

    if (type === 'sentences') {
      const sentenceCount = getQuestionCountFromDuration(targetDuration, type);
      const shuffled = [...sentencesData].sort(() => 0.5 - Math.random()).slice(0, sentenceCount);
      questions.value = shuffled.map(s => ({
        id: s.id,
        character: s.japanese,
        japanese: s.japanese,
        romaji_variants: s.romaji_variants,
        meaning: s.meaning_id,
        romaji: s.romaji_variants.map(v => v[0]).join('')
      }));
      initialQuestionCount.value = questions.value.length;
      isLoading.value = false;
      return;
    }

    const questionCount = getQuestionCountFromDuration(targetDuration, type);

    let finalPool = getFallbackLocalPool(type, level);

    try {
      let query = type === 'mix'
        ? supabase.from('quiz_items').select('*').in('category', ['hiragana', 'katakana'])
        : supabase.from('quiz_items').select('*').eq('category', type);

      if (['hiragana', 'katakana', 'mix'].includes(type) && selectedKanaCategory.value !== 'all') {
        query = query.eq('type', selectedKanaCategory.value);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        finalPool = data.map(item => ({
          character: item.character,
          romaji: item.romaji,
          kana: item.kana,
          meaning: item.meaning,
          type: type === 'words' ? ('word' as const) : (item.type as 'basic' | 'dakuten' | 'combination'),
          lesson: item.lesson
        }));
      }
    } catch (err) { }

    if (['hiragana', 'katakana', 'mix'].includes(type) && selectedKanaCategory.value !== 'all') {
      const filtered = finalPool.filter(item => item.type === selectedKanaCategory.value);
      if (filtered.length > 0) {
        finalPool = filtered;
      }
    }

    if (type === 'words') {
      finalPool = finalPool.filter(w => {
        const cleanKana = (w.kana || '').replace(/[～ー\-?？\s]/g, '');
        return cleanKana.length > 1;
      });

      // Urutkan kata/kanji berdasarkan urutan pelajaran progresif (Pelajaran 1 s/d 25)
      finalPool.sort((a, b) => {
        const numA = parseInt((a.lesson || 'Pelajaran 1').replace(/\D/g, '')) || 1;
        const numB = parseInt((b.lesson || 'Pelajaran 1').replace(/\D/g, '')) || 1;
        return numA - numB;
      });

      // Gunakan algoritma komposisi khusus Kanji: unique pool + spacing repeat + isFirstAppearance flag
      const kanjiQuestions = buildKanjiSessionQuestions(finalPool, questionCount, getMasteryStreak);
      questions.value = kanjiQuestions;

      // Kumpulkan item unlearned unik dalam sesi ini untuk ditampilkan di preview card awal
      // HANYA untuk kata yang benar-benar baru (belum pernah di-preview / dipelajari sama sekali)
      const uniqueUnlearnedInSession: any[] = [];
      const seenChars = new Set<string>();
      kanjiQuestions.forEach(q => {
        if (!seenChars.has(q.character)) {
          seenChars.add(q.character);
          const streak = userStreaks.value[q.character] || 0;
          const isIntroduced = !!introducedChars.value[q.character];
          if (streak === 0 && !isIntroduced) {
            uniqueUnlearnedInSession.push(q);
          }
        }
      });

      if (uniqueUnlearnedInSession.length > 0) {
        previewMode.value = 'full_wave';
        currentWaveIndex.value = 0;
        currentWaveItems.value = uniqueUnlearnedInSession;
        isWavePreviewActive.value = true;
      } else {
        previewMode.value = 'none';
        isWavePreviewActive.value = false;
      }

      initialQuestionCount.value = questionCount;
      isLoading.value = false;
      return;
    }

    // Mode Huruf (Hiragana / Katakana / Mix)
    // Continuous stream, probabilistic per-slot, tanpa wave batches / tanpa preview blocking
    previewMode.value = 'none';
    isWavePreviewActive.value = false;
    currentWaveItems.value = [];
    questions.value = buildHurufSessionQuestions(finalPool, questionCount, getMasteryStreak);

    initialQuestionCount.value = questions.value.length;
    isLoading.value = false;
  };

  const startWeakItemsQuiz = async (
    targetDuration: number = 1,
    type: string = 'hiragana',
    level: 'basic' | 'n5' = 'basic',
    kanaCategory: 'all' | 'basic' | 'dakuten' | 'combination' = selectedKanaCategory.value
  ) => {
    selectedKanaCategory.value = kanaCategory;
    await resetQuizSessionState(targetDuration, type, level);
    const questionCount = getQuestionCountFromDuration(targetDuration, type);
    let pool = getFallbackLocalPool(type, level);

    if (['hiragana', 'katakana', 'mix'].includes(type) && selectedKanaCategory.value !== 'all') {
      const filtered = pool.filter(item => item.type === selectedKanaCategory.value);
      if (filtered.length > 0) pool = filtered;
    }

    let weakPool = pool.filter(item => getMasteryStreak(item.character) < 3);
    if (weakPool.length === 0) weakPool = [...pool];

    if (type === 'words') {
      questions.value = buildKanjiSessionQuestions(weakPool, questionCount, getMasteryStreak);
    } else {
      questions.value = buildHurufSessionQuestions(weakPool, questionCount, getMasteryStreak);
    }

    initialQuestionCount.value = questions.value.length;
    isLoading.value = false;
  };

  const currentQuestion = computed(() => questions.value[currentQuestionIndex.value] || null);

  const options = computed(() => {
    if (!currentQuestion.value || isTypingMode.value) return [];
    const correctRomaji = currentQuestion.value.romaji;
    const correctRomajis = Array.isArray(correctRomaji) ? correctRomaji : [correctRomaji];

    // Gunakan pool jawaban sesuai kategori huruf jika dispesifikasikan
    let poolData = getFallbackLocalPool(questionType.value, quizLevel.value);
    if (['hiragana', 'katakana', 'mix'].includes(questionType.value) && selectedKanaCategory.value !== 'all') {
      const filtered = poolData.filter(w => w.type === selectedKanaCategory.value);
      if (filtered.length >= 6) {
        poolData = filtered;
      }
    }
    const pool = poolData.flatMap(w => Array.isArray(w.romaji) ? w.romaji : [w.romaji]);
    const incorrectOptions = Array.from(new Set(pool.filter(r => !correctRomajis.includes(r)))).sort(() => 0.5 - Math.random()).slice(0, 5);
    return [...incorrectOptions, correctRomajis[0]].sort(() => 0.5 - Math.random());
  });

  const submitAnswer = (romaji: string) => {
    if (quizCompleted.value || selectedAnswer.value !== null) return;
    const userAnswerClean = romaji.trim().toLowerCase();
    const current = currentQuestion.value;
    let isCorrectVal = false, isTypo = false;
    let hintsUsed = (showReadingHint.value ? 1 : 0) + (showMeaningHint.value ? 1 : 0);

    if (current) {
      if (checkIsCorrect(userAnswerClean, current.romaji)) isCorrectVal = true;
      else if (isTypingMode.value && checkIsTypo(userAnswerClean, current.romaji)) { isCorrectVal = false; isTypo = true; }
    }

    selectedAnswer.value = romaji;
    isAnswerCorrect.value = isCorrectVal;

    let pointsEarned = 0;
    if (isCorrectVal) {
      pointsEarned = isTypingMode.value ? (hintsUsed === 1 ? 3 : hintsUsed === 2 ? 2 : 4) : 4;
      score.value += pointsEarned;
      playCorrectSound();
      if (current) masteredChars.value[current.character] = true;
    } else {
      if (isTypo) { pointsEarned = 1; score.value += pointsEarned; }
      playIncorrectSound();
    }

    if (current) {
      const charKey = current.character;
      introducedChars.value[charKey] = true;
      saveIntroducedToStorage();
      const oldStreak = userStreaks.value[charKey] || 0;

      // Track first-attempt accuracy: count each correct answer during the initial main round (indices 0 to initialQuestionCount - 1)
      if (currentQuestionIndex.value < initialQuestionCount.value) {
        if (isCorrectVal) firstTryCorrectCount.value++;
      }

      if (questionType.value === 'words') {
        // Kanji Mode: evaluate streak & mastery update ONCE per unique word per session
        if (!sessionCharAttempts.value[charKey]) {
          sessionCharAttempts.value[charKey] = {
            attempts: 1,
            failed: !isCorrectVal,
            initialStreak: oldStreak,
            streakEvaluated: false
          };
        } else {
          sessionCharAttempts.value[charKey].attempts++;
          if (!isCorrectVal) {
            sessionCharAttempts.value[charKey].failed = true;
          }
        }

        const charSessionState = sessionCharAttempts.value[charKey];
        let streakChanged = false;
        let newStreak = oldStreak;

        if (!isCorrectVal) {
          // If incorrect on any slot, streak resets to 0
          if (oldStreak !== 0) {
            newStreak = 0;
            userStreaks.value[charKey] = 0;
            streakChanged = true;
          }
        } else if (isCorrectVal && !charSessionState.failed && !charSessionState.streakEvaluated) {
          // First clean correct answer for this word in session: increment streak +1
          charSessionState.streakEvaluated = true;
          newStreak = charSessionState.initialStreak + 1;
          userStreaks.value[charKey] = newStreak;
          streakChanged = true;
        }

        try { localStorage.setItem('japanese-quiz-streaks', JSON.stringify(userStreaks.value)); } catch (e) { }

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
      } else {
        // Kana & other standard modes (1 unique character per slot)
        const newStreak = pointsEarned === 4 ? oldStreak + 1 : 0;
        userStreaks.value[charKey] = newStreak;
        try { localStorage.setItem('japanese-quiz-streaks', JSON.stringify(userStreaks.value)); } catch (e) { }

        // Check Tier Transition
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

      // Record answer in Daily Goals Store
      const goalsStore = useGoalsStore();
      import('./authStore').then(({ useAuthStore }) => {
        const authStore = useAuthStore();
        goalsStore.recordAnswer(1, 0, authStore.user?.id);
      });

      userAnswers.value.push({
        character: current.character, correctRomaji: Array.isArray(current.romaji) ? current.romaji.join(' / ') : current.romaji,
        userRomaji: romaji || '(skipped)', isCorrect: isCorrectVal, kana: (current as any).kana, meaning: (current as any).meaning, pointsEarned, maxPoints: 4, isTypo, hintsUsed
      });

      if (!isCorrectVal) {
        questions.value = [...questions.value, { ...current, questionReason: 'repeat', reasonLabel: '🔁 Babak Perbaikan: Ulang Sampai Benar', isFirstAppearance: false }];
      }
    }
  };

  const submitToLeaderboard = async (submissionScore: number = score.value) => {
    const { useAuthStore } = await import('./authStore');
    const authStore = useAuthStore();
    if (!authStore.user) return;

    const durationSeconds = (endTime.value - startTime.value) / 1000;
    const { isNewRecord } = await submitLeaderboardScore({
      userId: authStore.user.id, username: authStore.displayUsername || 'Anonymous',
      submissionScore, durationSeconds, questionType: questionType.value, quizLevel: quizLevel.value
    });
    if (isNewRecord) newRecordAchieved.value = true;
  };

  const finishQuiz = () => {
    endTime.value = Date.now();
    const durationSeconds = Math.round((endTime.value - startTime.value) / 1000);
    const timeSavedSeconds = (targetDurationMinutes.value * 60) - durationSeconds;
    const finalSubmissionScore = score.value + (timeSavedSeconds > 0 ? Math.round(timeSavedSeconds * 0.5) : 0);

    if (timeSavedSeconds > 0) {
      const bonusPoints = Math.round(timeSavedSeconds * 0.5);
      let rankText = timeSavedSeconds >= 60 ? '🚀 Speed Demon!' : timeSavedSeconds >= 30 ? '⚡ Lightning Fast!' : '⚡ Selesai Lebih Cepat!';
      speedAchievement.value = { timeSavedSeconds, bonusPoints, isFaster: true, rankText };
    } else speedAchievement.value = { timeSavedSeconds: 0, bonusPoints: 0, isFaster: false, rankText: '🎯 Steady & Consistent' };

    submitToLeaderboard(finalSubmissionScore);

    const goalsStore = useGoalsStore();
    goalsStore.checkAndTriggerCelebration();

    if (currentUserLevel.value > levelBeforeQuiz.value) showLevelUpScreen.value = true;
    else quizCompleted.value = true;
  };

  const masteredCount = computed(() => Object.keys(masteredChars.value).length);

  const nextQuestion = () => {
    selectedAnswer.value = null;
    isAnswerCorrect.value = null;
    userInput.value = '';
    showReadingHint.value = false;
    showMeaningHint.value = false;
    latestTierTransition.value = null;

    const totalAnswered = userAnswers.value.length;
    const isSessionComplete = totalAnswered >= initialQuestionCount.value;

    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++;
    } else if (isSessionComplete || masteredCount.value >= initialQuestionCount.value) {
      finishQuiz();
    } else {
      const unmastered = questions.value.filter(q => !masteredChars.value[q.character]);
      if (unmastered.length > 0) {
        questions.value = [...questions.value, ...unmastered.map(q => ({ ...q, questionReason: 'repeat', reasonLabel: '🔁 Babak Perbaikan: Ulang Sampai Benar', isFirstAppearance: false }))];
        currentQuestionIndex.value++;
      } else {
        finishQuiz();
      }
    }
  };

  const restartQuiz = async () => {
    await startQuiz(targetDurationMinutes.value, questionType.value, quizLevel.value, selectedKanaCategory.value);
  };

  const progress = computed(() => {
    const total = initialQuestionCount.value || 1;
    return Math.min(100, Math.round((userAnswers.value.length / total) * 100));
  });

  const finalScore = computed(() => {
    const total = initialQuestionCount.value || 1;
    return Math.min(100, Math.round((firstTryCorrectCount.value / total) * 100));
  });

  const isMistakeRound = computed(() => currentQuestionIndex.value >= initialQuestionCount.value);

  const finishSentenceQuiz = (stats: { wpm: number; cpm: number; accuracy: number; errorCount: number; totalKeystrokes: number }) => {
    sentenceStats.value = stats;
    firstTryCorrectCount.value = Math.round((stats.accuracy / 100) * (initialQuestionCount.value || 1));
    score.value = Math.round(stats.accuracy);
    finishQuiz();
  };

  const loadRenshuuProgress = async (lessonNumber: number = currentLessonNumber.value) => {
    const authUserId = (await supabase.auth.getUser()).data.user?.id || null;
    const stats = await fetchRenshuuProgress(lessonNumber, authUserId);
    renshuuProgressStats.value = stats;
  };

  const recordRenshuuAnswer = async (itemId: string, itemType: 'a' | 'b' | 'c', isCorrect: boolean) => {
    const authUserId = (await supabase.auth.getUser()).data.user?.id || null;
    await saveRenshuuItemResult(itemId, itemType, isCorrect, authUserId);
    await loadRenshuuProgress(currentLessonNumber.value);
  };

  return {
    isLoading, quizLevel, questionType, selectedKanaCategory, isTypingMode, userInput, showReadingHint, showMeaningHint,
    currentQuestionIndex, score, questions, selectedAnswer, isAnswerCorrect, quizCompleted,
    startTime, endTime, newRecordAchieved, levelBeforeQuiz, showLevelUpScreen, quizLesson,
    speedAchievement, userAnswers, userStreaks, introducedChars, currentQuestion, options, progress, finalScore,
    hiraganaMasteryStats, katakanaMasteryStats, wordsMasteryStats, overallMasteryStats,
    currentUserLevel, isMistakeRound, masteredCount, initialQuestionCount, firstTryCorrectCount,
    sentenceStats,
    currentLessonNumber, bunkeiList, kaiwaData, renshuuSessionQuestions, renshuuProgressStats, showLessonMaterial, isLessonMaterialCompleted,
    previewMode, previewedItems, fullWaveBatches, currentWaveIndex, isWavePreviewActive, currentWaveItems,
    microPreviewItem, showMicroPreviewModal, latestTierTransition, sessionTierChanges, justClosedPreview, previewClosedTimestamp,
    completeWavePreview, completeMicroPreview,
    getMasteryStreak, getMasteryTier, startQuiz, startWeakItemsQuiz, submitAnswer,
    finishSentenceQuiz,
    nextQuestion, restartQuiz, loadStreaksFromServer, loadStreaksFromStorage,
    getLocalStreaks, fetchServerStreaks, syncLocalToServer, applyServerStreaks,
    loadRenshuuProgress, recordRenshuuAnswer
  };
});