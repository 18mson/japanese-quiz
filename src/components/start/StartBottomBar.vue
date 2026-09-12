<script setup lang="ts">
import { Zap, Swords, ArrowRight, Sparkles } from '@lucide/vue';
import { useQuizStore } from '../../stores/quizStore';
import type { HitunganWaveDef } from '../../data/hitunganWaves';

defineProps<{
  isKeyboardNav: boolean;
  focusedSection: string;
  activeModeId: string;
  selectedLevel: string;
  characterType: string;
  selectedKanaCategory: string;
  currentHitunganWave: HitunganWaveDef;
  selectedHitunganDirection: string;
  isLoading: boolean;
}>();

const emit = defineEmits<{
  (e: 'start'): void;
  (e: 'interact'): void;
}>();

const quizStore = useQuizStore();
</script>

<template>
  <div 
    @click="emit('interact')"
    :class="[
      'fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md transition-all duration-200 p-3 sm:p-4 shadow-lg flex flex-col items-center justify-center cursor-pointer',
      isKeyboardNav && focusedSection === 'duration'
        ? 'border-t-2 border-t-indigo-400 dark:border-t-indigo-500/70 shadow-md'
        : 'border-t border-gray-200/80 dark:border-slate-800 shadow-lg'
    ]"
  >
    <!-- Renshuu Mode: Progress Card (Replaces Duration Presets) -->
    <div v-if="characterType === 'renshuu'" class="w-full max-w-3xl mb-3 bg-white dark:bg-slate-900 border border-violet-500/40 rounded-2xl p-3.5 sm:p-4 shadow-sm flex flex-col gap-2 animate-fadeIn">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <span class="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse flex-shrink-0"></span>
          <span class="text-xs sm:text-sm font-black text-violet-700 dark:text-violet-300 truncate">
            Pelajaran {{ quizStore.currentLessonNumber }}: Renshuu
          </span>
        </div>
        <span class="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full border border-gray-200 dark:border-slate-700 flex-shrink-0">
          {{ quizStore.renshuuProgressStats.masteredCount }} / {{ quizStore.renshuuProgressStats.totalCount }} soal dikuasai ({{ quizStore.renshuuProgressStats.progressPercent }}%)
        </span>
      </div>

      <!-- Progress Bar -->
      <div class="w-full h-3 bg-gray-100 dark:bg-slate-950 rounded-full overflow-hidden border border-gray-200 dark:border-slate-800 p-0.5 shadow-inner">
        <div 
          class="h-full bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
          :style="{ width: `${quizStore.renshuuProgressStats.progressPercent}%` }"
        ></div>
      </div>
    </div>

    <!-- Start Button CTA -->
    <div class="w-full max-w-3xl flex flex-col items-center gap-2">
      <!-- Session Info Pill -->
      <div 
        v-if="selectedLevel !== 'battleground' && characterType !== 'renshuu'" 
        class="flex items-center gap-2 text-[11px] sm:text-xs text-gray-500 dark:text-slate-400 font-medium"
      >
        <span v-if="['hiragana', 'katakana', 'mix'].includes(characterType)" class="text-indigo-600 dark:text-indigo-400 font-bold">
          Kategori: {{ selectedKanaCategory === 'all' ? 'Semua Huruf' : (selectedKanaCategory === 'basic' ? 'Dasar' : (selectedKanaCategory === 'dakuten' ? 'Dakuten' : 'Kombinasi')) }}
        </span>
        <span v-else-if="characterType === 'kanji'" class="text-emerald-600 dark:text-emerald-400 font-bold">
          Target: {{ quizStore.currentKanjiLessonLabel }} ({{ quizStore.currentKanjiLessonStats.total }} Kanji N5)
        </span>
        <span v-else-if="activeModeId === 'hitungan'" class="text-amber-600 dark:text-amber-400 font-bold">
          Wave: {{ currentHitunganWave.title }} • {{ selectedHitunganDirection === 'number_to_kana' ? 'Ketik Kana' : 'Numpad Touch' }}
        </span>
        <span v-else class="text-slate-400 font-bold">
          {{ characterType === 'words' ? '8 Kanji' : (characterType === 'kaiwa' ? '9 Baris Percakapan' : '16 Soal') }}
        </span>
      </div>

      <button 
        type="button"
        :class="[
          'w-full py-3.5 sm:py-4 text-white rounded-2xl text-base sm:text-lg font-extrabold cursor-pointer transition-all duration-300 ease-out shadow-md hover:shadow-lg flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed overflow-hidden',
          selectedLevel === 'battleground'
            ? 'bg-gradient-to-r from-rose-600 via-pink-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 shadow-rose-500/25'
            : activeModeId === 'hitungan'
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:from-amber-400 hover:to-orange-400 shadow-amber-500/25 text-slate-950 font-black'
              : characterType === 'renshuu'
                ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-500/25'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/25',
          isKeyboardNav && focusedSection === 'duration' ? 'ring-2 ring-indigo-400/60 shadow-lg' : ''
        ]"
        @click="emit('interact'); emit('start');"
        :disabled="isLoading"
      >
        <Transition name="btn-content-fade" mode="out-in">
          <div v-if="isLoading" key="loading" class="flex items-center justify-center gap-2 w-full">
            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading Questions...
          </div>
          <div v-else-if="selectedLevel === 'battleground'" key="battleground" class="flex items-center justify-center gap-2 w-full">
            <span>Masuk Arena Duel Online</span>
            <Swords class="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div v-else-if="activeModeId === 'hitungan'" key="hitungan" class="flex items-center justify-center gap-2 w-full font-black text-slate-950">
            <span>Mulai: {{ currentHitunganWave.shortTitle }} ({{ selectedHitunganDirection === 'number_to_kana' ? 'Angka ➔ Kana' : 'Kana ➔ Angka' }})</span>
            <ArrowRight class="w-5 h-5 sm:w-6 sm:h-6 text-slate-950" />
          </div>
          <div v-else-if="characterType === 'renshuu'" key="renshuu" class="flex items-center justify-center gap-2 w-full">
            <span>Mulai Sesi Berikutnya (10 Soal)</span>
            <Sparkles class="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300" />
          </div>
          <div v-else key="normal" class="flex items-center justify-center gap-2 w-full">
            <span>Mulai Kuis</span>
            <Zap class="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 fill-amber-300" />
          </div>
        </Transition>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Button Content Smooth Vertical Transition */
.btn-content-fade-enter-active,
.btn-content-fade-leave-active {
  transition: all 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-content-fade-enter-from {
  opacity: 0;
  transform: translateY(12px) scale(0.95);
}

.btn-content-fade-leave-to {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}
</style>
