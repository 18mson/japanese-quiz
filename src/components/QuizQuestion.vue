<script setup lang="ts">
import { computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { Lightbulb, BookOpen } from '@lucide/vue';

const quizStore = useQuizStore();

const showReadingHint = computed({
  get: () => quizStore.showReadingHint,
  set: (val) => quizStore.showReadingHint = val
});
const showMeaningHint = computed({
  get: () => quizStore.showMeaningHint,
  set: (val) => quizStore.showMeaningHint = val
});

const character = computed(() => {
  return quizStore.currentQuestion?.character || '';
});

const isWord = computed(() => {
  return quizStore.currentQuestion?.type === 'word';
});

const currentKana = computed(() => {
  return (quizStore.currentQuestion as any)?.kana || '';
});

const hasValidReadingHint = computed(() => {
  const kana = currentKana.value.trim();
  if (!kana) return false;
  // Hide hint if it contains any Latin characters (Romaji)
  return !/[a-zA-Z]/.test(kana);
});

const currentMeaning = computed(() => {
  return (quizStore.currentQuestion as any)?.meaning || '';
});

const reasonLabel = computed(() => {
  return (quizStore.currentQuestion as any)?.reasonLabel || '';
});

const questionReason = computed(() => {
  return (quizStore.currentQuestion as any)?.questionReason || 'weak';
});

const instructionText = computed(() => {
  if (quizStore.isTypingMode) {
    return isWord.value 
      ? 'Type the romaji equivalent of this word!' 
      : 'Type the romaji equivalent of this character!';
  } else {
    return 'Select the correct romaji equivalent of this character!';
  }
});
</script>

<template>
  <div class="flex flex-col items-center my-2 w-full flex-shrink-0">
    <!-- Real-time Tier Upgrade Badge Overlay (< 100ms instant feedback) -->
    <div 
      v-if="quizStore.latestTierTransition && quizStore.latestTierTransition.direction === 'up'"
      class="mb-2 px-3.5 py-1 rounded-full text-xs font-black shadow-lg flex items-center gap-1.5 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-slate-950 border border-yellow-200 cursor-default"
    >
      <span>✨ {{ quizStore.latestTierTransition.label }} 🎉</span>
    </div>

    <!-- Reason Badge (Only shown for retry/perbaikan questions) -->
    <div 
      v-else-if="questionReason === 'repeat' && reasonLabel" 
      class="mb-2 px-3.5 py-1 rounded-full text-xs tracking-tight shadow-sm flex items-center gap-1.5 border bg-gradient-to-r from-rose-500 to-amber-500 text-white border-rose-300 font-extrabold animate-pulse"
    >
      <span>{{ reasonLabel }}</span>
    </div>

    <!-- Big Question Card -->
    <div
      :class="[
        'flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 dark:from-indigo-950/40 dark:to-slate-800/80 border border-indigo-100/50 dark:border-slate-700/80 rounded-2xl mb-2.5 shadow-sm transition-all duration-300 ease-out hover:translate-y-[-2px] hover:shadow-md',
        isWord ? 'w-full max-w-md min-h-24 py-3 px-4' : 'w-28 h-28'
      ]"
    >
      <div class="flex flex-col items-center text-center w-full">
        <!-- Display Character/Word -->
        <span 
          :class="[
            'text-gray-800 dark:text-white font-bold tracking-wide transition-all duration-300 leading-none',
            isWord 
              ? (character.length > 6 ? 'text-2xl' : 'text-3xl')
              : 'text-4xl font-bold'
          ]"
        >
          {{ character }}
        </span>
        
        <!-- Interactive Hints (Only for Words Quiz when not answered yet) -->
        <div v-if="isWord && quizStore.selectedAnswer === null" class="mt-2.5 flex gap-2 flex-wrap justify-center animate-fadeIn">
          <!-- Reading Hint Button/Pill -->
          <template v-if="hasValidReadingHint">
            <button 
              v-if="!showReadingHint"
              class="text-[10px] px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:border-indigo-300 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-slate-700 transition-all duration-200 shadow-sm cursor-pointer hover:shadow focus:outline-none flex items-center gap-1"
              @click="showReadingHint = true"
            >
              <Lightbulb class="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span>Reading Hint</span>
            </button>
            <span v-else class="text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 px-2.5 py-0.5 rounded-full animate-hintPop shadow-sm">
              Reading: {{ currentKana }}
            </span>
          </template>

          <!-- Meaning Hint Button/Pill -->
          <button 
            v-if="!showMeaningHint"
            class="text-[10px] px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 hover:border-indigo-300 text-indigo-600 dark:text-indigo-400 rounded-full border border-indigo-200 dark:border-slate-700 transition-all duration-200 shadow-sm cursor-pointer hover:shadow focus:outline-none flex items-center gap-1"
            @click="showMeaningHint = true"
          >
            <BookOpen class="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            <span>Petunjuk Arti</span>
          </button>
          <span v-else class="text-xs font-medium text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border border-teal-100 dark:border-teal-800 px-2.5 py-0.5 rounded-full animate-hintPop shadow-sm">
            Arti: {{ currentMeaning }}
          </span>
        </div>
      </div>
    </div>
    
    <p class="text-sm text-gray-500 dark:text-slate-400 m-0 text-center font-medium">
      {{ instructionText }}
    </p>
  </div>
</template>

<style scoped>
@keyframes hintPop {
  0% {
    transform: scale(0.9);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-hintPop {
  animation: hintPop 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out forwards;
}
</style>
