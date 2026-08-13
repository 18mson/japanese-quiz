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
  <Transition name="slide-up">
    <div 
      v-if="goalsStore.showCelebration"
      class="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 p-4 rounded-2xl shadow-2xl border border-yellow-300/50 flex items-center justify-between gap-3 animate-bounce-short"
    >
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-slate-950/20 flex items-center justify-center shrink-0">
          <Trophy class="w-6 h-6 text-slate-950" />
        </div>
        <div>
          <h4 class="font-black text-sm uppercase tracking-wider">TARGET HARIAN TERCAPAI! 🎉</h4>
          <p class="text-xs font-semibold text-slate-900">
            Selamat! Kamu sudah menyelesaikan target {{ goalsStore.targetValue }} {{ goalsStore.goalType === 'questions' ? 'soal' : 'menit' }} hari ini!
          </p>
        </div>
      </div>

      <button 
        @click="dismiss"
        class="p-1.5 rounded-lg bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 transition cursor-pointer shrink-0"
        title="Tutup"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </Transition>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style>
