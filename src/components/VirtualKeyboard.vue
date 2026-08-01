<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  theme?: 'light' | 'dark';
  disabled?: boolean;
  showEnter?: boolean;
}>(), {
  theme: 'light',
  disabled: false,
  showEnter: true,
});

const emit = defineEmits<{
  (e: 'key', char: string): void;
  (e: 'backspace'): void;
  (e: 'enter'): void;
}>();

const row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
const row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
const row3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

function handleKeyPress(char: string) {
  if (props.disabled) return;
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(10); } catch {}
  }
  emit('key', char);
}

function handleBackspace() {
  if (props.disabled) return;
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(15); } catch {}
  }
  emit('backspace');
}

function handleEnter() {
  if (props.disabled) return;
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(15); } catch {}
  }
  emit('enter');
}

const isDark = computed(() => props.theme === 'dark');

const containerClass = computed(() => isDark.value
  ? 'bg-slate-950/95 backdrop-blur-xl border-t border-slate-800/90 text-white shadow-2xl'
  : 'bg-white/95 backdrop-blur-xl border-t border-slate-200/90 text-slate-900 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]'
);

const keyBaseClass = computed(() => isDark.value
  ? 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border-slate-700/60 active:bg-indigo-600 active:text-white active:scale-95 active:shadow-indigo-500/50'
  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-800 border-slate-200/80 active:bg-indigo-600 active:text-white active:scale-95 active:shadow-indigo-500/30 shadow-xs'
);

const backspaceClass = computed(() => isDark.value
  ? 'bg-slate-800/90 hover:bg-rose-900/60 text-rose-400 border-rose-500/30 active:bg-rose-600 active:text-white active:scale-95'
  : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200 active:bg-rose-600 active:text-white active:scale-95 shadow-xs'
);

const enterClass = computed(() => isDark.value
  ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/50 active:bg-indigo-700 active:scale-95 shadow-md shadow-indigo-600/30 font-bold'
  : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 active:bg-indigo-800 active:scale-95 shadow-xs font-bold'
);
</script>

<template>
  <div
    class="w-full p-1.5 pb-3 sm:p-2.5 flex flex-col gap-1.5 select-none z-40 touch-none transition-colors duration-200"
    :class="[containerClass, { 'opacity-60 pointer-events-none': disabled }]"
  >
    <!-- Row 1 -->
    <div class="flex justify-center gap-1 w-full">
      <button
        v-for="key in row1"
        :key="key"
        type="button"
        :disabled="disabled"
        @touchstart.prevent="handleKeyPress(key)"
        @mousedown.prevent="handleKeyPress(key)"
        class="flex-1 max-w-[38px] sm:max-w-[46px] h-11 sm:h-12 rounded-lg font-bold text-lg sm:text-xl uppercase border transition-all flex items-center justify-center cursor-pointer"
        :class="keyBaseClass"
      >
        {{ key }}
      </button>
    </div>

    <!-- Row 2 -->
    <div class="flex justify-center gap-1 w-full px-1.5">
      <button
        v-for="key in row2"
        :key="key"
        type="button"
        :disabled="disabled"
        @touchstart.prevent="handleKeyPress(key)"
        @mousedown.prevent="handleKeyPress(key)"
        class="flex-1 max-w-[38px] sm:max-w-[46px] h-11 sm:h-12 rounded-lg font-bold text-lg sm:text-xl uppercase border transition-all flex items-center justify-center cursor-pointer"
        :class="keyBaseClass"
      >
        {{ key }}
      </button>
    </div>

    <!-- Row 3 -->
    <div class="flex justify-center gap-1 w-full">
      <button
        v-for="key in row3"
        :key="key"
        type="button"
        :disabled="disabled"
        @touchstart.prevent="handleKeyPress(key)"
        @mousedown.prevent="handleKeyPress(key)"
        class="flex-1 max-w-[38px] sm:max-w-[46px] h-11 sm:h-12 rounded-lg font-bold text-lg sm:text-xl uppercase border transition-all flex items-center justify-center cursor-pointer"
        :class="keyBaseClass"
      >
        {{ key }}
      </button>

      <!-- Backspace key -->
      <button
        type="button"
        :disabled="disabled"
        @touchstart.prevent="handleBackspace"
        @mousedown.prevent="handleBackspace"
        class="flex-1 max-w-[52px] sm:max-w-[62px] h-11 sm:h-12 rounded-lg font-bold text-base sm:text-lg border transition-all flex items-center justify-center cursor-pointer"
        :class="backspaceClass"
        title="Backspace"
      >
        ⌫
      </button>
    </div>

    <!-- Row 4: Hyphen, Space bar & Enter -->
    <div class="flex justify-center gap-1.5 w-full px-1">
      <button
        type="button"
        :disabled="disabled"
        @touchstart.prevent="handleKeyPress('-')"
        @mousedown.prevent="handleKeyPress('-')"
        class="w-11 sm:w-14 h-11 sm:h-12 rounded-lg font-bold text-xl border flex items-center justify-center cursor-pointer"
        :class="keyBaseClass"
      >
        -
      </button>
      <button
        type="button"
        :disabled="disabled"
        @touchstart.prevent="handleKeyPress(' ')"
        @mousedown.prevent="handleKeyPress(' ')"
        class="flex-1 h-11 sm:h-12 rounded-lg font-semibold text-xs sm:text-sm tracking-wider uppercase border flex items-center justify-center cursor-pointer"
        :class="keyBaseClass"
      >
        SPACE
      </button>
      <button
        v-if="showEnter"
        type="button"
        :disabled="disabled"
        @touchstart.prevent="handleEnter"
        @mousedown.prevent="handleEnter"
        class="w-16 sm:w-20 h-11 sm:h-12 rounded-lg text-xs sm:text-sm tracking-wider uppercase border flex items-center justify-center gap-1 cursor-pointer"
        :class="enterClass"
      >
        <span>ENTER</span>
        <span class="text-sm font-normal">⏎</span>
      </button>
    </div>
  </div>
</template>
