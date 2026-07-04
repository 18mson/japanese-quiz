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

export const useQuizStore = defineStore('quiz', () => {
  // State
  const isLoading = ref(false);
  const quizLevel = ref<'basic' | 'n5'>('basic');
  const questionType = ref('hiragana'); // 'hiragana', 'katakana', or 'words'
  const isTypingMode = computed(() => {
    return quizLevel.value === 'n5' || questionType.value === 'words';
  });
  const userInput = ref('');
  const currentQuestionIndex = ref(0);
  const score = ref(0);
  const questions = ref<(HiraganaCharacter | JapaneseWord)[]>([]);
  const selectedAnswer = ref<string | null>(null);
  const isAnswerCorrect = ref<boolean | null>(null);
  const quizCompleted = ref(false);
  const userAnswers = ref<{ 
    character: string; 
    correctRomaji: string; 
    userRomaji: string | null; 
    isCorrect: boolean; 
    kana?: string;
    meaning?: string;
  }[]>([]);

  const correctSound = new Audio(correct);
  correctSound.preload = 'auto';
  const incorrectSound = new Audio(incorrect);
  correctSound.preload = 'auto';
  incorrectSound.preload = 'auto';
  
  // Get a random set of characters/words for the quiz
  const getRandomQuestionSet = (count: number = 10, type: string = 'hiragana', level: 'basic' | 'n5' = 'basic') => {
    const shuffled = [];
    if (type === 'hiragana') {
      let pool = [...hiraganaData];
      if (level === 'basic') {
        pool = pool.filter(c => c.type === 'basic');
      }
      shuffled.push(...pool.sort(() => 0.5 - Math.random()));
    } else if (type === 'katakana') {
      let pool = [...katakanaData];
      if (level === 'basic') {
        pool = pool.filter(c => c.type === 'basic');
      }
      shuffled.push(...pool.sort(() => 0.5 - Math.random()));
    } else if (type === 'words') {
      let pool = [...wordsData];
      if (level === 'basic') {
        pool = pool.filter(w => !/[\u4e00-\u9faf\u3400-\u4dbf]/.test(w.character));
      }
      shuffled.push(...pool.sort(() => 0.5 - Math.random()));
    }
    return shuffled.slice(0, count);
  };
  
  // Start a new quiz
  const startQuiz = async (questionCount: number = 10, type: string = 'hiragana', level: 'basic' | 'n5' = 'basic') => {
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
            type: 'word' as const
          };
        } else {
          return {
            character: item.character,
            romaji: item.romaji[0],
            type: item.type as 'basic' | 'dakuten' | 'combination'
          };
        }
      });

      questions.value = [...mappedData]
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
    let correct = false;
    
    if (current) {
      const target = current.romaji;
      if (Array.isArray(target)) {
        correct = target.some(t => normalizeRomajiForComparison(t) === normalizeRomajiForComparison(userAnswerClean));
      } else {
        correct = normalizeRomajiForComparison(target) === normalizeRomajiForComparison(userAnswerClean);
      }
    }
    
    selectedAnswer.value = romaji;
    isAnswerCorrect.value = correct;
    
    if (correct) {
      score.value++;
      correctSound.play().catch(err => console.log('Audio playback prevented:', err));
    } else {
      incorrectSound.play().catch(err => console.log('Audio playback prevented:', err));
    }
    
    // Record user's answer
    if (current) {
      userAnswers.value.push({
        character: current.character,
        correctRomaji: Array.isArray(current.romaji) ? current.romaji.join(' / ') : current.romaji,
        userRomaji: romaji || '(skipped)',
        isCorrect: correct,
        kana: (current as any).kana,
        meaning: (current as any).meaning
      });
    }
  };
  
  // Move to next question
  const nextQuestion = () => {
    selectedAnswer.value = null;
    isAnswerCorrect.value = null;
    userInput.value = '';
    
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++;
    } else {
      quizCompleted.value = true;
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
  
  // Final score as percentage
  const finalScore = computed(() => {
    return (score.value / questions.value.length) * 100;
  });
  
  return {
    isLoading,
    quizLevel,
    questionType,
    isTypingMode,
    userInput,
    currentQuestionIndex,
    score,
    questions,
    selectedAnswer,
    isAnswerCorrect,
    quizCompleted,
    userAnswers,
    currentQuestion,
    options,
    progress,
    finalScore,
    startQuiz,
    submitAnswer,
    nextQuestion,
    restartQuiz
  };
});