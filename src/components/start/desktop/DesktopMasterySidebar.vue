<script setup lang="ts">
import { Target, LayoutGrid } from '@lucide/vue';
import { useQuizStore } from '../../../stores/quizStore';

const emit = defineEmits<{
  (e: 'openMasteryGrid'): void;
}>();

const quizStore = useQuizStore();
</script>

<template>
  <div class="w-full bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-3.5 sm:p-5 shadow-sm flex flex-col gap-4 text-slate-800 dark:text-slate-100 transition-all">
    <!-- Header: Title & Total Progress -->
    <div class="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-800">
      <div class="flex items-center gap-2.5">
        <div class="w-9 h-9 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-base shadow-2xs">
          <Target class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-xs font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Penguasaan Huruf
          </h3>
          <div class="text-sm font-black text-gray-900 dark:text-slate-100">
            {{ quizStore.overallMasteryStats.mastered }} <span class="text-xs font-semibold text-slate-400">/ {{ quizStore.overallMasteryStats.total }}</span>
          </div>
        </div>
      </div>

      <span class="px-2.5 py-1 rounded-xl text-xs font-black bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200/60 dark:border-indigo-800/60">
        {{ quizStore.overallMasteryStats.percentage }}%
      </span>
    </div>

    <!-- Overall Progress Bar -->
    <div class="flex flex-col gap-1.5">
      <div class="w-full h-2.5 bg-gray-100 dark:bg-slate-950 rounded-full overflow-hidden p-0.5 border border-gray-200/80 dark:border-slate-800 shadow-inner">
        <div 
          class="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 rounded-full transition-all duration-700"
          :style="{ width: `${quizStore.overallMasteryStats.percentage}%` }"
        ></div>
      </div>
    </div>

    <!-- Category Breakdown Rows -->
    <div class="flex flex-col gap-2.5">
      <!-- Hiragana -->
      <div class="flex flex-col gap-1 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200">
            <span class="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-300 font-jp flex items-center justify-center text-[10px] font-bold">あ</span>
            Hiragana
          </span>
          <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {{ quizStore.hiraganaMasteryStats.mastered }}/{{ quizStore.hiraganaMasteryStats.total }}
          </span>
        </div>
        <div class="w-full h-1.5 bg-gray-200 dark:bg-slate-900 rounded-full overflow-hidden">
          <div 
            class="h-full bg-indigo-500 rounded-full transition-all duration-500"
            :style="{ width: `${quizStore.hiraganaMasteryStats.percentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Katakana -->
      <div class="flex flex-col gap-1 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold flex items-center gap-1.5 text-blue-900 dark:text-blue-200">
            <span class="w-5 h-5 rounded-md bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 font-jp flex items-center justify-center text-[10px] font-bold">ア</span>
            Katakana
          </span>
          <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {{ quizStore.katakanaMasteryStats.mastered }}/{{ quizStore.katakanaMasteryStats.total }}
          </span>
        </div>
        <div class="w-full h-1.5 bg-gray-200 dark:bg-slate-900 rounded-full overflow-hidden">
          <div 
            class="h-full bg-blue-500 rounded-full transition-all duration-500"
            :style="{ width: `${quizStore.katakanaMasteryStats.percentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Kotoba N5 -->
      <div class="flex flex-col gap-1 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold flex items-center gap-1.5 text-purple-900 dark:text-purple-200">
            <span class="w-5 h-5 rounded-md bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 font-jp flex items-center justify-center text-[10px] font-bold">言</span>
            Kotoba N5
          </span>
          <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {{ quizStore.wordsMasteryStats.mastered }}/{{ quizStore.wordsMasteryStats.total }}
          </span>
        </div>
        <div class="w-full h-1.5 bg-gray-200 dark:bg-slate-900 rounded-full overflow-hidden">
          <div 
            class="h-full bg-purple-500 rounded-full transition-all duration-500"
            :style="{ width: `${quizStore.wordsMasteryStats.percentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Kanji N5 -->
      <div class="flex flex-col gap-1 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-gray-100 dark:border-slate-800">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold flex items-center gap-1.5 text-emerald-900 dark:text-emerald-200">
            <span class="w-5 h-5 rounded-md bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 font-jp flex items-center justify-center text-[10px] font-bold">漢</span>
            Kanji N5
          </span>
          <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {{ quizStore.kanjiMasteryStats.mastered }}/{{ quizStore.kanjiMasteryStats.total }}
          </span>
        </div>
        <div class="w-full h-1.5 bg-gray-200 dark:bg-slate-900 rounded-full overflow-hidden">
          <div 
            class="h-full bg-emerald-500 rounded-full transition-all duration-500"
            :style="{ width: `${quizStore.kanjiMasteryStats.percentage}%` }"
          ></div>
        </div>
      </div>
    </div>

    <!-- Tier Quick Badges -->
    <div class="grid grid-cols-2 gap-1.5 pt-1">
      <div class="p-2 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between text-xs">
        <span class="text-[11px] font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
          👑 Mahkota
        </span>
        <span class="font-black text-amber-900 dark:text-amber-200 font-mono">{{ quizStore.overallMasteryStats.crown }}</span>
      </div>
      <div class="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs">
        <span class="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
          ✨ Dikuasai
        </span>
        <span class="font-black text-emerald-900 dark:text-emerald-200 font-mono">{{ quizStore.overallMasteryStats.mastered }}</span>
      </div>
    </div>

    <!-- CTA Button to Open Full Grid Modal -->
    <button
      type="button"
      @click="emit('openMasteryGrid')"
      class="w-full py-2.5 px-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 font-bold text-xs border border-indigo-200/80 dark:border-indigo-800/80 flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs active:scale-[0.98]"
    >
      <LayoutGrid class="w-4 h-4" />
      <span>Buka Grid Lengkap</span>
    </button>
  </div>
</template>
