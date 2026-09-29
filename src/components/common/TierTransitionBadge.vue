<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircle2, Crown, Sparkles, TrendingDown, TrendingUp } from '@lucide/vue';
import type { TierTransition } from '../../utils/masteryStats';

const props = withDefaults(
  defineProps<{
    transition: TierTransition | null;
    size?: 'sm' | 'md';
  }>(),
  {
    size: 'md',
  }
);

const config = computed(() => {
  if (!props.transition) return null;

  if (props.transition.direction === 'down') {
    return {
      classes: 'bg-white/95 dark:bg-slate-900/95 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-700/80 shadow-xs',
      icon: TrendingDown,
      iconClass: 'text-rose-500 shrink-0'
    };
  }

  switch (props.transition.newTier) {
    case 'crown':
      return {
        classes: 'bg-white/95 dark:bg-slate-900/95 text-amber-800 dark:text-amber-300 border-amber-300/90 dark:border-amber-600/80 shadow-xs',
        icon: Crown,
        iconClass: 'text-amber-500 fill-amber-500/20 shrink-0'
      };
    case 'mastered':
      return {
        classes: 'bg-white/95 dark:bg-slate-900/95 text-emerald-800 dark:text-emerald-300 border-emerald-300/90 dark:border-emerald-600/80 shadow-xs',
        icon: CheckCircle2,
        iconClass: 'text-emerald-600 dark:text-emerald-400 fill-emerald-500/20 shrink-0'
      };
    case 'learning':
      return {
        classes: 'bg-white/95 dark:bg-slate-900/95 text-aizome dark:text-indigo-300 border-aizome/30 dark:border-indigo-600/80 shadow-xs',
        icon: TrendingUp,
        iconClass: 'text-aizome dark:text-indigo-400 shrink-0'
      };
    default:
      return {
        classes: 'bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 shadow-xs',
        icon: Sparkles,
        iconClass: 'text-slate-500 shrink-0'
      };
  }
});
</script>

<template>
  <div 
    v-if="transition && config"
    class="inline-flex items-center gap-1.5 rounded-full font-bold border transition-all animate-fadeIn select-none shrink-0"
    :class="[
      config.classes,
      size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1.5 text-xs'
    ]"
  >
    <component 
      :is="config.icon" 
      :class="[
        config.iconClass, 
        size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'
      ]" 
    />
    <span>{{ transition.label }}</span>
  </div>
</template>
