<script setup lang="ts">
import { computed } from 'vue';
import { ArrowRight } from '@lucide/vue';

const props = withDefaults(
  defineProps<{
    show?: boolean;
    status?: 'correct' | 'wrong' | 'neutral' | 'default';
    mode?: 'proceed' | 'typing';
    label?: string;
    shortcutLabel?: string;
    isLast?: boolean;
    submitDisabled?: boolean;
    showShortcut?: boolean;
  }>(),
  {
    show: true,
    status: 'neutral',
    mode: 'proceed',
    shortcutLabel: 'Enter',
    isLast: false,
    submitDisabled: false,
    showShortcut: true,
  }
);

defineEmits<{
  (e: 'proceed'): void;
  (e: 'submit'): void;
  (e: 'skip'): void;
}>();

const buttonColorClass = computed(() => {
  if (props.status === 'correct') {
    return 'bg-emerald-600 hover:bg-emerald-700';
  }
  if (props.status === 'wrong') {
    return 'bg-rose-600 hover:bg-rose-700';
  }
  return 'bg-indigo-600 hover:bg-indigo-700';
});

const resolvedLabel = computed(() => {
  if (props.label) return props.label;
  return props.isLast ? 'Lihat Hasil Akhir' : 'Lanjut Soal Berikutnya';
});
</script>

<template>
  <div 
    v-if="show" 
    class="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 py-3.5 px-6 flex justify-center items-center shadow-lg z-30 w-full animate-fadeIn"
  >
    <div class="max-w-md w-full flex justify-center gap-4">
      <!-- Mode Typing (Pre-Answer Actions on Desktop: Skip & Submit) -->
      <template v-if="mode === 'typing'">
        <div class="hidden sm:flex justify-center gap-4 w-full">
          <button 
            type="button"
            class="px-6 py-2.5 bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-slate-200 font-semibold rounded-xl transition duration-200 hover:bg-gray-300 dark:hover:bg-slate-700 cursor-pointer shadow-sm text-sm"
            @click="$emit('skip')"
          >
            Skip
          </button>
          <button 
            type="button"
            class="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg text-sm flex-1 max-w-[200px] cursor-pointer"
            :disabled="submitDisabled"
            @click="$emit('submit')"
          >
            Submit
          </button>
        </div>
      </template>

      <!-- Mode Proceed (Post-Answer Single Action: Lanjut / Selesai) -->
      <template v-else>
        <button 
          type="button"
          @click="$emit('proceed')"
          class="w-full sm:w-64 font-bold rounded-xl py-2.5 shadow-md hover:shadow-lg transition duration-200 flex justify-center items-center gap-2 cursor-pointer text-sm text-white"
          :class="buttonColorClass"
        >
          <span>{{ resolvedLabel }}</span>
          <span 
            v-if="showShortcut && shortcutLabel"
            class="text-xs bg-white/20 px-2 py-0.5 rounded border border-white/30 font-mono"
          >
            {{ shortcutLabel }}
          </span>
          <ArrowRight class="w-4 h-4" />
        </button>
      </template>
    </div>
  </div>
</template>
