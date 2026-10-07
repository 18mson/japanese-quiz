<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Clock } from '@lucide/vue';
import { formatRemainingTime } from '../../utils/dailyTime';

const props = defineProps<{
  resetsAt: string | null;
}>();

const hours = ref('00');
const minutes = ref('00');
const seconds = ref('00');

let timerId: any = null;

function updateCountdown() {
  const formatted = formatRemainingTime(props.resetsAt);
  hours.value = formatted.hours;
  minutes.value = formatted.minutes;
  seconds.value = formatted.seconds;
}

onMounted(() => {
  updateCountdown();
  timerId = setInterval(updateCountdown, 1000);
});

onUnmounted(() => {
  if (timerId) clearInterval(timerId);
});

const isZero = computed(() => hours.value === '00' && minutes.value === '00' && seconds.value === '00');
</script>

<template>
  <div class="inline-flex items-center gap-2 bg-slate-900/80 dark:bg-slate-950/80 text-amber-300 dark:text-amber-400 border border-amber-500/30 dark:border-amber-500/40 px-3.5 py-1.5 rounded-full shadow-inner text-xs sm:text-sm font-mono tracking-wider">
    <Clock class="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
    <span class="font-sans font-semibold text-slate-300 text-xs hidden xs:inline">Reset dalam:</span>
    <div class="flex items-center font-extrabold text-amber-300">
      <span class="w-6 text-center">{{ hours }}</span>
      <span class="animate-pulse">:</span>
      <span class="w-6 text-center">{{ minutes }}</span>
      <span class="animate-pulse">:</span>
      <span class="w-6 text-center">{{ seconds }}</span>
    </div>
    <span v-if="isZero" class="text-[10px] text-emerald-400 font-bold ml-1">(Bisa Mulai!)</span>
  </div>
</template>
