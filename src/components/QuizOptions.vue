<script setup lang="ts">
import { useQuizStore } from '../stores/quizStore';

const quizStore = useQuizStore();

const submitOption = (option: string) => {
  quizStore.submitAnswer(option);
};

const getOptionClass = (option: string) => {
  if (quizStore.selectedAnswer === null) return '';
  
  const correctRomaji = quizStore.currentQuestion?.romaji;
  const isCorrect = Array.isArray(correctRomaji)
    ? correctRomaji.includes(option)
    : correctRomaji === option;
  
  if (isCorrect) {
    return 'border-green-500 bg-green-100 text-green-800';
  }
  
  if (option === quizStore.selectedAnswer && !isCorrect) {
    return 'border-red-500 bg-red-100 text-red-800';
  }
  
  return 'opacity-60 cursor-not-allowed';
};
</script>

<template>
  <div class="grid grid-cols-3 gap-4 mb-4">
    <button 
      v-for="option in quizStore.options" 
      :key="option"
      class="p-4 text-lg bg-white border-2 border-gray-300 rounded-lg cursor-pointer transition-all flex justify-center items-center min-h-16 hover:border-indigo-500 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-300"
      :class="getOptionClass(option)"
      @click="submitOption(option)"
      :disabled="quizStore.selectedAnswer !== null"
    >
      {{ option }}
    </button>
  </div>
  <div class="w-full" v-if="quizStore.selectedAnswer !== null">
    <div class="pb-4">
      <div v-if="quizStore.isAnswerCorrect" class="text-lg font-semibold p-3 rounded-lg w-full text-center bg-green-100 text-green-800 animate-fadeIn">
        <span>Correct! 🎉</span>
      </div>
      <div v-else class="text-lg font-semibold p-3 rounded-lg w-full text-center bg-red-100 text-red-800 animate-fadeIn">
        <span>Incorrect. The correct answer is "{{ Array.isArray(quizStore.currentQuestion?.romaji) ? quizStore.currentQuestion?.romaji.join(' or ') : quizStore.currentQuestion?.romaji }}"</span>
      </div>
    </div>
  </div>
  <!-- Next button is rendered globally in bottom navbar -->
</template>
