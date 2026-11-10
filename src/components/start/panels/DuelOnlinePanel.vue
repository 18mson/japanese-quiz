<script setup lang="ts">
import { Swords, Zap } from '@lucide/vue';

defineProps<{
  subType: string;
}>();

const emit = defineEmits<{
  (e: 'selectSubType', key: string): void;
  (e: 'interact'): void;
}>();

const onlineGameSubTypes = [
  { key: 'battleground', label: 'Adu Ketik', icon: Swords },
  { key: 'quiz_blitz', label: 'Quiz Blitz', icon: Zap },
];

const handleSelect = (key: string) => {
  emit('interact');
  emit('selectSubType', key);
};
</script>

<template>
  <div class="flex flex-col gap-2 w-full animate-fadeIn pt-1">
    <!-- Sub-Menu Selector Pills: Adu Ketik & Quiz Blitz -->
    <div class="grid grid-cols-2 gap-1.5 sm:gap-2 w-full">
      <button
        v-for="sub in onlineGameSubTypes"
        :key="sub.key"
        type="button"
        @click.stop="handleSelect(sub.key)"
        :class="[
          'min-h-[44px] py-2 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer border flex items-center justify-center gap-1.5 shadow-2xs active:scale-95',
          subType === sub.key
            ? 'bg-gradient-to-r from-rose-600 to-orange-600 text-white border-rose-500 font-black shadow-xs scale-[1.02]'
            : 'bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200/90 dark:border-slate-700/80'
        ]"
      >
        <component :is="sub.icon" class="w-4 h-4 text-amber-300 shrink-0" />
        <span class="truncate">{{ sub.label }}</span>
      </button>
    </div>
  </div>
</template>
