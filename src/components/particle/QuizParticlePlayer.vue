<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useParticleQuizStore, normalizeParticleInput } from '../../stores/particleQuizStore';
import { useQuizStore } from '../../stores/quizStore';
import SpeakerButton from '../SpeakerButton.vue';
import QuizActionNavbar from '../common/QuizActionNavbar.vue';
import { Check, X, Sparkles, BookOpen, Keyboard as KeyboardIcon, Grid, Send } from '@lucide/vue';

const emit = defineEmits<{
  (e: 'exit'): void;
}>();

const particleStore = useParticleQuizStore();
const quizStore = useQuizStore();

const isAnswered = ref(false);
const selectedAnswer = ref<string | null>(null);
const isCurrentCorrect = ref(false);
const isTypingMode = ref(false);
const typedInput = ref('');
const inputRef = ref<HTMLInputElement | null>(null);

const currentQ = computed(() => particleStore.currentQuestion);
const isLastQuestion = computed(() => particleStore.currentIndex >= particleStore.totalQuestions - 1);

// Partikel umum untuk bar bantuan cepat (quick chips)
const commonParticles = ['は', 'が', 'を', 'に', 'で', 'へ', 'と', 'から', 'まで', 'も', 'の'];

// Opsi 4 tombol (1 jawaban benar + 3 distraktor)
const shuffledOptions = ref<string[]>([]);

function generateOptions() {
  if (!currentQ.value) return;
  const q = currentQ.value;
  const correctChoice = q.primaryParticle || q.correctParticles[0] || 'は';
  const distractors = q.distractors.slice(0, 3);
  
  const pool = [correctChoice, ...distractors];
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  shuffledOptions.value = pool;
}

