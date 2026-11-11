<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import * as wanakana from 'wanakana';
import { useConjugationQuizStore } from '../../stores/conjugationQuizStore';
import { useQuizStore } from '../../stores/quizStore';
import SpeakerButton from '../SpeakerButton.vue';
import QuizActionNavbar from '../common/QuizActionNavbar.vue';
import { Check, X, Sparkles, RefreshCw, Send, Keyboard } from '@lucide/vue';

const emit = defineEmits<{
  (e: 'exit'): void;
}>();

const conjugationStore = useConjugationQuizStore();
const quizStore = useQuizStore();

const isAnswered = ref(false);
const isCurrentCorrect = ref(false);
const typedInput = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const currentQ = computed(() => conjugationStore.currentQuestion);
const isLastQuestion = computed(() => conjugationStore.currentIndex >= conjugationStore.totalQuestions - 1);

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
  nextTick(() => {
    inputRef.value?.focus();
  });
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  // Transliterasi romaji ke hiragana secara langsung saat mengetik
  const converted = wanakana.toHiragana(target.value, { IMEMode: true });
  typedInput.value = converted;
  target.value = converted;
}

function handleTypedSubmit() {
  if (isAnswered.value || !typedInput.value.trim() || !currentQ.value) return;
  const val = typedInput.value.trim();
  isAnswered.value = true;

  const result = conjugationStore.checkAnswer(val);
  isCurrentCorrect.value = result.isCorrect;
}

function proceedToNext() {
  if (isLastQuestion.value) {
    conjugationStore.nextQuestion();
    const formattedAnswers = conjugationStore.userAnswers.map(ans => {
      const q = ans.question;
      const displayTitle = `${q.baseWord} → ${q.correctAnswer} (${q.targetFormLabel})`;
      return {
        character: displayTitle,
        meaning: q.meaning,
        userRomaji: ans.givenAnswer,
        correctRomaji: q.correctAnswer,
        isCorrect: ans.isCorrect,
        pointsEarned: ans.isCorrect ? 4 : 0
      };
    });

    quizStore.finishConjugationQuiz({
      score: conjugationStore.score,
      accuracy: conjugationStore.accuracy,
      answers: formattedAnswers
    });
    return;
  }

  conjugationStore.nextQuestion();
  isAnswered.value = false;
  isCurrentCorrect.value = false;
  typedInput.value = '';

  nextTick(() => {
    inputRef.value?.focus();
  });
}

function handleKeyDown(e: KeyboardEvent) {
  if (isAnswered.value) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      proceedToNext();
    }
  }
}
</script>

