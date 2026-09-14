<script setup lang="ts">
import { computed } from 'vue';
import { CheckCircle2, XCircle } from '@lucide/vue';

const props = withDefaults(
  defineProps<{
    isCorrect: boolean;
    title?: string;
    subtitle?: string;
  }>(),
  {
    title: '',
    subtitle: '',
  }
);

const displayTitle = computed(() => {
  if (props.title) return props.title;
  return props.isCorrect ? 'Bagus Sekali! Benar! 🎉' : 'Kurang Tepat';
});
</script>

<template>
  <div
    class="w-full rounded-2xl p-4 sm:p-5 transition-all duration-300 flex flex-col gap-3 shadow-md animate-scaleUp"
    :class="
      isCorrect
        ? 'bg-emerald-50 dark:bg-emerald-950/70 border-2 border-emerald-400 dark:border-emerald-700'
        : 'bg-rose-50 dark:bg-rose-950/70 border-2 border-rose-400 dark:border-rose-700'
    "
  >
    <!-- Header: Icon, Title & Right Action/Audio -->
    <div class="flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 min-w-0">
        <CheckCircle2
          v-if="isCorrect"
          class="w-6 h-6 sm:w-7 sm:h-7 text-emerald-600 dark:text-emerald-400 shrink-0"
        />
        <XCircle
          v-else
          class="w-6 h-6 sm:w-7 sm:h-7 text-rose-600 dark:text-rose-400 shrink-0"
        />
        <div class="min-w-0">
          <span
            class="text-base sm:text-xl font-black tracking-tight block truncate"
            :class="isCorrect ? 'text-emerald-900 dark:text-emerald-100' : 'text-rose-900 dark:text-rose-100'"
          >
            {{ displayTitle }}
          </span>
          <p
            v-if="subtitle"
            class="text-xs mt-0.5"
            :class="isCorrect ? 'text-emerald-700/80 dark:text-emerald-300/80' : 'text-rose-700/80 dark:text-rose-300/80'"
          >
            {{ subtitle }}
          </p>
        </div>
      </div>

      <div v-if="$slots.action" class="shrink-0">
        <slot name="action"></slot>
      </div>
    </div>

    <!-- Custom details slot (answer details, alternate readings, hints) -->
    <slot name="details"></slot>
    <slot></slot>
  </div>
</template>

<style scoped>
@keyframes scaleUp {
  from { opacity: 0; transform: scale(0.96) translateY(6px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.animate-scaleUp {
  animation: scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
