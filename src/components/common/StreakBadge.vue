<script setup lang="ts">
import { computed } from 'vue';
import { Flame } from '@lucide/vue';

const props = withDefaults(
  defineProps<{
    streak: number;
    label?: string;
    size?: 'sm' | 'md' | 'lg';
    pulse?: boolean;
    showAlways?: boolean;
  }>(),
  {
    label: '',
    size: 'md',
    pulse: true,
    showAlways: false,
  }
);

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return {
        badge: 'px-2 py-0.5 text-[11px] gap-1 rounded-md',
        icon: 'w-3 h-3',
        count: 'text-xs',
        label: 'text-[9px]',
      };
    case 'lg':
      return {
        badge: 'px-3.5 py-1.5 text-sm gap-2 rounded-xl',
        icon: 'w-4 h-4',
        count: 'text-base',
        label: 'text-xs',
      };
    case 'md':
    default:
      return {
        badge: 'px-2.5 py-1 text-xs gap-1.5 rounded-lg sm:rounded-xl',
        icon: 'w-3.5 h-3.5',
        count: 'text-xs font-black',
        label: 'text-[10px]',
      };
  }
});
</script>

<template>
  <div
    v-if="showAlways || streak > 0"
    class="flex items-center font-bold bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/80 text-amber-700 dark:text-amber-300 shadow-xs transition select-none"
    :class="[
      sizeClasses.badge,
      pulse && streak > 0 ? 'animate-pulse' : ''
    ]"
  >
    <Flame
      class="fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400 shrink-0"
      :class="sizeClasses.icon"
    />
    <span :class="sizeClasses.count">{{ streak }}</span>
    <span
      v-if="label"
      class="text-amber-700/80 dark:text-amber-300/80 font-normal"
      :class="sizeClasses.label"
    >
      {{ label }}
    </span>
  </div>
</template>
