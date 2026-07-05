import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { hiraganaData, type HiraganaCharacter } from '../data/hiragana';
import { katakanaData } from '../data/katakana';
import { wordsData, type JapaneseWord } from '../data/words';
import { supabase } from '../lib/supabaseClient';
import incorrect from '../assets/sound/incorrect.wav';
import correct from '../assets/sound/correct.wav';

// Flexible Romaji Normalization Helper for Comparison
const normalizeRomajiForComparison = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/nn/g, 'n') // normalize double n to single n (IME style vs standard)
    .replace(/tsu/g, 'tu') // normalize tsu/tu
    .replace(/shi/g, 'si') // normalize shi/si
    .replace(/chi/g, 'ti') // normalize chi/ti
    .replace(/ji/g, 'zi')  // normalize ji/zi
    .replace(/ou/g, 'o')   // normalize long vowels ou -> o
    .replace(/oo/g, 'o')   // normalize long vowels oo -> o
    .replace(/sh/g, 'sy')  // normalize sha/sho/shu
    .replace(/ch/g, 'ty')  // normalize cha/cho/chu
    .replace(/j/g, 'zy');   // normalize ja/jo/ju
};

const getLevenshteinDistance = (a: string, b: string): number => {
  const tmp = [];
  let i, j;
  for (i = 0; i <= a.length; i++) {
    tmp[i] = [i];
  }
  for (j = 0; j <= b.length; j++) {
    tmp[0][j] = j;
  }
  for (i = 1; i <= a.length; i++) {
    for (j = 1; j <= b.length; j++) {
      tmp[i][j] = Math.min(
        tmp[i - 1][j] + 1, // deletion
        tmp[i][j - 1] + 1, // insertion
        tmp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1) // substitution
      );
    }
  }
  return tmp[a.length][b.length];
};

const checkIsCorrect = (userInputClean: string, targetRomaji: string | string[]): boolean => {
  const targets = Array.isArray(targetRomaji) ? targetRomaji : [targetRomaji];
  return targets.some(t => {
    return normalizeRomajiForComparison(userInputClean) === normalizeRomajiForComparison(t);
  });
};

const checkIsTypo = (userInputClean: string, targetRomaji: string | string[]): boolean => {
  const targets = Array.isArray(targetRomaji) ? targetRomaji : [targetRomaji];
  return targets.some(t => {
    const normUser = normalizeRomajiForComparison(userInputClean);
    const normTarget = normalizeRomajiForComparison(t);
    if (normUser === normTarget) return false;
    const dist = getLevenshteinDistance(normUser, normTarget);
    return dist === 1;
  });
};

