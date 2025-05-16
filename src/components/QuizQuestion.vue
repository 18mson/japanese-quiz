<script setup lang="ts">
import { computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';

const quizStore = useQuizStore();

const character = computed(() => {
  return quizStore.currentQuestion?.character || '';
});
</script>

<template>
  <div class="flex flex-col items-center my-4">
    <div
      class="w-40 h-40 flex items-center justify-center bg-gray-100 rounded-lg mb-6 shadow-md transition-transform duration-300 ease-in-out hover:translate-y-[-4px] hover:shadow-lg sm:w-30 sm:h-30"
    >
      <span class="text-5xl text-gray-800 font-medium">{{ character }}</span>
    </div>
    <p class="text-lg text-gray-600 m-0 text-center sm:text-base">
      What is the romaji (alphabetic) equivalent?
    </p>
  </div>
</template>
