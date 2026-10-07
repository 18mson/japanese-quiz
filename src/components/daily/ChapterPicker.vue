<script setup lang="ts">
import { ref, computed } from 'vue';
import { BookOpen, Check, Play, Info } from '@lucide/vue';

import { DAILY_CHAPTER_META } from '../../constants/dailyChapters';

const props = defineProps<{
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'start', chapterIds: number[]): void;
}>();

const selectedChapters = ref<number[]>([1]);

const ACTIVE_CHAPTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const UPCOMING_CHAPTERS = Array.from({ length: 17 }, (_, i) => i + 9); // Bab 9-25

const isMaxReached = computed(() => selectedChapters.value.length >= 2);

function toggleChapter(ch: number) {
  if (props.loading) return;
  const idx = selectedChapters.value.indexOf(ch);
  if (idx >= 0) {
    selectedChapters.value.splice(idx, 1);
  } else {
    if (selectedChapters.value.length < 2) {
      selectedChapters.value.push(ch);
      selectedChapters.value.sort((a, b) => a - b);
    }
  }
}

function handleStart() {
  if (selectedChapters.value.length === 0 || props.loading) return;
  emit('start', [...selectedChapters.value]);
}
</script>

<template>
  <div class="w-full max-w-2xl mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl p-5 sm:p-7 flex flex-col animate-fadeIn my-auto">
    <!-- Header -->
    <div class="flex items-center gap-3 mb-2">
      <div class="w-10 h-10 rounded-2xl bg-indigo-500/10 dark:bg-torii/15 border border-indigo-500/20 dark:border-torii/30 flex items-center justify-center text-indigo-600 dark:text-torii flex-shrink-0">
        <BookOpen class="w-5 h-5" />
      </div>
      <div>
        <h2 class="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
          Pilih Bab Latihan Hari Ini
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Pilih maksimal 2 bab (5 soal per bab). Bab akan dikunci untuk sesi hari ini.
        </p>
      </div>
    </div>

    <!-- Info banner -->
    <div class="my-3 bg-indigo-50/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700/80 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs">
      <div class="flex items-center gap-2 text-indigo-900 dark:text-indigo-200">
        <Info class="w-4 h-4 text-indigo-500 flex-shrink-0" />
        <span>Terpilih: <strong class="font-extrabold text-indigo-600 dark:text-torii-light">{{ selectedChapters.length }} / 2 Bab</strong> ({{ selectedChapters.length * 5 }} soal)</span>
      </div>
      <span v-if="isMaxReached" class="text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
        Batas Maksimal
      </span>
    </div>

    <!-- Active Chapters Grid -->
    <div class="mb-4">
      <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
        Bab Tersedia (Minna no Nihongo I)
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <button
          v-for="ch in ACTIVE_CHAPTERS"
          :key="ch"
          type="button"
          @click="toggleChapter(ch)"
          :disabled="isMaxReached && !selectedChapters.includes(ch)"
          :class="[
            'p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-start gap-2.5 relative select-none',
            selectedChapters.includes(ch)
              ? 'bg-indigo-50/90 dark:bg-torii/15 border-indigo-500 dark:border-torii ring-2 ring-indigo-500/30 dark:ring-torii/30 shadow-xs'
              : (isMaxReached
                  ? 'bg-slate-50/60 dark:bg-slate-850/40 border-slate-200/60 dark:border-slate-800/40 opacity-40 cursor-not-allowed'
                  : 'bg-white dark:bg-slate-850 border-slate-200 dark:border-slate-750 hover:border-indigo-300 dark:hover:border-slate-650 hover:bg-slate-50 dark:hover:bg-slate-800')
          ]"
        >
          <!-- Checkbox box -->
          <div 
            :class="[
              'w-5 h-5 rounded-lg flex items-center justify-center text-xs flex-shrink-0 mt-0.5 transition-colors',
              selectedChapters.includes(ch)
                ? 'bg-indigo-600 dark:bg-torii text-white'
                : 'border border-slate-300 dark:border-slate-600'
            ]"
          >
            <Check v-if="selectedChapters.includes(ch)" class="w-3.5 h-3.5 stroke-[3]" />
          </div>

          <!-- Chapter Info -->
          <div class="min-w-0 flex-1">
            <div class="flex items-center gap-1.5">
              <span class="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {{ DAILY_CHAPTER_META[ch]?.title }}
              </span>
              <span class="text-[11px] font-normal text-slate-500 dark:text-slate-400 shrink-0">
                • Bab {{ ch }}
              </span>
            </div>
            <div class="text-[10px] text-slate-400 dark:text-slate-400 truncate mt-0.5">
              {{ DAILY_CHAPTER_META[ch]?.grammar }}
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Upcoming Chapters preview (Bab 9-25) -->
    <div class="mb-5">
      <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
        <span>Bab Lanjutan (Bab 9–25)</span>
        <span class="text-[10px] lowercase font-normal bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-500">
          Segera hadir
        </span>
      </div>
      <div class="flex flex-wrap gap-1.5 opacity-50">
        <span
          v-for="ch in UPCOMING_CHAPTERS"
          :key="ch"
          class="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200/60 dark:border-slate-700/40 select-none"
        >
          Bab {{ ch }}
        </span>
      </div>
    </div>

    <!-- Action button -->
    <button
      type="button"
      @click="handleStart"
      :disabled="selectedChapters.length === 0 || loading"
      :class="[
        'w-full py-3.5 px-5 rounded-2xl font-black text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-md select-none',
        selectedChapters.length > 0 && !loading
          ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-torii dark:hover:bg-torii-hover text-white cursor-pointer active:scale-[0.99]'
          : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-300/40 dark:border-slate-700/40'
      ]"
    >
      <div v-if="loading" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <Play v-else class="w-4 h-4 fill-current" />
      <span>
        {{ loading ? 'Menyiapkan Soal Harian...' : `Mulai Latihan (${selectedChapters.length * 5} Soal)` }}
      </span>
    </button>
  </div>
</template>

<style scoped>
@keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
.animate-fadeIn { animation: fadeIn 0.25s ease-out forwards; }
</style>
