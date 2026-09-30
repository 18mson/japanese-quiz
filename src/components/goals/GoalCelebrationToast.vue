<script setup lang="ts">
import { watch, onUnmounted } from 'vue';
import { Trophy, X } from '@lucide/vue';
import { useGoalsStore } from '../../stores/goalsStore';

const goalsStore = useGoalsStore();
let autoDismissTimer: any = null;

const dismiss = () => {
  if (autoDismissTimer) clearTimeout(autoDismissTimer);
  goalsStore.dismissCelebration();
};

watch(() => goalsStore.showCelebration, (newVal) => {
  if (autoDismissTimer) clearTimeout(autoDismissTimer);
  if (newVal) {
    autoDismissTimer = setTimeout(() => {
      dismiss();
    }, 4500);
  }
});

onUnmounted(() => {
  if (autoDismissTimer) clearTimeout(autoDismissTimer);
});
</script>

<template>
  <Transition name="toast-slide-down">
    <div 
      v-if="goalsStore.showCelebration"
      class="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-md bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-amber-300/80 dark:border-amber-500/30 text-slate-800 dark:text-slate-100 p-3.5 sm:p-4 rounded-2xl shadow-xl shadow-amber-500/10 dark:shadow-slate-950/70 flex items-center justify-between gap-3 overflow-hidden"
    >
      <!-- Japanese Torii & Aizome Top Accent Strip -->
      <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-torii to-aizome dark:to-amber-300"></div>

      <div class="flex items-center gap-3 min-w-0">
        <!-- Trophy Icon Pill with Celebration Glow -->
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200/80 dark:border-amber-400/30 flex items-center justify-center shrink-0 shadow-xs">
          <Trophy class="w-5 h-5 sm:w-6 sm:h-6 text-amber-600 dark:text-amber-400 animate-pulse" />
        </div>
        
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 mb-0.5">
            <span class="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-400/30 shrink-0">
              Target Harian
            </span>
            <h4 class="font-black text-xs sm:text-sm text-slate-900 dark:text-white tracking-wide truncate">
              Tercapai! 🎉
            </h4>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-snug font-medium line-clamp-2">
            Selamat! Kamu sudah menyelesaikan target <span class="font-bold text-amber-600 dark:text-amber-400">{{ goalsStore.targetValue }} {{ goalsStore.goalType === 'questions' ? 'soal' : 'menit' }}</span> hari ini!
          </p>
        </div>
      </div>

      <button 
        @click="dismiss"
        class="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-400 hover:text-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white transition cursor-pointer shrink-0 border border-slate-200 dark:border-slate-700/50"
        title="Tutup"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.toast-slide-down-enter-active,
.toast-slide-down-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-slide-down-enter-from,
.toast-slide-down-leave-to {
  opacity: 0;
  transform: translate(-50%, -24px) scale(0.96);
}
</style>
