<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuizStore } from '../stores/quizStore';

const quizStore = useQuizStore();

const showReadingHint = ref(false);
const showMeaningHint = ref(false);

// Reset hints on next question
watch(() => quizStore.currentQuestionIndex, () => {
  showReadingHint.value = false;
  showMeaningHint.value = false;
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

const currentMeaning = computed(() => {
  return (quizStore.currentQuestion as any)?.meaning || '';
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
    <!-- Big Question Card -->
    <div
      :class="[
        'flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50/50 to-indigo-100/30 border border-indigo-100/50 rounded-2xl mb-2.5 shadow-sm transition-all duration-300 ease-out hover:translate-y-[-2px] hover:shadow-md',
        isWord ? 'w-full max-w-md min-h-24 py-3 px-4' : 'w-28 h-28'
      ]"
    >
      <div class="flex flex-col items-center text-center w-full">
        <!-- Display Character/Word -->
        <span 
          :class="[
            'text-gray-800 font-bold tracking-wide transition-all duration-300 leading-none',
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
          <button 
            v-if="!showReadingHint"
            class="text-[10px] px-2.5 py-1 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-indigo-600 rounded-full border border-indigo-200 transition-all duration-200 shadow-sm cursor-pointer hover:shadow focus:outline-none"
            @click="showReadingHint = true"
          >
            💡 Reading Hint
          </button>
          <span v-else class="text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full animate-hintPop shadow-sm">
            Reading: {{ currentKana }}
          </span>

          <!-- Meaning Hint Button/Pill -->
          <button 
            v-if="!showMeaningHint"
            class="text-[10px] px-2.5 py-1 bg-white hover:bg-indigo-50 hover:border-indigo-300 text-indigo-600 rounded-full border border-indigo-200 transition-all duration-200 shadow-sm cursor-pointer hover:shadow focus:outline-none"
            @click="showMeaningHint = true"
          >
            📝 Meaning Hint
          </button>
          <span v-else class="text-xs font-medium text-teal-700 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full animate-hintPop shadow-sm">
            Meaning: {{ currentMeaning }}
          </span>
        </div>
      </div>
    </div>
    
    <p class="text-sm text-gray-500 m-0 text-center font-medium">
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
