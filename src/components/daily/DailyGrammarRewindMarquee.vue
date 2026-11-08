<script setup lang="ts">
import { RotateCcw, ChevronRight } from '@lucide/vue';
import { useDailyGrammarRewind } from '../../composables/useDailyGrammarRewind';

const emit = defineEmits<{
  (e: 'openPopup'): void;
}>();

const { 
  hasLearnedLessons, 
  dailyHighlight 
} = useDailyGrammarRewind();
</script>

<template>
  <Transition name="fade-slide">
    <div 
      v-if="hasLearnedLessons && dailyHighlight"
      @click="emit('openPopup')"
      class="w-full bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 dark:from-amber-950/40 dark:via-slate-900 dark:to-amber-950/30 border border-amber-300/60 dark:border-amber-600/30 rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-xs cursor-pointer select-none overflow-hidden transition active:scale-[0.99] group hover:border-amber-400"
    >
      <!-- Fixed Left Badge -->
      <div class="flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded-md bg-amber-500/20 dark:bg-amber-500/30 border border-amber-400/50 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase tracking-wider shadow-2xs">
        <RotateCcw class="w-2.5 h-2.5 text-amber-600 dark:text-amber-400 animate-spin-slow shrink-0" />
        <span class="whitespace-nowrap">Rewind Bab {{ dailyHighlight.lessonNumber }}</span>
      </div>

      <!-- Running Marquee Track -->
      <div class="flex-1 overflow-hidden relative h-5 flex items-center">
        <div class="marquee-content flex items-center whitespace-nowrap text-xs text-slate-800 dark:text-slate-200">
          <span class="font-jp font-bold text-slate-900 dark:text-white mr-2">{{ dailyHighlight.pattern }}</span>
          <span class="text-amber-700 dark:text-amber-300 font-semibold mr-3">{{ dailyHighlight.meaning }}</span>
          <span class="text-slate-500 dark:text-slate-400 text-[11px] mr-2">• Contoh:</span>
          <span class="font-jp text-slate-700 dark:text-slate-300 mr-4">"{{ dailyHighlight.example.japanese }}"</span>
          <span class="text-amber-600 dark:text-amber-400 font-bold text-[11px] mr-6">Ketuk untuk lihat ❯</span>

          <!-- Duplicate for seamless scroll -->
          <span class="font-jp font-bold text-slate-900 dark:text-white mr-2">{{ dailyHighlight.pattern }}</span>
          <span class="text-amber-700 dark:text-amber-300 font-semibold mr-3">{{ dailyHighlight.meaning }}</span>
          <span class="text-slate-500 dark:text-slate-400 text-[11px] mr-2">• Contoh:</span>
          <span class="font-jp text-slate-700 dark:text-slate-300 mr-4">"{{ dailyHighlight.example.japanese }}"</span>
          <span class="text-amber-600 dark:text-amber-400 font-bold text-[11px] mr-6">Ketuk untuk lihat ❯</span>
        </div>
      </div>

      <!-- Right Arrow -->
      <ChevronRight class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
    </div>
  </Transition>
</template>

<style scoped>
.animate-spin-slow {
  animation: spin 8s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.marquee-content {
  display: inline-flex;
  animation: marquee 24s linear infinite;
}
.group:hover .marquee-content {
  animation-play-state: paused;
}

@keyframes marquee {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-50%); }
}

.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.2s ease-out;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
