import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { hiraganaData, type HiraganaCharacter } from '../data/hiragana';
import { katakanaData } from '../data/katakana';
import { wordsData, type JapaneseWord } from '../data/words';
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
  const questionType = ref('hiragana'); // 'hiragana', 'katakana', or 'words'
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
  const getRandomQuestionSet = (count: number = 10, type: string = 'hiragana') => {
    const shuffled = [];
    if (type === 'hiragana') {
      shuffled.push(...[...hiraganaData].sort(() => 0.5 - Math.random()));
    } else if (type === 'katakana') {
      shuffled.push(...[...katakanaData].sort(() => 0.5 - Math.random()));
    } else if (type === 'words') {
      shuffled.push(...[...wordsData].sort(() => 0.5 - Math.random()));
    }
    return shuffled.slice(0, count);
  };
  
  // Start a new quiz
  const startQuiz = (questionCount: number = 10, type: string = 'hiragana') => {
    questions.value = getRandomQuestionSet(questionCount, type);
    questionType.value = type;
    currentQuestionIndex.value = 0;
    score.value = 0;
    quizCompleted.value = false;
    selectedAnswer.value = null;
    isAnswerCorrect.value = null;
    userAnswers.value = [];
  };
  
  // Current question
  const currentQuestion = computed(() => {
    return questions.value[currentQuestionIndex.value] || null;
  });
  
  // Generate options including the correct one and 5 random incorrect ones (for multiple choice)
  const options = computed(() => {
    if (!currentQuestion.value || questionType.value === 'words') return [];
    
    const correctRomaji = currentQuestion.value.romaji as string;
    const pool = questionType.value === 'hiragana' ? hiraganaData : katakanaData;
    const incorrectOptions = pool
      .filter(h => h.romaji !== correctRomaji)
      .sort(() => 0.5 - Math.random())
      .slice(0, 5)
      .map(h => h.romaji);
    const allOptions = [...incorrectOptions, correctRomaji];
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
    
    if (currentQuestionIndex.value < questions.value.length - 1) {
      currentQuestionIndex.value++;
    } else {
      quizCompleted.value = true;
    }
  };
  
  // Restart the quiz
  const restartQuiz = () => {
    startQuiz(questions.value.length, questionType.value);
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
    questionType,
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