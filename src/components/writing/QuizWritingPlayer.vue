<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useMenulisQuiz } from '../../composables/useMenulisQuiz';
import KanaQuizTarget from './KanaQuizTarget.vue';
import SpeakerButton from '../SpeakerButton.vue';
import { 
  Flame, 
  ArrowRight, 
  CheckCircle2, 
  XCircle, 
  Sparkles,
  X
} from '@lucide/vue';

const emit = defineEmits<{
  (e: 'exit'): void;
}>();

const {
  currentChar,
  currentTier,
  isQuestionFinished,
  isCurrentCorrect,
  currentMistakesCount,
  consecutiveCorrect,
  totalWritten,
  totalCorrect,
  lastGradedResult,
  handleCharacterComplete,
  handleFailMaxMistakes,
  handleMistake,
  handleCorrectStroke,
  proceedToNextQuestion,
  skipCharacter
} = useMenulisQuiz();

const tierLabels: Record<string, { label: string; badgeBg: string }> = {
  new: { label: '🔴 Huruf Baru', badgeBg: 'bg-rose-500/15 border-rose-500/30' },
  learning: { label: '🟡 Dalam Belajar', badgeBg: 'bg-amber-500/15 border-amber-500/30' },
  mastered: { label: '🟢 Hafalan Retensi', badgeBg: 'bg-emerald-500/15 border-emerald-500/30' },
  crown: { label: '👑 Mahkota', badgeBg: 'bg-violet-500/15 border-violet-500/30' }
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (isQuestionFinished.value && (e.key === 'Enter' || e.key === ' ')) {
    e.preventDefault();
    proceedToNextQuestion();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="w-full flex flex-col items-center gap-4 text-slate-100 animate-fadeIn">
    <!-- Top Stats Bar (Tanpa Animasi Bounce dan Tanpa Filter Suara/Mata) -->
    <div class="w-full max-w-md flex items-center justify-between gap-2 px-1 text-xs">
      <!-- Streak Counter -->
      <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 shadow-xs">
        <Flame class="w-4 h-4 text-amber-400" />
        <span class="font-extrabold text-amber-300">{{ consecutiveCorrect }}</span>
        <span class="text-[11px] text-slate-400 hidden sm:inline">Streak</span>
      </div>

      <!-- Accuracy Rate -->
      <div class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400">
        <span>Akurasi:</span>
        <strong class="text-white font-bold">
          {{ totalWritten > 0 ? Math.round((totalCorrect / totalWritten) * 100) : 100 }}%
        </strong>
      </div>

      <!-- Exit Button -->
      <button
        type="button"
        @click="emit('exit')"
        class="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer shadow-xs"
        title="Keluar dari Kuis"
      >
        <X class="w-3.5 h-3.5" />
      </button>
    </div>

    <!-- Clue Display Area -->
    <div v-if="currentChar" class="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-md flex flex-col items-center gap-2 relative overflow-hidden">
      <!-- Tier Badge -->
      <div class="flex items-center justify-between w-full">
        <span 
          :class="[
            'text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider',
            tierLabels[currentTier]?.badgeBg || 'bg-slate-800 text-slate-300'
          ]"
        >
          {{ tierLabels[currentTier]?.label || 'Latihan' }}
        </span>

        <span class="text-[11px] text-slate-400 font-medium capitalize">
          {{ currentChar.category }} • {{ currentChar.type }}
        </span>
      </div>

      <!-- Main Clue (Speaker + Romaji) -->
      <div class="flex items-center justify-center gap-3 py-1">
        <SpeakerButton :text="currentChar.character" size="md" />

        <div class="flex flex-col items-start">
          <span class="text-2xl sm:text-3xl font-black text-white tracking-wide font-mono">
            {{ currentChar.romaji }}
          </span>
          <span class="text-[10px] text-slate-400">Tuliskan huruf di bawah ini</span>
        </div>
      </div>
    </div>

    <!-- Post-Answer Banners & 'Selanjutnya' Button -->
    <Transition name="fade">
      <div 
        v-if="isQuestionFinished" 
        class="w-full max-w-md flex flex-col gap-2.5 animate-scaleUp"
      >
        <!-- Correct Banner -->
        <div 
          v-if="isCurrentCorrect"
          class="bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-2xl p-3 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm shadow-lg shadow-emerald-950/30"
        >
          <CheckCircle2 class="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Selesai Sempurna! (Akurasi: {{ Math.round((lastGradedResult?.accuracy || 1) * 100) }}%)</span>
          <Sparkles class="w-4 h-4 text-emerald-400 shrink-0" />
        </div>

        <!-- Failed 5x Mistakes Banner -->
        <div 
          v-else
          class="bg-rose-500/15 border border-rose-500/40 text-rose-300 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 font-bold text-xs sm:text-sm shadow-lg shadow-rose-950/30 text-center"
        >
          <div class="flex items-center gap-1.5 text-rose-400">
            <XCircle class="w-4 h-4 shrink-0" />
            <span>Batas 5x Salah Tercapai</span>
          </div>
          <span class="text-[11px] font-normal text-rose-200/90">
            Huruf ini akan otomatis diulang di akhir kuis sampai benar.
          </span>
        </div>

        <!-- Explicit Next Button -->
        <button
          type="button"
          @click="proceedToNextQuestion"
          class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-sm transition cursor-pointer shadow-lg shadow-indigo-950/40 flex items-center justify-center gap-2 active:scale-98"
        >
          <span>Selanjutnya</span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </div>
    </Transition>

    <!-- Interactive Writing Stage (HanziWriter Quiz Target) -->
    <div v-if="currentChar" class="relative">
      <KanaQuizTarget
        :target-char="currentChar.character"
        :size="290"
        @complete="handleCharacterComplete"
        @fail-max-mistakes="handleFailMaxMistakes"
        @mistake="handleMistake"
        @correct-stroke="handleCorrectStroke"
      />
    </div>

    <!-- Pre-Answer Toolbar & Status (Only shown before answer is completed) -->
    <div 
      v-if="!isQuestionFinished" 
      class="w-full max-w-md flex justify-between items-center text-xs text-slate-500 px-2 pt-1"
    >
      <button 
        type="button" 
        @click="skipCharacter" 
        class="hover:text-slate-300 transition cursor-pointer flex items-center gap-1 text-[11px]"
      >
        <span>Lewati huruf ini</span>
        <ArrowRight class="w-3 h-3" />
      </button>

      <div class="flex items-center gap-2">
        <span 
          v-if="currentMistakesCount > 0" 
          :class="[
            'text-[11px] font-semibold',
            currentMistakesCount >= 3 ? 'text-amber-400' : 'text-slate-400'
          ]"
        >
          Salah: {{ currentMistakesCount }}/5
        </span>
        <span class="text-[11px] text-slate-400">✍️ Gores di area huruf</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
