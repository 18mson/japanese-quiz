import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { hiraganaData, type HiraganaCharacter } from '../data/hiragana';
import { katakanaData } from '../data/katakana';

export const useQuizStore = defineStore('quiz', () => {
  // State
  const questionType = ref('hiragana'); // 'hiragana' or 'katakana'
  const currentQuestionIndex = ref(0);
  const score = ref(0);
  const questions = ref<HiraganaCharacter[]>([]);
  const selectedAnswer = ref<string | null>(null);
  const isAnswerCorrect = ref<boolean | null>(null);
  const quizCompleted = ref(false);
  const userAnswers = ref<{ 
    character: string; 
    correctRomaji: string; 
    userRomaji: string | null; 
    isCorrect: boolean; 
  }[]>([]);
  
  // Get a random set of Hiragana characters for the quiz
  const getRandomHiraganaSet = (count: number = 10, type: string = 'hiragana') => {
    const shuffled = [];
    if (type === 'hiragana') {
      shuffled.push(...[...hiraganaData].sort(() => 0.5 - Math.random()));
    } else if (type === 'katakana') {
      shuffled.push(...[...katakanaData].sort(() => 0.5 - Math.random()));
    }
    return shuffled.slice(0, count);
  };
  
  // Start a new quiz
  const startQuiz = (questionCount: number = 10, type: string = 'hiragana') => {
    questions.value = getRandomHiraganaSet(questionCount, type);
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
  
  // Generate options including the correct one and 5 random incorrect ones
  const options = computed(() => {
    if (!currentQuestion.value) return [];
    
    const correctRomaji = currentQuestion.value.romaji;
    const incorrectOptions = (questionType.value === 'hiragana' ? hiraganaData : katakanaData)
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
    
    const correct = romaji === currentQuestion.value?.romaji;
    selectedAnswer.value = romaji;
    isAnswerCorrect.value = correct;
    
    if (correct) {
      score.value++;
    }
    
    // Record user's answer
    userAnswers.value.push({
      character: currentQuestion.value?.character || '',
      correctRomaji: currentQuestion.value?.romaji || '',
      userRomaji: romaji,
      isCorrect: correct
    });
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