<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';

const quizStore = useQuizStore();
const userInput = computed({
  get: () => quizStore.userInput,
  set: (val) => quizStore.userInput = val
});
const inputRef = ref<HTMLInputElement | null>(null);

const focusInput = () => {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.focus();
    }
  });
};

onMounted(() => {
  focusInput();
});

// Refocus input and clear on next question
watch(() => quizStore.currentQuestionIndex, () => {
  userInput.value = '';
  focusInput();
});

const submitAnswer = () => {
  if (userInput.value.trim() === '') return;
  quizStore.submitAnswer(userInput.value);
};

const handleEnter = () => {
  if (quizStore.selectedAnswer === null) {
    if (userInput.value.trim() !== '') {
      submitAnswer();
    } else {
      quizStore.submitAnswer(''); // Skip if empty on Enter
    }
  }
};

const isAnswered = computed(() => quizStore.selectedAnswer !== null);

const currentWord = computed(() => quizStore.currentQuestion);

const correctRomajiDisplay = computed(() => {
  if (!currentWord.value) return '';
  return Array.isArray(currentWord.value.romaji) 
    ? currentWord.value.romaji.join(' or ') 
    : currentWord.value.romaji;
});
</script>

<template>
  <div class="w-full max-w-md mx-auto flex flex-col items-center">
    <!-- Typing Area -->
    <div class="w-full mb-6 relative">
      <input
        ref="inputRef"
        v-model="userInput"
        type="text"
        placeholder="Type romaji here..."
        class="w-full px-6 py-4 text-xl text-center bg-white border-2 border-gray-300 rounded-xl shadow-inner transition-all duration-300 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed"
        :class="{
          'border-green-500 bg-green-50/30 focus:ring-green-100/50': isAnswered && quizStore.isAnswerCorrect,
          'border-red-500 bg-red-50/30 focus:ring-red-100/50': isAnswered && !quizStore.isAnswerCorrect
        }"
        :disabled="isAnswered"
        @keydown.enter.stop="handleEnter"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      />
      <div v-if="!isAnswered" class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
        <span class="hidden md:inline text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded border mr-2 font-mono">⏎ Enter</span>
      </div>
    </div>

    <!-- Actions are rendered globally in bottom navbar -->

    <!-- Post-Answer Detailed Feedback (Animate Slide Up) -->
    <div v-if="isAnswered" class="w-full flex flex-col items-center animate-slideUp">
      <!-- Status Card -->
      <div 
        class="w-full rounded-2xl p-6 mb-6 text-center border shadow-sm transition-all duration-300 animate-pulse-subtle"
        :class="[
          quizStore.isAnswerCorrect 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-100/50' 
            : 'bg-rose-50 border-rose-200 text-rose-900 shadow-rose-100/50'
        ]"
      >
        <div class="flex flex-col items-center gap-2">
          <!-- Checkmark/cross icon -->
          <div 
            class="w-12 h-12 rounded-full flex items-center justify-center text-white mb-2 shadow-md transition-transform scale-100 duration-500 animate-icon-pop"
            :class="quizStore.isAnswerCorrect ? 'bg-emerald-500' : 'bg-rose-500'"
          >
            <span class="text-2xl font-bold">{{ quizStore.isAnswerCorrect ? '✓' : '✗' }}</span>
          </div>

          <h3 class="text-2xl font-bold tracking-tight">
            {{ quizStore.isAnswerCorrect ? 'Correct! True' : 'Incorrect. False' }}
          </h3>
          
          <div class="mt-2 space-y-1">
            <p v-if="!quizStore.isAnswerCorrect" class="text-sm">
              Your answer: <span class="font-mono bg-rose-100 px-2 py-0.5 rounded text-rose-800">{{ userInput || '(skipped)' }}</span>
            </p>
            <p class="text-base font-semibold">
              Correct Romaji: <span class="font-mono bg-white border border-gray-200 px-2 py-0.5 rounded text-indigo-700 shadow-sm">{{ correctRomajiDisplay }}</span>
            </p>
          </div>
        </div>

        <!-- Explanation Block -->
        <div class="mt-4 pt-4 border-t border-dashed border-gray-300/50 flex flex-col items-center">
          <div class="flex items-baseline gap-2 flex-wrap justify-center">
            <span class="text-2xl font-bold text-gray-800">{{ currentWord?.character }}</span>
            <span v-if="(currentWord as any)?.kana" class="text-base text-gray-500 font-medium">
              （{{ (currentWord as any)?.kana }}）
            </span>
          </div>
          <p v-if="(currentWord as any)?.meaning" class="mt-2 text-sm text-gray-600 italic">
            Meaning: {{ (currentWord as any)?.meaning }}
          </p>
        </div>
      </div>

      <!-- Next button is rendered globally in bottom navbar -->
    </div>
  </div>
</template>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes iconPop {
  0% {
    transform: scale(0.6);
  }
  70% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1.0);
  }
}

.animate-slideUp {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-icon-pop {
  animation: iconPop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}
</style>
