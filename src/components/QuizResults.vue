<script setup lang="ts">
import { useQuizStore } from '../stores/quizStore';

const quizStore = useQuizStore();

const getScoreMessage = () => {
  const score = quizStore.finalScore;
  const isWords = quizStore.questionType === 'words';
  
  if (score >= 90) return isWords ? 'Outstanding! You\'re an everyday Japanese vocabulary master!' : 'Outstanding! You\'re a Japanese character master!';
  if (score >= 70) return 'Great job! You\'re getting very good at this!';
  if (score >= 50) return 'Nice work! Keep practicing to improve!';
  return 'Good effort! With more practice, you\'ll improve quickly!';
};
</script>

<template>
  <div class="p-4 md:p-6 max-w-3xl mx-auto animate-slide-up w-full h-full flex flex-col overflow-hidden" v-if="quizStore.quizCompleted">
    <h2 class="text-xl text-gray-800 text-center mb-4 font-bold flex-shrink-0">Quiz Results</h2>
    
    <div class="flex flex-col items-center mb-6 flex-shrink-0">
      <div class="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-600 to-teal-400 flex items-center justify-center mb-2 shadow-lg border-4 border-white">
        <span class="text-2xl font-bold text-white">{{ Math.round(quizStore.finalScore) }}%</span>
      </div>
      <p class="text-base text-gray-600 text-center max-w-lg font-medium">{{ getScoreMessage() }}</p>
    </div>
    
    <div class="bg-gray-100 rounded-2xl p-4 mb-4 border border-gray-200 flex-1 flex flex-col overflow-hidden">
      <h3 class="text-md text-gray-800 mb-2 pb-2 border-b border-gray-300/70 font-semibold flex-shrink-0">Question Summary</h3>
      <ul class="space-y-2 flex-1 overflow-y-auto pr-1">
        <li 
          v-for="(answer, index) in quizStore.userAnswers" 
          :key="index"
          class="flex items-center p-3 rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow"
          :class="{ 'border-l-4 border-emerald-500': answer.isCorrect, 'border-l-4 border-rose-500': !answer.isCorrect }"
        >
          <div 
            class="text-xl w-14 h-14 flex flex-col items-center justify-center mr-3 bg-gray-50 text-gray-800 font-bold rounded-lg border border-gray-200/50 px-1 flex-shrink-0"
          >
            <span :class="answer.character.length > 4 ? 'text-[10px] leading-tight' : 'text-base'">
              {{ answer.character }}
            </span>
          </div>
          <div class="flex-1 flex flex-col min-w-0">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-bold text-xs" :class="{ 'text-emerald-600': answer.isCorrect, 'text-rose-600': !answer.isCorrect }">
                {{ answer.isCorrect ? 'Correct' : 'Incorrect' }}
              </span>
              <span v-if="answer.kana" class="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/50">
                {{ answer.kana }}
              </span>
            </div>
            <span class="text-xs text-gray-600 mt-0.5 truncate">
              <template v-if="answer.isCorrect">
                {{ quizStore.isTypingMode ? 'You typed:' : 'You chose:' }} <code class="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px]">{{ answer.userRomaji }}</code>
              </template>
              <template v-else>
                {{ quizStore.isTypingMode ? 'You typed:' : 'You chose:' }} <code class="font-mono bg-rose-50 text-rose-700 px-1 py-0.5 rounded text-[10px]">{{ answer.userRomaji }}</code> | Correct: <code class="font-mono bg-emerald-50 text-emerald-700 px-1 py-0.5 rounded text-[10px] font-semibold">{{ answer.correctRomaji }}</code>
              </template>
            </span>
            <span v-if="answer.meaning" class="text-[10px] text-gray-500 italic mt-0.5">
              Meaning: {{ answer.meaning }}
            </span>
          </div>
        </li>
      </ul>
    </div>
    
    <button 
      class="block w-full max-w-xs mx-auto py-2.5 px-6 bg-indigo-600 text-white rounded-xl text-base font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer flex-shrink-0"
      @click="quizStore.restartQuiz"
    >
      Try Again
    </button>
  </div>
</template>

<style>
@keyframes slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
