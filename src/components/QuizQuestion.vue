<script setup lang="ts">
import { computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { Lightbulb, BookOpen, RotateCcw } from '@lucide/vue';

const quizStore = useQuizStore();

const showReadingHint = computed({
  get: () => quizStore.showReadingHint,
  set: (val) => quizStore.showReadingHint = val
});
const showMeaningHint = computed({
  get: () => quizStore.showMeaningHint,
  set: (val) => {
    if (val) quizStore.openMeaningHint();
    else quizStore.showMeaningHint = false;
  }
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
    <!-- Reason Badge (Only shown for retry/perbaikan questions) -->
    <div 
      v-if="questionReason === 'repeat' && reasonLabel" 
      class="mb-2 px-3 py-1 rounded-full text-xs font-bold shadow-xs flex items-center gap-1.5 border bg-white/95 text-rose-700 border-rose-300/90 dark:bg-slate-900/95 dark:text-rose-300 dark:border-rose-700/80 animate-fadeIn select-none"
    >
      <RotateCcw class="w-3.5 h-3.5 text-rose-500 shrink-0" />
      <span>{{ reasonLabel.replace(/^[\p{Emoji}\p{Symbol}\s]+/gu, '') }}</span>
    </div>

    <!-- Question Character / Word Area -->
    <div
      :class="[
        'flex flex-col items-center justify-center bg-transparent border-0 shadow-none mb-3 px-4 py-2 transition-all duration-300',
        isWord 
          ? 'w-full max-w-md' 
          : 'w-full max-w-xs sm:max-w-sm'
      ]"
    >
      <div class="flex flex-col items-center text-center w-full">
        <!-- Display Character/Word -->
        <span 
          :class="[
            'text-gray-900 dark:text-slate-100 font-black tracking-wide transition-all duration-300 leading-none font-jp drop-shadow-xs whitespace-nowrap select-none',
            isWord 
              ? (character.length > 6 ? 'text-3xl sm:text-4xl' : (character.length > 3 ? 'text-4xl sm:text-5xl' : 'text-5xl sm:text-6xl'))
              : (character.length >= 2 ? 'text-5xl sm:text-6xl' : 'text-6xl sm:text-7xl')
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
              class="text-[10px] px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-indigo-600 dark:text-torii-light rounded-full border border-gray-200 dark:border-slate-700 transition-all duration-200 shadow-sm cursor-pointer hover:shadow focus:outline-none flex items-center gap-1"
              @click="showReadingHint = true"
            >
              <Lightbulb class="w-3 h-3 text-indigo-600 dark:text-torii" />
              <span>Reading Hint</span>
            </button>
            <span v-else class="text-xs font-semibold text-indigo-700 dark:text-torii-light bg-indigo-50 dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 px-2.5 py-0.5 rounded-full animate-hintPop shadow-sm">
              Reading: <span class="font-jp">{{ currentKana }}</span>
            </span>
          </template>

          <!-- Meaning Hint Button/Pill -->
          <template v-if="currentMeaning">
            <button 
              v-if="!showMeaningHint"
              class="text-[10px] px-2.5 py-1 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-indigo-600 dark:text-torii-light rounded-full border border-gray-200 dark:border-slate-700 transition-all duration-200 shadow-sm cursor-pointer hover:shadow focus:outline-none flex items-center gap-1"
              @click="quizStore.openMeaningHint()"
            >
              <BookOpen class="w-3 h-3 text-indigo-600 dark:text-torii" />
              <span>Petunjuk Arti</span>
            </button>
            <span v-else class="text-xs font-medium text-teal-700 dark:text-matcha bg-teal-50 dark:bg-slate-800 border border-teal-100 dark:border-slate-700 px-2.5 py-0.5 rounded-full animate-hintPop shadow-sm">
              Arti: {{ currentMeaning }}
            </span>
          </template>
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
