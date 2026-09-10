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
  <div v-if="currentChar" class="w-full max-w-5xl mx-auto flex flex-col md:grid md:grid-cols-2 gap-4 lg:gap-6 items-stretch justify-center text-slate-800 dark:text-slate-100 animate-fadeIn">
    <!-- LEFT CARD: Context, Clue & Result/Actions -->
    <div class="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm dark:shadow-md flex flex-col justify-between gap-4 relative overflow-hidden min-h-[220px] md:min-h-[420px]">
      <!-- Top Row: Tier Badge, Streak Counter & Category Info -->
      <div class="flex items-center justify-between w-full">
        <div class="flex items-center gap-2">
          <span 
            :class="[
              'text-[10px] sm:text-xs font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider',
              tierLabels[currentTier]?.badgeBg || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            ]"
          >
            {{ tierLabels[currentTier]?.label || 'Latihan' }}
          </span>

          <!-- Streak Counter -->
          <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-slate-800/90 border border-amber-200 dark:border-slate-700/70 text-amber-700 dark:text-amber-300 text-xs font-bold shadow-xs">
            <Flame class="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
            <span class="font-extrabold text-amber-600 dark:text-amber-300">{{ consecutiveCorrect }}</span>
            <span class="text-[10px] text-amber-700/80 dark:text-slate-400 font-normal">Streak</span>
          </div>
        </div>

        <span class="text-xs text-slate-500 dark:text-slate-400 font-bold capitalize bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200/60 dark:border-slate-700/60">
          {{ currentChar.category === 'kanji' ? (currentChar.lesson || 'Kanji N5') : `${currentChar.category} • ${currentChar.type}` }}
        </span>
      </div>

      <!-- Center: Clue Display Area -->
      <div class="flex flex-col items-center justify-center flex-1 py-3 sm:py-6 text-center">
        <!-- Kanji Specific Clue (Kana Text with Target Underlined & Bold) -->
        <div v-if="currentChar.category === 'kanji'" class="flex flex-col items-center gap-2 w-full">
          <div class="text-3xl sm:text-4xl lg:text-5xl font-bold font-jp tracking-wider text-slate-800 dark:text-slate-100 flex items-center justify-center flex-wrap gap-x-1">
            <span v-if="currentChar.prefixKana" class="text-slate-400 dark:text-slate-500 font-normal">{{ currentChar.prefixKana }}</span>
            <span class="font-black underline decoration-indigo-500 dark:decoration-indigo-400 decoration-4 underline-offset-8 text-indigo-600 dark:text-indigo-400 px-1">
              {{ currentChar.targetKana }}
            </span>
            <span v-if="currentChar.suffixKana" class="text-slate-400 dark:text-slate-500 font-normal">{{ currentChar.suffixKana }}</span>
          </div>

          <div class="flex items-center justify-center gap-2 mt-2 flex-wrap px-2">
            <SpeakerButton :text="currentChar.fullWord || currentChar.character" size="md" class="shrink-0" />

            <!-- SEBELUM DIJAWAB: Tampilkan HANYA arti kotoba (tanpa teks kanji) agar tidak ada spoiler -->
            <span v-if="!isQuestionFinished" class="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 text-center break-words">
              {{ currentChar.wordMeaning }}
            </span>

            <!-- SETELAH DIJAWAB (SUDAH ADA HASIL): Tampilkan teks kanji lengkap & arti kanjinya -->
            <div v-else class="flex items-center gap-2 flex-wrap justify-center text-sm sm:text-base animate-fadeIn">
              <span class="font-jp font-black text-indigo-600 dark:text-indigo-400 text-base sm:text-lg">
                {{ currentChar.fullWord }}
              </span>
              <span class="font-bold text-slate-700 dark:text-slate-300">
                · {{ currentChar.wordMeaning }}
              </span>
              <span v-if="currentChar.kanjiMeaning" class="text-xs text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80">
                {{ currentChar.character }}: {{ currentChar.kanjiMeaning }}
              </span>
            </div>
          </div>

          <span class="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
            {{ isQuestionFinished ? 'Hasil penulisan kanji' : 'Tuliskan 1 kanji untuk bagian huruf yang digarisbawahi' }}
          </span>
        </div>

        <!-- Standard Kana Clue (Speaker + Romaji) -->
        <div v-else class="flex flex-col items-center justify-center gap-2 w-full">
          <div class="flex items-center justify-center gap-3">
            <SpeakerButton :text="currentChar.character" size="md" />
            <span class="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-wide font-mono">
              {{ currentChar.romaji }}
            </span>
          </div>
          <span class="text-xs text-slate-500 dark:text-slate-400">
            {{ isQuestionFinished ? 'Hasil penulisan kana' : 'Tuliskan huruf di samping' }}
          </span>
        </div>
      </div>

      <!-- Bottom: Status Toolbar or Result Banner + Desktop Action Button -->
      <div class="w-full flex flex-col gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <!-- Pre-Answer Toolbar -->
        <div v-if="!isQuestionFinished" class="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 px-1">
          <button 
            type="button" 
            @click="skipCharacter" 
            class="hover:text-slate-800 dark:hover:text-slate-200 text-slate-500 dark:text-slate-400 transition cursor-pointer flex items-center gap-1.5 font-semibold py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <span>Lewati huruf ini</span>
            <ArrowRight class="w-3.5 h-3.5" />
          </button>

          <div class="flex items-center gap-2">
            <span 
              v-if="currentMistakesCount > 0" 
              :class="[
                'text-xs font-bold px-2 py-0.5 rounded-md',
                currentMistakesCount >= 3 ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              ]"
            >
              Salah: {{ currentMistakesCount }}/4
            </span>
            <span class="text-xs text-slate-400 dark:text-slate-500">✍️ Gores di area canvas</span>
          </div>
        </div>

        <!-- Post-Answer Banners & Desktop 'Selanjutnya' Button -->
        <div v-else class="flex flex-col gap-3 animate-scaleUp">
          <!-- Correct Banner -->
          <div 
            v-if="isCurrentCorrect"
            class="bg-emerald-500/15 border border-emerald-500/40 text-emerald-800 dark:text-emerald-300 rounded-2xl p-3 flex items-center justify-center gap-2 font-bold text-xs sm:text-sm shadow-xs"
          >
            <CheckCircle2 class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{{ successBannerText }}</span>
            <Sparkles class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          </div>

          <!-- Failed 4x Mistakes Banner -->
          <div 
            v-else
            class="bg-rose-500/15 border border-rose-500/40 text-rose-800 dark:text-rose-300 rounded-2xl p-3 flex flex-col items-center justify-center gap-1 font-bold text-xs sm:text-sm shadow-xs text-center"
          >
            <div class="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
              <XCircle class="w-4 h-4 shrink-0" />
              <span>Batas 4x Salah Tercapai</span>
            </div>
            <span class="text-[11px] font-normal text-rose-700/90 dark:text-rose-200/90">
              Huruf ini akan otomatis diulang di akhir kuis.
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- RIGHT CARD: Interactive HanziWriter Drawing Stage -->
    <div class="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-4 sm:p-6 shadow-sm dark:shadow-md flex flex-col items-center justify-center relative min-h-[380px] md:min-h-[420px]">
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