<template>
  <div class="w-full max-w-2xl mx-auto flex flex-col gap-4 py-2 px-3 sm:px-4 pb-28">
    <!-- Top Bar: Sub-mode, Progress, Skor, & Streak -->
    <div class="flex items-center justify-between gap-3 text-xs">
      <div class="flex items-center gap-2">
        <button
          type="button"
          @click="emit('exit')"
          class="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title="Keluar ke Menu"
        >
          <X class="w-4 h-4" />
        </button>
        <span class="px-2.5 py-1 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/20 shadow-2xs">
          {{ currentQ?.category === 'verb' ? 'Kata Kerja' : 'Kata Sifat' }}
        </span>
        <span class="font-mono text-slate-500 dark:text-slate-400 font-bold">
          Soal {{ conjugationStore.currentIndex + 1 }} / {{ conjugationStore.totalQuestions }}
        </span>
      </div>

      <div class="flex items-center gap-2.5">
        <div v-if="conjugationStore.streak > 1" class="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 font-black shadow-2xs animate-pulse">
          <Sparkles class="w-3.5 h-3.5 text-rose-500" />
          <span>{{ conjugationStore.streak }}x Streak</span>
        </div>
        <div class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black font-mono shadow-2xs">
          {{ conjugationStore.score }} Poin
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
      <div 
        class="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 h-full transition-all duration-300"
        :style="{ width: `${((conjugationStore.currentIndex + 1) / conjugationStore.totalQuestions) * 100}%` }"
      ></div>
    </div>

    <!-- Main Card Soal Konjugasi -->
    <div 
      class="w-full bg-white dark:bg-slate-900 border rounded-3xl p-5 sm:p-7 shadow-sm transition-all flex flex-col gap-4 sm:gap-5 relative overflow-hidden"
      :class="[
        !isAnswered ? 'border-slate-200 dark:border-slate-800' :
        isCurrentCorrect ? 'border-emerald-500/50 ring-2 ring-emerald-500/20' :
        'border-rose-500/50 ring-2 ring-rose-500/20'
      ]"
    >
      <!-- Target Form Instruction Banner -->
      <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
        <div class="flex items-center gap-2">
          <span class="w-7 h-7 rounded-lg bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
            <RefreshCw class="w-3.5 h-3.5" />
          </span>
          <div class="flex flex-col">
            <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Ubah ke Bentuk</span>
            <span class="text-xs sm:text-sm font-black text-amber-700 dark:text-amber-300">
              {{ currentQ?.targetFormLabel }}
            </span>
          </div>
        </div>

        <SpeakerButton v-if="currentQ?.baseWord" :text="currentQ.baseWord" size="sm" />
      </div>

      <!-- Source Word Display -->
      <div class="py-2 sm:py-4 flex flex-col items-center justify-center text-center gap-1 select-none">
        <span v-if="currentQ?.baseReading" class="text-xs sm:text-sm font-jp font-semibold text-slate-400 dark:text-slate-500">
          {{ currentQ.baseReading }}
        </span>
        <h2 class="text-3xl sm:text-4xl md:text-5xl font-black font-jp text-slate-800 dark:text-slate-100 tracking-wide">
          {{ currentQ?.baseWord }}
        </h2>
        <p class="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300 mt-1">
          "{{ currentQ?.meaning }}"
        </p>
      </div>

      <!-- Feedback / Jawaban Benar Card setelah dijawab -->
      <div 
        v-if="isAnswered && currentQ" 
        class="p-3.5 sm:p-4 rounded-2xl flex flex-col gap-1.5 text-xs sm:text-sm animate-fadeIn"
        :class="isCurrentCorrect ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200' : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-500/20 text-rose-900 dark:text-rose-200'"
      >
        <div class="flex items-center justify-between font-bold">
          <div class="flex items-center gap-1.5">
            <Check v-if="isCurrentCorrect" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <X v-else class="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>{{ isCurrentCorrect ? 'Bagus Sekali!' : 'Jawaban yang Benar:' }}</span>
          </div>
          <span class="text-base sm:text-lg font-black font-jp">
            {{ currentQ.correctAnswer }}
          </span>
        </div>
        <p class="text-[11px] opacity-80 flex items-center gap-1">
          <span>💡 {{ currentQ.formulaTip }}</span>
        </p>
      </div>
    </div>

    <!-- Mode Mengetik Jawaban -->
    <div class="flex flex-col gap-3">
      <form @submit.prevent="handleTypedSubmit" class="flex items-center gap-2">
        <div class="relative flex-1">
          <input
            ref="inputRef"
            :value="typedInput"
            @input="handleInput"
            type="text"
            :disabled="isAnswered"
            placeholder="Ketik perubahan kata (otomatis kana)..."
            class="w-full h-14 px-4.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-jp font-bold text-lg sm:text-xl focus:outline-none focus:border-amber-500 shadow-2xs transition disabled:opacity-75 disabled:cursor-not-allowed"
            autofocus
            autocomplete="off"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          />
          <span 
            v-if="!isAnswered && !typedInput"
            class="hidden sm:inline absolute right-4 top-1/2 -translate-y-1/2 text-[11px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md pointer-events-none"
          >
            Enter ↵
          </span>
        </div>
        <button
          type="submit"
          :disabled="isAnswered || !typedInput.trim()"
          class="h-14 px-5 sm:px-6 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <span>Kirim</span>
          <Send class="w-4 h-4" />
        </button>
      </form>

      <!-- Tip Bantuan Input -->
      <div v-if="!isAnswered" class="flex items-center justify-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px]">
        <Keyboard class="w-3.5 h-3.5" />
        <span>Ketik dalam Romaji (misal: <em>tabete</em>) atau Kana / Kanji langsung</span>
      </div>
    </div>

    <!-- Reusable Bottom Action Navbar -->
    <QuizActionNavbar
      :show="isAnswered"
      :status="isCurrentCorrect ? 'correct' : 'wrong'"
      :is-last="isLastQuestion"
      @proceed="proceedToNext"
    />
  </div>
</template>
