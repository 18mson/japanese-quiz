<script setup lang="ts">
import { Target, LayoutGrid, Crown, CheckCircle2, ChevronRight } from '@lucide/vue';
import { useQuizStore } from '../../../stores/quizStore';

const emit = defineEmits<{
  (e: 'openMasteryGrid', category?: 'hiragana' | 'katakana' | 'words' | 'kanji'): void;
}>();

const quizStore = useQuizStore();
</script>

<template>
  <div class="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-5 shadow-sm flex flex-col gap-4 text-slate-800 dark:text-slate-100 transition-all">
    <!-- Header: Title & Total Progress -->
    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-aizome/10 dark:bg-torii/15 border border-aizome/25 dark:border-torii/30 text-aizome dark:text-torii flex items-center justify-center font-bold text-base shadow-2xs">
          <Target class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-xs font-black uppercase tracking-wider text-aizome dark:text-torii">
            Penguasaan
          </h3>
          <div class="text-sm font-black text-slate-900 dark:text-slate-100">
            {{ quizStore.overallMasteryStats.mastered }} <span class="text-xs font-semibold text-slate-400">/ {{ quizStore.overallMasteryStats.total }}</span>
          </div>
        </div>
      </div>

      <span class="px-2.5 py-1 rounded-xl text-xs font-black bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60">
        {{ quizStore.overallMasteryStats.percentage }}%
      </span>
    </div>

    <!-- Overall Progress Bar -->
    <div class="flex flex-col gap-1.5">
      <div class="w-full h-2.5 bg-slate-100 dark:bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-200/80 dark:border-slate-800 shadow-inner">
        <div 
          class="h-full bg-gradient-to-r from-aizome via-aizome-light to-matcha dark:from-torii dark:via-amber-500 dark:to-matcha rounded-full transition-all duration-700"
          :style="{ width: `${quizStore.overallMasteryStats.percentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Category Breakdown Rows -->
    <div class="flex flex-col gap-2.5">
      <!-- Hiragana -->
      <div 
        role="button"
        tabindex="0"
        @click="emit('openMasteryGrid', 'hiragana')"
        @keydown.enter.prevent="emit('openMasteryGrid', 'hiragana')"
        @keydown.space.prevent="emit('openMasteryGrid', 'hiragana')"
        class="flex flex-col gap-1 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-aizome/30 dark:hover:border-torii/30 cursor-pointer select-none transition-all group shadow-2xs active:scale-[0.985]"
        title="Buka Peta Penguasaan Hiragana"
      >
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200 group-hover:text-aizome dark:group-hover:text-torii transition-colors">
            <span class="w-5 h-5 rounded-md bg-aizome/10 text-aizome dark:bg-torii/15 dark:text-torii font-jp flex items-center justify-center text-[10px] font-bold border border-aizome/20 dark:border-torii/25 group-hover:scale-105 transition-transform">あ</span>
            Hiragana
          </span>
          <div class="flex items-center gap-1">
            <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
              {{ quizStore.hiraganaMasteryStats.mastered }}/{{ quizStore.hiraganaMasteryStats.total }}
            </span>
            <ChevronRight class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-aizome dark:group-hover:text-torii group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
        <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
          <div 
            class="h-full bg-aizome dark:bg-torii rounded-full transition-all duration-500"
            :style="{ width: `${quizStore.hiraganaMasteryStats.percentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Katakana -->
      <div 
        role="button"
        tabindex="0"
        @click="emit('openMasteryGrid', 'katakana')"
        @keydown.enter.prevent="emit('openMasteryGrid', 'katakana')"
        @keydown.space.prevent="emit('openMasteryGrid', 'katakana')"
        class="flex flex-col gap-1 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-aizome-light/40 dark:hover:border-amber-500/40 cursor-pointer select-none transition-all group shadow-2xs active:scale-[0.985]"
        title="Buka Peta Penguasaan Katakana"
      >
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200 group-hover:text-aizome-light dark:group-hover:text-amber-500 transition-colors">
            <span class="w-5 h-5 rounded-md bg-aizome/10 text-aizome dark:bg-amber-500/15 dark:text-amber-500 font-jp flex items-center justify-center text-[10px] font-bold border border-aizome/20 dark:border-amber-500/25 group-hover:scale-105 transition-transform">ア</span>
            Katakana
          </span>
          <div class="flex items-center gap-1">
            <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
              {{ quizStore.katakanaMasteryStats.mastered }}/{{ quizStore.katakanaMasteryStats.total }}
            </span>
            <ChevronRight class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-aizome-light dark:group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
        <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
          <div 
            class="h-full bg-aizome-light dark:bg-amber-500 rounded-full transition-all duration-500"
            :style="{ width: `${quizStore.katakanaMasteryStats.percentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Kanji N5 -->
      <div 
        role="button"
        tabindex="0"
        @click="emit('openMasteryGrid', 'kanji')"
        @keydown.enter.prevent="emit('openMasteryGrid', 'kanji')"
        @keydown.space.prevent="emit('openMasteryGrid', 'kanji')"
        class="flex flex-col gap-1 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-matcha/40 cursor-pointer select-none transition-all group shadow-2xs active:scale-[0.985]"
        title="Buka Peta Penguasaan Kanji N5"
      >
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200 group-hover:text-matcha transition-colors">
            <span class="w-5 h-5 rounded-md bg-matcha/15 text-matcha font-jp flex items-center justify-center text-[10px] font-bold border border-matcha/25 group-hover:scale-105 transition-transform">漢</span>
            Kanji N5
          </span>
          <div class="flex items-center gap-1">
            <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
              {{ quizStore.kanjiMasteryStats.mastered }}/{{ quizStore.kanjiMasteryStats.total }}
            </span>
            <ChevronRight class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-matcha group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
        <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
          <div 
            class="h-full bg-matcha rounded-full transition-all duration-500"
            :style="{ width: `${quizStore.kanjiMasteryStats.percentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Kotoba N5 -->
      <div 
        role="button"
        tabindex="0"
        @click="emit('openMasteryGrid', 'words')"
        @keydown.enter.prevent="emit('openMasteryGrid', 'words')"
        @keydown.space.prevent="emit('openMasteryGrid', 'words')"
        class="flex flex-col gap-1 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer select-none transition-all group shadow-2xs active:scale-[0.985]"
        title="Buka Peta Penguasaan Kotoba N5"
      >
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
            <span class="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-jp flex items-center justify-center text-[10px] font-bold border border-slate-300 dark:border-slate-700 group-hover:scale-105 transition-transform">言</span>
            Kotoba N5
          </span>
          <div class="flex items-center gap-1">
            <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
              {{ quizStore.wordsMasteryStats.mastered }}/{{ quizStore.wordsMasteryStats.total }}
            </span>
            <ChevronRight class="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
          </div>
        </div>
        <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
          <div 
            class="h-full bg-slate-600 dark:bg-torii-light rounded-full transition-all duration-500"
            :style="{ width: `${quizStore.wordsMasteryStats.percentage}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Tier Quick Badges -->
    <div class="grid grid-cols-2 gap-1.5 pt-1">
      <div class="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs">
        <span class="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1.5">
          <Crown class="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />
          <span>Mahkota</span>
        </span>
        <span class="font-black text-amber-900 dark:text-amber-200 font-mono">{{ quizStore.overallMasteryStats.crown }}</span>
      </div>
      <div class="p-2 rounded-xl bg-aizome/10 dark:bg-emerald-500/10 border border-aizome/25 dark:border-emerald-500/25 flex items-center justify-between text-xs">
        <span class="text-[11px] font-bold text-aizome dark:text-emerald-300 flex items-center gap-1.5">
          <CheckCircle2 class="w-3.5 h-3.5 text-aizome dark:text-emerald-400 fill-aizome/20 dark:fill-emerald-500/20" />
          <span>Dikuasai</span>
        </span>
        <span class="font-black text-aizome dark:text-emerald-200 font-mono">{{ quizStore.overallMasteryStats.mastered }}</span>
      </div>
    </div>

    <!-- CTA Button to Open Full Grid Modal -->
    <button
      type="button"
      @click="emit('openMasteryGrid')"
      class="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 hover:text-aizome dark:text-slate-200 dark:hover:text-white font-bold text-xs border border-slate-200/80 dark:border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs active:scale-[0.98]"
    >
      <LayoutGrid class="w-4 h-4" />
      <span>Buka Grid Lengkap</span>
    </button>
  </div>
</template>
