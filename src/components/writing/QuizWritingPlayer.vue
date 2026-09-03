<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useMenulisQuiz } from '../../composables/useMenulisQuiz';
import KanaQuizTarget from './KanaQuizTarget.vue';
import SpeakerButton from '../SpeakerButton.vue';
import { 
  Flame, 
  ArrowRight,
  CheckCircle2, 
  XCircle, 
  Sparkles
} from '@lucide/vue';

defineEmits<{
  (e: 'exit'): void;
}>();

const {
  currentChar,
  currentTier,
  isQuestionFinished,
  isCurrentCorrect,
  currentMistakesCount,
  consecutiveCorrect,
  lastGradedResult,
  handleCharacterComplete,
  handleFailMaxMistakes,
  handleMistake,
  handleCorrectStroke,
  proceedToNextQuestion,
  skipCharacter
} = useMenulisQuiz();

const successBannerText = computed(() => {
  const acc = Math.round((lastGradedResult.value?.accuracy || 1) * 100);
  if (acc >= 100) return 'Selesai Sempurna! (Akurasi: 100%)';
  if (acc >= 80) return `Bagus! Selesai (Akurasi: ${acc}%)`;
  return `Berhasil Diselesaikan! (Akurasi: ${acc}%)`;
});

const tierLabels: Record<string, { label: string; badgeBg: string }> = {
  new: { label: '🔴 Huruf Baru', badgeBg: 'bg-rose-500/15 border-rose-500/30 text-rose-700 dark:text-rose-300' },
  learning: { label: '🟡 Dalam Belajar', badgeBg: 'bg-amber-500/15 border-amber-500/30 text-amber-800 dark:text-amber-300' },
  mastered: { label: '🟢 Hafalan Retensi', badgeBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-800 dark:text-emerald-300' },
  crown: { label: '👑 Mahkota', badgeBg: 'bg-violet-500/15 border-violet-500/30 text-violet-800 dark:text-violet-300' }
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
  <div class="w-full flex flex-col items-center gap-3 sm:gap-4 text-slate-800 dark:text-slate-100 animate-fadeIn">
    <!-- Clue Display Area (Includes Streak & Tier Badge) -->
    <div v-if="currentChar" class="w-full max-w-md bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 sm:p-4 shadow-xs dark:shadow-md flex flex-col items-center gap-2 relative overflow-hidden">
      <!-- Tier Badge, Streak Counter & Category Info -->
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <span 
            :class="[
              'text-[10px] font-black px-2 py-0.5 rounded-md border uppercase tracking-wider',
              tierLabels[currentTier]?.badgeBg || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            ]"
          >
            {{ tierLabels[currentTier]?.label || 'Latihan' }}
          </span>

          <!-- Streak Counter (Dipindah ke dalam card agar hemat tempat) -->
          <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-slate-800/90 border border-amber-200 dark:border-slate-700/70 text-amber-700 dark:text-amber-300 text-[11px] font-bold shadow-xs">
            <Flame class="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
            <span class="font-extrabold text-amber-600 dark:text-amber-300">{{ consecutiveCorrect }}</span>
            <span class="text-[10px] text-amber-700/80 dark:text-slate-400 font-normal">Streak</span>
          </div>
        </div>

        <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium capitalize">
          {{ currentChar.category }} • {{ currentChar.type }}
        </span>
      </div>

      <!-- Main Clue (Speaker + Romaji) -->
      <div class="flex items-center justify-center gap-3 py-1">
        <SpeakerButton :text="currentChar.character" size="md" />

        <div class="flex flex-col items-start">
          <span class="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-wide font-mono">
            {{ currentChar.romaji }}
          </span>
          <span class="text-[10px] text-slate-500 dark:text-slate-400">Tuliskan huruf di bawah ini</span>
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
          class="bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-2xl p-3 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm shadow-md shadow-emerald-950/20 dark:shadow-emerald-950/30"
        >
          <CheckCircle2 class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{{ successBannerText }}</span>
          <Sparkles class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        </div>

        <!-- Failed 5x Mistakes Banner -->
        <div 
          v-else
          class="bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 font-bold text-xs sm:text-sm shadow-md shadow-rose-950/20 dark:shadow-rose-950/30 text-center"
        >
          <div class="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
            <XCircle class="w-4 h-4 shrink-0" />
            <span>Batas 5x Salah Tercapai</span>
          </div>
          <span class="text-[11px] font-normal text-rose-700/90 dark:text-rose-200/90">
            Huruf ini akan otomatis diulang di akhir kuis sampai benar.
          </span>
        </div>
      </div>
    </Transition>

    <!-- Interactive Writing Stage (HanziWriter Quiz Target) -->
    <div v-if="currentChar" class="relative">
      <KanaQuizTarget
        :target-char="currentChar.character"
        :romaji="currentChar.romaji"
        :size="290"
        :is-finished="isQuestionFinished"
        @complete="handleCharacterComplete"
        @fail-max-mistakes="handleFailMaxMistakes"
        @mistake="handleMistake"
        @correct-stroke="handleCorrectStroke"
      />
    </div>

    <!-- Pre-Answer Toolbar & Status (Only shown before answer is completed) -->
    <div 
      v-if="!isQuestionFinished" 
      class="w-full max-w-md flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 px-2 pt-1"
    >
      <button 
        type="button" 
        @click="skipCharacter" 
        class="hover:text-slate-800 dark:hover:text-slate-300 text-slate-500 dark:text-slate-400 transition cursor-pointer flex items-center gap-1 text-[11px]"
      >
        <span>Lewati huruf ini</span>
        <ArrowRight class="w-3 h-3" />
      </button>

      <div class="flex items-center gap-2">
        <span 
          v-if="currentMistakesCount > 0" 
          :class="[
            'text-[11px] font-semibold',
            currentMistakesCount >= 3 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-500 dark:text-slate-400'
          ]"
        >
          Salah: {{ currentMistakesCount }}/5
        </span>
        <span class="text-[11px] text-slate-500 dark:text-slate-400">✍️ Gores di area huruf</span>
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
