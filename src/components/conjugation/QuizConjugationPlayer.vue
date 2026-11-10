<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useConjugationQuizStore } from '../../stores/conjugationQuizStore';
import { useQuizStore } from '../../stores/quizStore';
import SpeakerButton from '../SpeakerButton.vue';
import QuizActionNavbar from '../common/QuizActionNavbar.vue';
import { Check, X, Sparkles, RefreshCw, Keyboard as KeyboardIcon, Grid } from '@lucide/vue';

const emit = defineEmits<{
  (e: 'exit'): void;
}>();

const conjugationStore = useConjugationQuizStore();
const quizStore = useQuizStore();

const isAnswered = ref(false);
const selectedAnswer = ref<string | null>(null);
const isCurrentCorrect = ref(false);
const isTypingMode = ref(false);
const typedInput = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const currentQ = computed(() => conjugationStore.currentQuestion);
const isLastQuestion = computed(() => conjugationStore.currentIndex >= conjugationStore.totalQuestions - 1);

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

function handleSelectOption(option: string) {
  if (isAnswered.value || !currentQ.value) return;
  selectedAnswer.value = option;
  isAnswered.value = true;

  const result = conjugationStore.checkAnswer(option);
  isCurrentCorrect.value = result.isCorrect;
}

function handleTypedSubmit() {
  if (isAnswered.value || !typedInput.value.trim() || !currentQ.value) return;
  const val = typedInput.value.trim();
  selectedAnswer.value = val;
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
  selectedAnswer.value = null;
  isCurrentCorrect.value = false;
  typedInput.value = '';

  if (isTypingMode.value) {
    nextTick(() => {
      inputRef.value?.focus();
    });
  }
}

function handleKeyDown(e: KeyboardEvent) {
  if (isAnswered.value) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      proceedToNext();
    }
    return;
  }

  // Keyboard shortcut 1-4 untuk memilih opsi
  if (!isTypingMode.value && currentQ.value && ['1', '2', '3', '4'].includes(e.key)) {
    const idx = parseInt(e.key, 10) - 1;
    if (currentQ.value.options[idx] !== undefined) {
      e.preventDefault();
      handleSelectOption(currentQ.value.options[idx]);
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

    <!-- Opsi Jawaban (Pilihan Ganda Cepat) -->
    <div v-if="!isTypingMode && currentQ" class="flex flex-col gap-3">
      <div class="grid grid-cols-2 gap-2.5 sm:gap-3">
        <button
          v-for="(opt, idx) in currentQ.options"
          :key="idx"
          type="button"
          @click="handleSelectOption(opt)"
          :disabled="isAnswered"
          class="relative h-14 sm:h-16 px-3 rounded-2xl border-2 font-jp font-bold text-base sm:text-lg transition flex items-center justify-center shadow-xs cursor-pointer active:scale-98 disabled:cursor-default"
          :class="[
            !isAnswered ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-amber-500 hover:bg-amber-50/50 dark:hover:bg-slate-800/80' :
            opt === currentQ.correctAnswer || currentQ.acceptedAnswers.includes(opt) ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20' :
            selectedAnswer === opt ? 'bg-rose-500 border-rose-500 text-white shadow-rose-500/20' :
            'bg-slate-100 dark:bg-slate-800/50 border-transparent text-slate-400 dark:text-slate-600 opacity-60'
          ]"
        >
          <span class="absolute top-1.5 left-2.5 text-[10px] font-sans font-bold text-slate-400 opacity-60">
            {{ idx + 1 }}
          </span>
          <span class="truncate">{{ opt }}</span>
        </button>
      </div>

      <!-- Tombol Switch ke Mode Ketik -->
      <button 
        type="button"
        @click="isTypingMode = true"
        class="self-center text-xs text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
      >
        <KeyboardIcon class="w-3.5 h-3.5" />
        <span>Atau ketik sendiri</span>
      </button>
    </div>

    <!-- Opsi Jawaban (Input Ketik Langsung) -->
    <div v-else class="flex flex-col gap-3">
      <form @submit.prevent="handleTypedSubmit" class="flex items-center gap-2">
        <input
          ref="inputRef"
          v-model="typedInput"
          type="text"
          :disabled="isAnswered"
          placeholder="Ketik bentuk perubahan kata..."
          class="flex-1 h-13 px-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-jp text-lg focus:outline-none focus:border-amber-500 shadow-2xs transition"
          autofocus
        />
        <button
          type="submit"
          :disabled="isAnswered || !typedInput.trim()"
          class="h-13 px-5 rounded-2xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer"
        >
          Kirim
        </button>
      </form>

      <button 
        type="button"
        @click="isTypingMode = false"
        class="self-center text-xs text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
      >
        <Grid class="w-3.5 h-3.5" />
        <span>Gunakan tombol pilihan ganda</span>
      </button>
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