export const useQuizStore = defineStore('quiz', () => {
  // State
  const isLoading = ref(false);
  const userStreaks = ref<Record<string, number>>({});

  const getOrCreateUserId = (): string => {
    let userId = localStorage.getItem('japanese-quiz-user-id');
    if (!userId) {
      userId = crypto.randomUUID();
      localStorage.setItem('japanese-quiz-user-id', userId);
    }
    return userId;
  };

  const loadStreaksFromServer = async () => {
    const userId = getOrCreateUserId();
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('character, streak')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      const newStreaks: Record<string, number> = {};
      if (data) {
        data.forEach(item => {
          newStreaks[item.character] = item.streak;
        });
      }
      userStreaks.value = newStreaks;
      localStorage.setItem('japanese-quiz-streaks', JSON.stringify(newStreaks));
    } catch (e) {
      console.error('Failed to load streaks from server, using local fallback:', e);
      try {
        const stored = localStorage.getItem('japanese-quiz-streaks');
        if (stored) userStreaks.value = JSON.parse(stored);
      } catch (localErr) {
        console.error('Failed to read local streaks:', localErr);
      }
    }
  };

  const getMasteryStreak = (character: string): number => {
    return userStreaks.value[character] || 0;
  };

  const quizLevel = ref<'basic' | 'n5'>('basic');
  const quizLesson = ref<string>('all');
  const currentUserLevel = computed(() => {
    // Level 1 words are all words in wordsData that do not have lesson label or have lesson === 'Pelajaran 1'
    const level1Words = wordsData.filter(w => !w.lesson || w.lesson === 'Pelajaran 1');
    if (level1Words.length === 0) return 1;
    
    // Check if every word in level1Words has a streak >= 3
    const allLevel1Mastered = level1Words.every(w => {
      const streak = userStreaks.value[w.character] || 0;
      return streak >= 3;
    });
    
    return allLevel1Mastered ? 2 : 1;
  });
  const questionType = ref('hiragana'); // 'hiragana', 'katakana', or 'words'
  const isTypingMode = computed(() => {
    return quizLevel.value === 'n5' || questionType.value === 'words';
  });
  const userInput = ref('');
  const showReadingHint = ref(false);
  const showMeaningHint = ref(false);
  const currentQuestionIndex = ref(0);
  const score = ref(0);
  const questions = ref<(HiraganaCharacter | JapaneseWord)[]>([]);
  const selectedAnswer = ref<string | null>(null);
  const isAnswerCorrect = ref<boolean | null>(null);
  const quizCompleted = ref(false);
  const startTime = ref(0);
  const endTime = ref(0);
  const newRecordAchieved = ref(false);
  const levelBeforeQuiz = ref(1);
  const showLevelUpScreen = ref(false);
  const userAnswers = ref<{ 
    character: string; 
    correctRomaji: string; 
    userRomaji: string | null; 
    isCorrect: boolean; 
    kana?: string;
    meaning?: string;
    pointsEarned: number;
    maxPoints: number;
    isTypo: boolean;
    hintsUsed: number;
  }[]>([]);

  const correctSound = new Audio(correct);
  correctSound.preload = 'auto';
  const incorrectSound = new Audio(incorrect);
  correctSound.preload = 'auto';
  incorrectSound.preload = 'auto';
  
  // Get a random set of characters/words for the quiz
  const getRandomQuestionSet = (
    count: number = 10, 
    type: string = 'hiragana', 
    level: 'basic' | 'n5' = 'basic',
    lesson: string = 'all'
  ) => {
    let pool: any[] = [];
    if (type === 'hiragana') {
      pool = [...hiraganaData];
      if (level === 'basic') {
        pool = pool.filter(c => c.type === 'basic');
      }
    } else if (type === 'katakana') {
      pool = [...katakanaData];
      if (level === 'basic') {
        pool = pool.filter(c => c.type === 'basic');
      }
    } else if (type === 'words') {
      pool = [...wordsData];
      if (level === 'basic') {
        pool = pool.filter(w => !/[\u4e00-\u9faf\u3400-\u4dbf]/.test(w.character));
      }
      if (lesson !== 'all') {
        pool = pool.filter(w => w.lesson === lesson);
      }
    }
    
    // Apply spaced repetition streaks filter
    let filteredPool = pool.filter(item => {
      const streak = getMasteryStreak(item.character);
      return streak < 3 || Math.random() > 0.85;
    });
    
    if (filteredPool.length < count) {
      filteredPool = [...pool];
    }
    
    const shuffled = [...filteredPool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  };
  
  // Start a new quiz
  const startQuiz = async (
    questionCount: number = 10, 
    type: string = 'hiragana', 
    level: 'basic' | 'n5' = 'basic'
  ) => {
    isLoading.value = true;
    questionType.value = type;
    quizLevel.value = level;
    currentQuestionIndex.value = 0;
    score.value = 0;
    quizCompleted.value = false;
    selectedAnswer.value = null;
    isAnswerCorrect.value = null;
    userAnswers.value = [];
    userInput.value = '';
    showReadingHint.value = false;
    showMeaningHint.value = false;
    newRecordAchieved.value = false;
    showLevelUpScreen.value = false;

    // Load mastery streaks from server/local
    await loadStreaksFromServer();
    
    // Set levelBeforeQuiz and quizLesson after streaks are loaded!
    levelBeforeQuiz.value = currentUserLevel.value;
    quizLesson.value = `Pelajaran ${currentUserLevel.value}`;
    startTime.value = Date.now();

    try {
      let query = supabase
        .from('quiz_items')
        .select('*')
        .eq('category', type);
      
      if (type === 'hiragana' || type === 'katakana') {
        if (level === 'basic') {
          query = query.eq('type', 'basic');
        }
      } else if (type === 'words') {
        if (level === 'basic') {
          query = query.eq('has_kanji', false);
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;
      if (!data || data.length === 0) throw new Error('No quiz data returned from Supabase.');

      const mappedData = data.map(item => {
        if (type === 'words') {
          return {
            character: item.character,
            romaji: item.romaji,
            kana: item.kana,
            meaning: item.meaning,
            type: 'word' as const,
            lesson: item.lesson
          };
        } else {
          return {
            character: item.character,
            romaji: item.romaji[0],
            type: item.type as 'basic' | 'dakuten' | 'combination',
            lesson: item.lesson
          };
        }
      });

      let finalPool = [...mappedData];
      
      // Unified progression logic for everyday words quiz
      if (type === 'words') {
        const level1Words = mappedData.filter(w => !w.lesson || w.lesson === 'Pelajaran 1');
        const level2Words = mappedData.filter(w => w.lesson === 'Pelajaran 2');
        
        const unmasteredLevel1 = level1Words.filter(w => {
          const streak = userStreaks.value[w.character] || 0;
          return streak < 3;
        });
        
        if (unmasteredLevel1.length === 0) {
          // Level 1 is fully mastered! Active pool includes Level 1 + Level 2
          finalPool = [...level1Words, ...level2Words];
        } else {
          // Level 1 has unmastered words! Active pool is ONLY Level 1
          finalPool = [...level1Words];
        }
      }

      // Apply spaced repetition filter to pool
      let filteredData = finalPool.filter(item => {
        const streak = getMasteryStreak(item.character);
        return streak < 3 || Math.random() > 0.85;
      });

      if (filteredData.length < questionCount) {
        filteredData = [...finalPool];
      }

      questions.value = [...filteredData]
        .sort(() => 0.5 - Math.random())
        .slice(0, questionCount);

    } catch (err) {
      console.warn('Failed to fetch questions from Supabase. Falling back to local dataset.', err);
      questions.value = getRandomQuestionSet(questionCount, type, level);
    } finally {
      isLoading.value = false;
    }
  };
  
  // Current question
  const currentQuestion = computed(() => {
    return questions.value[currentQuestionIndex.value] || null;
  });
  
  // Generate options including the correct one and 5 random incorrect ones (for multiple choice)
  const options = computed(() => {
    if (!currentQuestion.value || isTypingMode.value) return [];
    
    const correctRomaji = currentQuestion.value.romaji;
    const correctRomajis = Array.isArray(correctRomaji) ? correctRomaji : [correctRomaji];
    const correctStr = correctRomajis[0];
    
    let pool: string[] = [];
    if (questionType.value === 'hiragana') {
      const charPool = quizLevel.value === 'basic' 
        ? hiraganaData.filter(h => h.type === 'basic') 
        : hiraganaData;
      pool = charPool.map(h => h.romaji);
    } else if (questionType.value === 'katakana') {
      const charPool = quizLevel.value === 'basic' 
        ? katakanaData.filter(k => k.type === 'basic') 
        : katakanaData;
      pool = charPool.map(k => k.romaji);
    } else if (questionType.value === 'words') {
      const wordPool = quizLevel.value === 'basic'
        ? wordsData.filter(w => !/[\u4e00-\u9faf\u3400-\u4dbf]/.test(w.character))
        : wordsData;
      pool = wordPool.flatMap(w => Array.isArray(w.romaji) ? w.romaji : [w.romaji]);
    }
    
    const incorrectOptions = pool
      .filter(r => !correctRomajis.includes(r))
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);
      
    const allOptions = [...incorrectOptions, correctStr];
    return allOptions.sort(() => 0.5 - Math.random());
  });
  
  // Submit an answer
  const submitAnswer = (romaji: string) => {
    if (quizCompleted.value || selectedAnswer.value !== null) return;
    
    const userAnswerClean = romaji.trim().toLowerCase();
    const current = currentQuestion.value;
    
    let isCorrectVal = false;
    let isTypo = false;
    let hintsUsed = 0;
    if (showReadingHint.value) hintsUsed++;
    if (showMeaningHint.value) hintsUsed++;
    
    if (current) {
      if (checkIsCorrect(userAnswerClean, current.romaji)) {
        isCorrectVal = true;
        isTypo = false;
      } else if (isTypingMode.value && checkIsTypo(userAnswerClean, current.romaji)) {
        isCorrectVal = false; // Typo gets marked as INCORRECT response!
        isTypo = true;
      }
    }
    
    selectedAnswer.value = romaji;
    isAnswerCorrect.value = isCorrectVal;
    
    let pointsEarned = 0;
    if (isCorrectVal) {
      if (isTypingMode.value) {
        let basePoints = 4;
        if (hintsUsed === 1) {
          basePoints = 3;
        } else if (hintsUsed === 2) {
          basePoints = 2;
        }
        pointsEarned = basePoints;
      } else {
        // Multiple choice always gets 4 points
        pointsEarned = 4;
      }
      
      score.value += pointsEarned;
      correctSound.play().catch(err => console.log('Audio playback prevented:', err));
    } else {
      if (isTypo) {
        pointsEarned = 1; // Typo still gets 1 point
        score.value += pointsEarned;
      }
      incorrectSound.play().catch(err => console.log('Audio playback prevented:', err));
    }
    
    // Update mastery streaks in Supabase and locally
    if (current) {
      const charKey = current.character;
      const isFullScore = pointsEarned === 4;
      const newStreak = isFullScore ? (userStreaks.value[charKey] || 0) + 1 : 0;
      
      // Update local cache immediately
      userStreaks.value[charKey] = newStreak;
      try {
        localStorage.setItem('japanese-quiz-streaks', JSON.stringify(userStreaks.value));
      } catch (e) {
        console.error('Failed to save streaks locally:', e);
      }
      
      // Sync to Supabase asynchronously
      const userId = getOrCreateUserId();
      supabase
        .from('user_streaks')
        .upsert(
          { user_id: userId, character: charKey, streak: newStreak },
          { onConflict: 'user_id,character' }
        )
        .then(({ error }) => {
          if (error) {
            console.error('Failed to sync streak to Supabase:', error);
          }
        });
    }
    
    // Record user's answer
    if (current) {
      userAnswers.value.push({
        character: current.character,
        correctRomaji: Array.isArray(current.romaji) ? current.romaji.join(' / ') : current.romaji,
        userRomaji: romaji || '(skipped)',
        isCorrect: isCorrectVal,
        kana: (current as any).kana,
        meaning: (current as any).meaning,
        pointsEarned: pointsEarned,
        maxPoints: 4,
        isTypo: isTypo,
        hintsUsed: hintsUsed
      });
    }
  };
  
  const submitToLeaderboard = async () => {
    const { useAuthStore } = await import('./authStore');
    const authStore = useAuthStore();
    
    if (!authStore.user) return; // Only submit if logged in
    
    const durationSeconds = (endTime.value - startTime.value) / 1000;
    const usernameVal = authStore.displayUsername || 'Anonymous';
    
    try {
      // Check if this attempt breaks any record BEFORE inserting
      // 1. Check speed leaderboard
      const { data: topSpeed } = await supabase
        .from('leaderboard_speed')
        .select('duration_seconds')
        .limit(10);
        
      let isSpeedRecord = false;
      if (!topSpeed || topSpeed.length < 10) {
        isSpeedRecord = true;
      } else {
        const slowestTopTime = Math.max(...topSpeed.map(r => r.duration_seconds));
        if (durationSeconds < slowestTopTime) {
          isSpeedRecord = true;
        }
      }
      
      // 2. Check cumulative leaderboard
      const { data: topCumulative } = await supabase
        .from('leaderboard_cumulative')
        .select('total_score')
        .limit(10);
        
      // Fetch user's previous total score
      const { data: userPrev } = await supabase
        .from('leaderboard_cumulative')
        .select('total_score')
        .eq('username', usernameVal)
        .maybeSingle();
        
      const newTotalScore = (userPrev?.total_score || 0) + score.value;
      
      let isCumulativeRecord = false;
      if (!topCumulative || topCumulative.length < 10) {
        isCumulativeRecord = true;
      } else {
        const lowestTopScore = Math.min(...topCumulative.map(r => r.total_score));
        if (newTotalScore > lowestTopScore) {
          isCumulativeRecord = true;
        }
      }

      if (isSpeedRecord || isCumulativeRecord) {
        newRecordAchieved.value = true;
      }

      const { error } = await supabase
        .from('leaderboard')
        .insert({
          user_id: authStore.user.id,
          username: usernameVal,
          score: score.value,
          duration_seconds: durationSeconds,
          quiz_type: questionType.value,
          quiz_level: quizLevel.value
        });
        
      if (error) throw error;
      console.log('Successfully submitted score to leaderboard!');
    } catch (err) {
      console.error('Failed to submit to leaderboard:', err);
    }
  };

  // Move to next question
  const nextQuestion = () => {
    selectedAnswer.value = null;
    isAnswerCorrect.value = null;
    userInput.value = '';
    showReadingHint.value = false;
    showMeaningHint.value = false;
    
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++;
    } else {
      endTime.value = Date.now();
      submitToLeaderboard();
      
      const levelAfter = currentUserLevel.value;
      if (levelAfter > levelBeforeQuiz.value) {
        showLevelUpScreen.value = true;
      } else {
        quizCompleted.value = true;
      }
    }
  };
  
  // Restart the quiz
  const restartQuiz = async () => {
    await startQuiz(questions.value.length, questionType.value, quizLevel.value);
  };
  
  // Calculate progress as percentage
  const progress = computed(() => {
    return ((currentQuestionIndex.value + 1) / questions.value.length) * 100;
  });
  
  // Final score as percentage (based on max possible points)
  const finalScore = computed(() => {
    if (questions.value.length === 0) return 0;
    return (score.value / (questions.value.length * 4)) * 100;
  });
  
  return {
    isLoading,
    quizLevel,
    quizLesson,
    questionType,
    isTypingMode,
    userInput,
    showReadingHint,
    showMeaningHint,
    currentQuestionIndex,
    score,
    questions,
    selectedAnswer,
    isAnswerCorrect,
    quizCompleted,
    startTime,
    endTime,
    newRecordAchieved,
    currentUserLevel,
    showLevelUpScreen,
    userAnswers,
    currentQuestion,
    options,
    progress,
    finalScore,
    userStreaks,
    loadStreaksFromServer,
    startQuiz,
    submitAnswer,
    nextQuestion,
    restartQuiz,
    submitToLeaderboard
  };
});