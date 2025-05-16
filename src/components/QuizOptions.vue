<script setup lang="ts">
import { useQuizStore } from '../stores/quizStore';

const quizStore = useQuizStore();

const submitOption = (option: string) => {
  quizStore.submitAnswer(option);
};

const getOptionClass = (option: string) => {
  if (quizStore.selectedAnswer === null) return '';
  
  if (option === quizStore.currentQuestion?.romaji) {
    return 'border-green-500 bg-green-100 text-green-800';
  }
  
  if (option === quizStore.selectedAnswer && option !== quizStore.currentQuestion?.romaji) {
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
  <div class="flex flex-col items-center " v-if="quizStore.selectedAnswer !== null">
      <div class="pb-4">
        <div v-if="quizStore.isAnswerCorrect" class="text-lg font-semibold p-3 rounded-lg w-full text-center bg-green-100 text-green-800">
          <span>Correct! 🎉</span>
        </div>
        <div v-else class="text-lg font-semibold p-3 rounded-lg w-full text-center bg-red-100 text-red-800">
          <span>Incorrect. The correct answer is "{{ quizStore.currentQuestion?.romaji }}"</span>
        </div>
      </div>
      <button class="w-56 bg-indigo-500 text-white rounded-lg p-3 text-base font-semibold cursor-pointer transition hover:bg-indigo-600" @click="quizStore.nextQuestion">
        {{ quizStore.currentQuestionIndex < quizStore.questions.length - 1 ? 'Next' : 'See Results' }}
      </button>
    </div>
</template>
