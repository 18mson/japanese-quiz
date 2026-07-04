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
  <div class="p-8 max-w-3xl mx-auto animate-slide-up w-full" v-if="quizStore.quizCompleted">
    <h2 class="text-2xl text-gray-800 text-center mb-8 font-bold">Quiz Results</h2>
    
    <div class="flex flex-col items-center mb-12">
      <div class="w-36 h-36 rounded-full bg-gradient-to-br from-indigo-600 to-teal-400 flex items-center justify-center mb-4 shadow-lg border-4 border-white">
        <span class="text-4xl font-bold text-white">{{ Math.round(quizStore.finalScore) }}%</span>
      </div>
      <p class="text-lg text-gray-600 text-center max-w-lg font-medium">{{ getScoreMessage() }}</p>
    </div>
    
    <div class="bg-gray-100 rounded-2xl p-6 mb-8 border border-gray-200">
      <h3 class="text-lg text-gray-800 mb-4 pb-2 border-b border-gray-300/70 font-semibold">Question Summary</h3>
      <ul class="space-y-3">
        <li 
          v-for="(answer, index) in quizStore.userAnswers" 
          :key="index"
          class="flex items-center p-4 rounded-xl bg-white shadow-sm transition-all duration-200 hover:shadow"
          :class="{ 'border-l-4 border-emerald-500': answer.isCorrect, 'border-l-4 border-rose-500': !answer.isCorrect }"
        >
          <div 
            class="text-2xl w-16 h-16 flex flex-col items-center justify-center mr-4 bg-gray-50 text-gray-800 font-bold rounded-lg border border-gray-200/50 px-1"
          >
            <span :class="answer.character.length > 4 ? 'text-xs' : 'text-lg'">
              {{ answer.character }}
            </span>
          </div>
          <div class="flex-1 flex flex-col min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="font-bold text-sm" :class="{ 'text-emerald-600': answer.isCorrect, 'text-rose-600': !answer.isCorrect }">
                {{ answer.isCorrect ? 'Correct' : 'Incorrect' }}
              </span>
              <span v-if="answer.kana" class="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100/50 animate-fadeIn">
                {{ answer.kana }}
              </span>
            </div>
            <span class="text-sm text-gray-600 mt-1 truncate">
              <template v-if="answer.isCorrect">
                You typed: <code class="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-xs">{{ answer.userRomaji }}</code>
              </template>
              <template v-else>
                You typed: <code class="font-mono bg-rose-50 text-rose-700 px-1.5 py-0.5 rounded text-xs">{{ answer.userRomaji }}</code> | Correct: <code class="font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-xs font-semibold">{{ answer.correctRomaji }}</code>
              </template>
            </span>
            <span v-if="answer.meaning" class="text-xs text-gray-500 italic mt-0.5">
              Meaning: {{ answer.meaning }}
            </span>
          </div>
        </li>
      </ul>
    </div>
    
    <button 
      class="block w-full max-w-xs mx-auto py-3.5 px-6 bg-indigo-600 text-white rounded-xl text-lg font-semibold hover:bg-indigo-700 transition shadow-md hover:shadow-lg hover:-translate-y-0.5 cursor-pointer"
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
