<script setup lang="ts">
import { useQuizStore } from '../stores/quizStore';

defineProps<{
  quizStarted: boolean;
}>();

const quizStore = useQuizStore();
</script>

<template>
  <div 
    v-if="quizStarted && !quizStore.quizCompleted && (quizStore.isTypingMode || quizStore.selectedAnswer !== null)" 
    class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3.5 px-6 flex justify-center items-center shadow-lg z-30 w-full animate-fadeIn"
  >
    <div class="max-w-md w-full flex justify-center gap-4">
      <!-- Pre-answer actions (Only in typing mode - shown on desktop, handled by VirtualKeyboard on mobile) -->
      <template v-if="quizStore.selectedAnswer === null">
        <template v-if="quizStore.isTypingMode">
          <div class="hidden sm:flex justify-center gap-4 w-full">
            <button 
              class="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-xl transition duration-200 hover:bg-gray-300 cursor-pointer shadow-sm text-sm"
              @click="quizStore.submitAnswer('')"
            >
              Skip
            </button>
            <button 
              class="px-8 py-2.5 bg-indigo-600 text-white font-semibold rounded-xl transition duration-200 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm flex-1 max-w-[200px]"
              :disabled="quizStore.userInput.trim() === ''"
              @click="quizStore.submitAnswer(quizStore.userInput)"
            >
              Submit
            </button>
          </div>
        </template>
      </template>
      
      <!-- Post-answer Action (Next / See Results) -->
      <template v-else>
        <button 
          class="w-full sm:w-56 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl py-2.5 shadow-md hover:shadow-lg transition duration-200 flex justify-center items-center gap-2 cursor-pointer text-sm"
          @click="quizStore.nextQuestion"
        >
          <span>{{ quizStore.currentQuestionIndex < quizStore.questions.length - 1 ? 'Next Question' : 'See Results' }}</span>
          <span class="text-xs bg-indigo-500/50 px-2 py-0.5 rounded border border-indigo-400/30 font-mono">Enter</span>
        </button>
      </template>
    </div>
  </div>
</template>
