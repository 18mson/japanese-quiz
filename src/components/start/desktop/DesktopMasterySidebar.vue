<script setup lang="ts">
import { Target, LayoutGrid, Crown, CheckCircle2 } from '@lucide/vue';
import { useQuizStore } from '../../../stores/quizStore';

const emit = defineEmits<{
  (e: 'openMasteryGrid'): void;
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
            Penguasaan Huruf
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
      <div class="flex flex-col gap-1 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <span class="w-5 h-5 rounded-md bg-aizome/10 text-aizome dark:bg-torii/15 dark:text-torii font-jp flex items-center justify-center text-[10px] font-bold border border-aizome/20 dark:border-torii/25">あ</span>
            Hiragana
          </span>
          <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {{ quizStore.hiraganaMasteryStats.mastered }}/{{ quizStore.hiraganaMasteryStats.total }}
          </span>
        </div>
        <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
          <div 
            class="h-full bg-aizome dark:bg-torii rounded-full transition-all duration-500"
            :style="{ width: `${quizStore.hiraganaMasteryStats.percentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Katakana -->
      <div class="flex flex-col gap-1 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <span class="w-5 h-5 rounded-md bg-aizome/10 text-aizome dark:bg-amber-500/15 dark:text-amber-500 font-jp flex items-center justify-center text-[10px] font-bold border border-aizome/20 dark:border-amber-500/25">ア</span>
            Katakana
          </span>
          <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {{ quizStore.katakanaMasteryStats.mastered }}/{{ quizStore.katakanaMasteryStats.total }}
          </span>
        </div>
        <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
          <div 
            class="h-full bg-aizome-light dark:bg-amber-500 rounded-full transition-all duration-500"
            :style="{ width: `${quizStore.katakanaMasteryStats.percentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Kotoba N5 -->
      <div class="flex flex-col gap-1 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <span class="w-5 h-5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-jp flex items-center justify-center text-[10px] font-bold border border-slate-300 dark:border-slate-700">言</span>
            Kotoba N5
          </span>
          <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {{ quizStore.wordsMasteryStats.mastered }}/{{ quizStore.wordsMasteryStats.total }}
          </span>
        </div>
        <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
          <div 
            class="h-full bg-slate-600 dark:bg-torii-light rounded-full transition-all duration-500"
            :style="{ width: `${quizStore.wordsMasteryStats.percentage}%` }"
          ></div>
        </div>
      </div>

      <!-- Kanji N5 -->
      <div class="flex flex-col gap-1 p-2.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
        <div class="flex items-center justify-between text-xs">
          <span class="font-bold flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
            <span class="w-5 h-5 rounded-md bg-matcha/15 text-matcha font-jp flex items-center justify-center text-[10px] font-bold border border-matcha/25">漢</span>
            Kanji N5
          </span>
          <span class="font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {{ quizStore.kanjiMasteryStats.mastered }}/{{ quizStore.kanjiMasteryStats.total }}
          </span>
        </div>
        <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
          <div 
            class="h-full bg-matcha rounded-full transition-all duration-500"
            :style="{ width: `${quizStore.kanjiMasteryStats.percentage}%` }"
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
      class="w-full py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 hover:text-aizome dark:text-slate-200 dark:hover:text-white font-bold text-xs border border-slate-200/80 dark:border-slate-700 flex items-center justify-center gap-2 transition cursor-pointer shadow-2xs active:scale-[0.98]"
    >
      <LayoutGrid class="w-4 h-4" />
      <span>Buka Grid Lengkap</span>
    </button>
  </div>
</template>
