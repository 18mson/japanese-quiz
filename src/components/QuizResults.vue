<script setup lang="ts">
import { useQuizStore } from '../stores/quizStore';

const quizStore = useQuizStore();

const getScoreMessage = () => {
  const score = quizStore.finalScore;
  
  if (score >= 90) return 'Outstanding! You\'re a Hiragana master!';
  if (score >= 70) return 'Great job! You\'re getting very good at this!';
  if (score >= 50) return 'Nice work! Keep practicing to improve!';
  return 'Good effort! With more practice, you\'ll improve quickly!';
};
</script>

<template>
  <div class="p-8 max-w-3xl mx-auto animate-slide-up" v-if="quizStore.quizCompleted">
    <h2 class="text-2xl text-gray-800 text-center mb-8">Quiz Results</h2>
    
    <div class="flex flex-col items-center mb-12">
      <div class="w-36 h-36 rounded-full bg-gradient-to-br from-indigo-600 to-pink-300 flex items-center justify-center mb-4 shadow-lg">
        <span class="text-4xl font-bold text-white">{{ Math.round(quizStore.finalScore) }}%</span>
      </div>
      <p class="text-lg text-gray-600 text-center max-w-lg">{{ getScoreMessage() }}</p>
    </div>
    
    <div class="bg-gray-100 rounded-lg p-6 mb-8">
      <h3 class="text-lg text-gray-800 mb-4 pb-2 border-b border-gray-300">Question Summary</h3>
      <ul class="space-y-3">
        <li 
          v-for="(answer, index) in quizStore.userAnswers" 
          :key="index"
          class="flex items-center p-4 rounded-lg bg-white shadow-sm"
          :class="{ 'border-l-4 border-green-500': answer.isCorrect, 'border-l-4 border-red-500': !answer.isCorrect }"
        >
          <div class="text-2xl w-16 h-16 flex items-center justify-center mr-4 bg-gray-200 rounded-lg">
            {{ answer.character }}
          </div>
          <div class="flex-1 flex flex-col">
            <span class="font-semibold mb-1" :class="{ 'text-green-600': answer.isCorrect, 'text-red-600': !answer.isCorrect }">
              {{ answer.isCorrect ? 'Correct' : 'Incorrect' }}
            </span>
            <span class="text-sm text-gray-500">
              <template v-if="answer.isCorrect">
                You answered: {{ answer.userRomaji }}
              </template>
              <template v-else>
                You answered: {{ answer.userRomaji }} | Correct: {{ answer.correctRomaji }}
              </template>
            </span>
          </div>
        </li>
      </ul>
    </div>
    
    <button class="block w-full max-w-xs mx-auto py-3 px-6 bg-indigo-600 text-white rounded-lg text-lg font-semibold hover:bg-indigo-700 transition">
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
