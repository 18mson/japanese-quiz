<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue';
import { useQuizStore } from '../stores/quizStore';
import { Check, X, AlertTriangle } from '@lucide/vue';
import VirtualKeyboard from './VirtualKeyboard.vue';

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
  if (quizStore.isWavePreviewActive || quizStore.showMicroPreviewModal || quizStore.justClosedPreview) return;
  if (Date.now() - quizStore.previewClosedTimestamp < 500) return;
  if (quizStore.selectedAnswer === null) {
    if (userInput.value.trim() !== '') {
      submitAnswer();
    } else {
      quizStore.submitAnswer(''); // Skip if empty on Enter
    }
  } else {
    quizStore.nextQuestion();
  }
};

const handleVirtualKey = (char: string) => {
  if (isAnswered.value) return;
  userInput.value += char;
  focusInput();
};

const handleVirtualBackspace = () => {
  if (isAnswered.value) return;
  userInput.value = userInput.value.slice(0, -1);
  focusInput();
};

const handleVirtualEnter = () => {
  if (isAnswered.value) return;
  handleEnter();
  focusInput();
};

const isAnswered = computed(() => quizStore.selectedAnswer !== null);

const currentWord = computed(() => quizStore.currentQuestion);

const correctRomajiDisplay = computed(() => {
  if (!currentWord.value) return '';
  return Array.isArray(currentWord.value.romaji) 
    ? currentWord.value.romaji.join(' or ') 
    : currentWord.value.romaji;
});

const isTypo = computed(() => {
  const lastAns = quizStore.userAnswers[quizStore.userAnswers.length - 1];
  return lastAns && lastAns.character === currentWord.value?.character && lastAns.isTypo;
});
</script>

<template>
  <div class="w-full max-w-md mx-auto flex flex-col items-center pb-36 sm:pb-0">
    <!-- Typing Area -->
    <div class="w-full mb-6 relative">
      <input
        ref="inputRef"
        v-model="userInput"
        type="text"
        inputmode="none"
        placeholder="Type romaji here..."
        class="w-full px-6 py-4 text-xl font-bold text-center bg-white dark:bg-slate-800 text-slate-800 dark:text-white border-2 border-gray-300 dark:border-slate-700/80 rounded-xl shadow-inner transition-all duration-300 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100/50 dark:focus:ring-indigo-900/40 disabled:bg-gray-50 dark:disabled:bg-slate-900 disabled:text-gray-500 dark:disabled:text-slate-500 disabled:cursor-not-allowed"
        :class="{
          'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/40 focus:ring-emerald-100/50': isAnswered && quizStore.isAnswerCorrect,
          'border-rose-500 bg-rose-50/30 dark:bg-rose-950/40 focus:ring-rose-100/50': isAnswered && !quizStore.isAnswerCorrect
        }"
        :disabled="isAnswered"
        @keydown.enter.stop="handleEnter"
        autocomplete="off"
        autocorrect="off"
        autocapitalize="off"
        spellcheck="false"
      />
      <div v-if="!isAnswered" class="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
        <span class="hidden md:inline text-xs text-gray-400 dark:text-slate-400 bg-gray-100 dark:bg-slate-800 px-2 py-1 rounded border border-gray-200 dark:border-slate-700 font-mono">⏎ Enter</span>
      </div>
    </div>

    <!-- Actions are rendered globally in bottom navbar -->

    <!-- Post-Answer Detailed Feedback (Animate Slide Up) -->
    <div v-if="isAnswered" class="w-full flex flex-col items-center animate-slideUp">
      <!-- Status Card -->
      <div 
        class="w-full rounded-2xl p-4 sm:p-5 mb-4 text-center border shadow-sm transition-all duration-300 animate-pulse-subtle"
        :class="[
          quizStore.isAnswerCorrect 
            ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-emerald-100/50' 
            : (isTypo 
              ? 'bg-amber-50 dark:bg-amber-950/80 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 shadow-amber-100/50' 
              : 'bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200 shadow-rose-100/50')
        ]"
      >
        <div class="flex flex-col items-center gap-2">
          <!-- Checkmark/cross icon -->
          <div 
            class="w-12 h-12 rounded-full flex items-center justify-center text-white mb-2 shadow-md transition-transform scale-100 duration-500 animate-icon-pop"
            :class="quizStore.isAnswerCorrect ? 'bg-emerald-500' : (isTypo ? 'bg-amber-500' : 'bg-rose-500')"
          >
            <Check v-if="quizStore.isAnswerCorrect" class="w-6 h-6 stroke-[3px]" />
            <AlertTriangle v-else-if="isTypo" class="w-6 h-6 stroke-[2.5px]" />
            <X v-else class="w-6 h-6 stroke-[3px]" />
          </div>

          <h3 class="text-2xl font-bold tracking-tight">
            <template v-if="quizStore.isAnswerCorrect">Benar!</template>
            <template v-else-if="isTypo">Hampir! Salah ketik (+1 Poin)</template>
            <template v-else>Salah</template>
          </h3>
          
          <div class="mt-2 space-y-1">
            <p v-if="!quizStore.isAnswerCorrect" class="text-sm">
              Jawabanmu: <span class="font-mono px-2 py-0.5 rounded" :class="isTypo ? 'bg-amber-100 dark:bg-amber-900/70 text-amber-900 dark:text-amber-100' : 'bg-rose-100 dark:bg-rose-900/70 text-rose-900 dark:text-rose-100'">{{ userInput || '(dilewati)' }}</span>
            </p>
            <p class="text-base font-semibold">
              Romaji yang benar: <span class="font-mono bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 px-2 py-0.5 rounded text-indigo-700 dark:text-indigo-300 shadow-sm">{{ correctRomajiDisplay }}</span>
            </p>
          </div>
        </div>

        <!-- Explanation Block -->
        <div class="mt-4 pt-4 border-t border-dashed border-gray-300/50 dark:border-slate-700/60 flex flex-col items-center">
          <div class="flex items-baseline gap-2 flex-wrap justify-center">
            <span class="text-2xl font-bold text-gray-800 dark:text-slate-100">{{ currentWord?.character }}</span>
            <span v-if="(currentWord as any)?.kana" class="text-base text-gray-500 dark:text-slate-400 font-medium">
              （{{ (currentWord as any)?.kana }}）
            </span>
          </div>
          <p v-if="(currentWord as any)?.meaning" class="mt-2 text-sm text-gray-600 dark:text-slate-300 italic">
            Arti: {{ (currentWord as any)?.meaning }}
          </p>
        </div>
      </div>

      <!-- Next button is rendered globally in bottom navbar -->
    </div>
  </div>

  <!-- Mobile Virtual Keyboard -->
  <div v-if="!isAnswered" class="block sm:hidden fixed bottom-0 left-0 right-0 z-40">
    <VirtualKeyboard
      theme="auto"
      enter-label="SUBMIT"
      :disabled="isAnswered"
      @key="handleVirtualKey"
      @backspace="handleVirtualBackspace"
      @enter="handleVirtualEnter"
    >
      <template #top>
        <button
          type="button"
          class="px-4 py-1.5 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-200 font-bold rounded-lg text-xs transition border border-gray-300 dark:border-slate-600 flex items-center gap-1 cursor-pointer shadow-xs"
          @click="quizStore.submitAnswer('')"
        >
          <span>Skip</span>
          <span class="text-[10px]">⏭</span>
        </button>

        <span class="text-[11px] font-medium text-slate-400 dark:text-slate-400">
          Ketik romaji & tekan Submit ⏎
        </span>
      </template>
    </VirtualKeyboard>
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