onMounted(() => {
  generateOptions();
  window.addEventListener('keydown', handleKeyDown);
  if (isTypingMode.value) {
    nextTick(() => inputRef.value?.focus());
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

// Partikel yang sedang diketik untuk ditampilkan langsung di lubang kalimat
const livePreviewParticle = computed(() => {
  if (!typedInput.value) return '';
  return normalizeParticleInput(typedInput.value);
});

function handleInput(e: Event) {
  const target = e.target as HTMLInputElement;
  const converted = normalizeParticleInput(target.value);
  typedInput.value = converted;
  target.value = converted;
}

function handleSelectOption(particle: string) {
  if (isAnswered.value || !currentQ.value) return;
  selectedAnswer.value = particle;
  isAnswered.value = true;

  const result = particleStore.checkAnswer(particle);
  isCurrentCorrect.value = result.isCorrect;
}

function handleTypedSubmit() {
  if (isAnswered.value || !typedInput.value.trim() || !currentQ.value) return;
  const val = typedInput.value.trim();
  selectedAnswer.value = val;
  isAnswered.value = true;

  const result = particleStore.checkAnswer(val);
  isCurrentCorrect.value = result.isCorrect;
}

function selectParticleChip(p: string) {
  if (isAnswered.value) return;
  typedInput.value = p;
  handleTypedSubmit();
}

function switchToTyping() {
  isTypingMode.value = true;
  nextTick(() => {
    inputRef.value?.focus();
  });
}

function proceedToNext() {
  if (isLastQuestion.value) {
    particleStore.nextQuestion();
    const formattedAnswers = particleStore.userAnswers.map(ans => {
      const q = ans.question;
      const variation = particleStore.formatVariationDisplay(q);
      const fullSentenceWithVariation = `${q.sentenceBefore} ${variation} ${q.sentenceAfter}`;
      return {
        character: fullSentenceWithVariation,
        meaning: q.meaning,
        userRomaji: ans.givenAnswer,
        correctRomaji: variation,
        isCorrect: ans.isCorrect,
        pointsEarned: ans.isCorrect ? 4 : 0
      };
    });

    quizStore.finishParticleQuiz({
      score: particleStore.score,
      accuracy: particleStore.accuracy,
      answers: formattedAnswers
    });
    return;
  }

  particleStore.nextQuestion();
  isAnswered.value = false;
  selectedAnswer.value = null;
  isCurrentCorrect.value = false;
  typedInput.value = '';
  generateOptions();

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

  // Keyboard shortcut 1-4 untuk memilih opsi pada mode pilihan ganda
  if (!isTypingMode.value && ['1', '2', '3', '4'].includes(e.key)) {
    const idx = parseInt(e.key, 10) - 1;
    if (shuffledOptions.value[idx] !== undefined) {
      e.preventDefault();
      handleSelectOption(shuffledOptions.value[idx]);
    }
  }
}

// Kalimat penuh untuk audio speech
const fullSentenceForAudio = computed(() => {
  if (!currentQ.value) return '';
  const chosenPart = currentQ.value.primaryParticle || currentQ.value.correctParticles[0] || '';
  return `${currentQ.value.sentenceBefore}${chosenPart}${currentQ.value.sentenceAfter}`;
});
</script>

<template>
  <div class="w-full max-w-2xl mx-auto flex flex-col gap-4 py-2 px-3 sm:px-4 pb-28">
    <!-- Top Bar: Bab, Progress, Skor, & Streak -->
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
        <span class="px-2.5 py-1 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 font-bold border border-cyan-500/20 shadow-2xs">
          Bab {{ currentQ?.chapter || 1 }}
        </span>
        <span class="font-mono text-slate-500 dark:text-slate-400 font-bold">
          Soal {{ particleStore.currentIndex + 1 }} / {{ particleStore.totalQuestions }}
        </span>
      </div>

      <div class="flex items-center gap-2.5">
        <div v-if="particleStore.streak > 1" class="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-black shadow-2xs animate-pulse">
          <Sparkles class="w-3.5 h-3.5 text-amber-500" />
          <span>{{ particleStore.streak }}x Streak</span>
        </div>
        <div class="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black font-mono shadow-2xs">
          {{ particleStore.score }} Poin
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
      <div 
        class="bg-gradient-to-r from-cyan-500 to-indigo-600 h-full transition-all duration-300"
        :style="{ width: `${((particleStore.currentIndex + 1) / particleStore.totalQuestions) * 100}%` }"
      ></div>
    </div>

    <!-- Main Card Soal Kalimat -->
    <div 
      class="w-full bg-white dark:bg-slate-900 border rounded-3xl p-5 sm:p-7 shadow-sm transition-all flex flex-col gap-5 relative overflow-hidden"
      :class="[
        !isAnswered ? 'border-slate-200 dark:border-slate-800' :
        isCurrentCorrect ? 'border-emerald-500/50 ring-2 ring-emerald-500/20' :
        'border-rose-500/50 ring-2 ring-rose-500/20'
      ]"
    >
      <!-- Sentence Prompt Header -->
      <div class="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800/80">
        <span class="text-[11px] font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
          <BookOpen class="w-3.5 h-3.5" />
          Isi Partikel yang Tepat
        </span>
        <SpeakerButton v-if="fullSentenceForAudio" :text="fullSentenceForAudio" size="sm" />
      </div>

      <!-- Kalimat dengan Slot Partikel Terintegrasi Langsung -->
      <div class="py-4 sm:py-6 flex flex-wrap items-center justify-center gap-2 text-center select-none font-jp">
        <span class="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 leading-relaxed">
          {{ currentQ?.sentenceBefore }}
        </span>

        <!-- SLOT PARTIKEL YANG BERINTERAKSI DENGAN KETIKAN PEMAIN SECARA REAL-TIME -->
        <span 
          class="inline-flex items-center justify-center px-3.5 sm:px-4 py-1 sm:py-1.5 min-w-[60px] sm:min-w-[74px] rounded-2xl font-black transition-all shadow-xs"
          :class="[
            !isAnswered && !livePreviewParticle ? 'bg-cyan-500/10 dark:bg-cyan-500/20 border-2 border-dashed border-cyan-500 text-cyan-600 dark:text-cyan-300 animate-pulse text-xl sm:text-2xl' :
            !isAnswered && livePreviewParticle ? 'bg-cyan-50 dark:bg-cyan-950/50 border-2 border-cyan-600 dark:border-cyan-400 text-cyan-800 dark:text-cyan-200 ring-4 ring-cyan-500/20 text-xl sm:text-2xl scale-105 shadow-md' :
            isCurrentCorrect ? 'bg-emerald-500 text-white shadow-emerald-500/30 text-lg sm:text-2xl ring-2 ring-emerald-400' :
            'bg-rose-500 text-white shadow-rose-500/30 text-lg sm:text-2xl ring-2 ring-rose-400'
          ]"
        >
          <template v-if="!isAnswered">
            {{ livePreviewParticle || '?' }}
          </template>
          <template v-else>
            {{ particleStore.formatVariationDisplay(currentQ!) }}
          </template>
        </span>

        <span class="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 leading-relaxed">
          {{ currentQ?.sentenceAfter }}
        </span>
      </div>

      <!-- Arti Kalimat dalam Bahasa Indonesia -->
      <div class="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800/80 text-center">
        <p class="text-sm sm:text-base font-semibold text-slate-600 dark:text-slate-300">
          "{{ currentQ?.meaning }}"
        </p>
      </div>

      <!-- Penjelasan / Pembahasan setelah dijawab -->
      <div 
        v-if="isAnswered && currentQ" 
        class="p-3.5 sm:p-4 rounded-2xl flex flex-col gap-1.5 text-xs sm:text-sm animate-fadeIn"
        :class="isCurrentCorrect ? 'bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/20 text-emerald-900 dark:text-emerald-200' : 'bg-rose-50 dark:bg-rose-950/30 border border-rose-500/20 text-rose-900 dark:text-rose-200'"
      >
        <div class="flex items-center gap-1.5 font-bold">
          <Check v-if="isCurrentCorrect" class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <X v-else class="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>{{ isCurrentCorrect ? 'Jawaban Benar!' : 'Kurang Tepat.' }}</span>
          <span class="font-mono text-xs opacity-80 ml-auto">
            Variasi: <strong>{{ particleStore.formatVariationDisplay(currentQ) }}</strong>
          </span>
        </div>
        <p class="text-xs leading-relaxed opacity-90">
          {{ currentQ.explanation }}
        </p>
      </div>
    </div>

    <!-- Opsi Jawaban: Mode Pilihan Ganda -->
    <div v-if="!isTypingMode" class="flex flex-col gap-3">
      <div class="grid grid-cols-2 gap-2.5 sm:gap-3">
        <button
          v-for="(opt, idx) in shuffledOptions"
          :key="idx"
          type="button"
          @click="handleSelectOption(opt)"
          :disabled="isAnswered"
          class="relative h-14 sm:h-16 rounded-2xl border-2 font-jp font-black text-xl sm:text-2xl transition flex items-center justify-center shadow-xs cursor-pointer active:scale-98 disabled:cursor-default"
          :class="[
            !isAnswered ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 hover:border-cyan-500 hover:bg-cyan-50/50 dark:hover:bg-slate-800/80' :
            currentQ?.correctParticles.includes(opt) ? 'bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/20' :
            selectedAnswer === opt ? 'bg-rose-500 border-rose-500 text-white shadow-rose-500/20' :
            'bg-slate-100 dark:bg-slate-800/50 border-transparent text-slate-400 dark:text-slate-600 opacity-60'
          ]"
        >
          <span class="absolute top-1.5 left-2.5 text-[10px] font-sans font-bold text-slate-400 opacity-60">
            {{ idx + 1 }}
          </span>
          <span>{{ opt || '∅ (Tanpa Partikel)' }}</span>
        </button>
      </div>

      <!-- Segmented Mode Switcher (Pilihan Ganda vs Mode Ketik) -->
      <div class="mt-1 inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs self-center">
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 font-bold shadow-2xs flex items-center gap-1.5 cursor-default"
        >
          <Grid class="w-3.5 h-3.5" />
          <span>Pilihan Ganda</span>
        </button>
        <button
          type="button"
          @click="switchToTyping"
          class="px-3.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 cursor-pointer"
        >
          <KeyboardIcon class="w-3.5 h-3.5" />
          <span>Mode Ketik</span>
        </button>
      </div>
    </div>

    <!-- Opsi Jawaban: Mode Ketik Langsung yang Proper & Proporsional -->
    <div v-else class="flex flex-col items-center gap-3 w-full">
      <form @submit.prevent="handleTypedSubmit" class="w-full max-w-md relative flex items-center">
        <!-- Left Indicator: Partikel / 助詞 -->
        <div class="absolute left-3.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5 select-none pointer-events-none z-10">
          <span class="px-2 py-0.5 rounded-md bg-cyan-100/80 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border border-cyan-300/80 dark:border-cyan-800 text-[10px] font-black font-mono tracking-wider">
            助詞
          </span>
        </div>

        <!-- Input Field Proposional, Rapi, & Berpusat -->
        <input
          ref="inputRef"
          :value="typedInput"
          @input="handleInput"
          type="text"
          :disabled="isAnswered"
          placeholder="wa, ni, de, to..."
          class="w-full h-14 pl-16 pr-24 rounded-2xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-jp font-black text-2xl text-center focus:outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 shadow-xs transition disabled:opacity-75 disabled:cursor-not-allowed"
          autofocus
          autocomplete="off"
          autocorrect="off"
          autocapitalize="off"
          spellcheck="false"
        />

        <!-- Right Submit Button -->
        <button
          type="submit"
          :disabled="isAnswered || !typedInput.trim()"
          class="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-30 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5 z-10"
        >
          <span>Kirim</span>
          <Send class="w-3.5 h-3.5" />
        </button>
      </form>

      <!-- Quick Particle Chips for Convenience -->
      <div v-if="!isAnswered" class="w-full max-w-md flex flex-col items-center gap-1.5">
        <div class="flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
          <Sparkles class="w-3 h-3 text-cyan-500" />
          <span>Pilihan Cepat Partikel:</span>
        </div>
        <div class="flex flex-wrap items-center justify-center gap-1.5">
          <button
            v-for="p in commonParticles"
            :key="p"
            type="button"
            @click="selectParticleChip(p)"
            class="min-w-[34px] h-8 px-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-cyan-500 hover:text-cyan-600 dark:hover:text-cyan-400 font-jp font-black text-sm transition active:scale-95 cursor-pointer shadow-2xs"
          >
            {{ p }}
          </button>
        </div>
      </div>

      <!-- Segmented Mode Switcher (Pilihan Ganda vs Mode Ketik) -->
      <div class="mt-1 inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 text-xs self-center">
        <button
          type="button"
          @click="isTypingMode = false"
          class="px-3.5 py-1.5 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition flex items-center gap-1.5 cursor-pointer"
        >
          <Grid class="w-3.5 h-3.5" />
          <span>Pilihan Ganda</span>
        </button>
        <button
          type="button"
          class="px-3.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 text-cyan-700 dark:text-cyan-300 font-bold shadow-2xs flex items-center gap-1.5 cursor-default"
        >
          <KeyboardIcon class="w-3.5 h-3.5" />
          <span>Mode Ketik</span>
        </button>
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
