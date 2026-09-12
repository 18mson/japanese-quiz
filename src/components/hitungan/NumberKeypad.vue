<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { Delete, Check, RotateCcw } from '@lucide/vue';

const props = defineProps<{
  modelValue: string;
  disabled?: boolean;
  allowQuestionMark?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'submit'): void;
}>();

const currentVal = computed(() => props.modelValue || '');

const handleDigit = (digit: string) => {
  if (props.disabled) return;
  // Limit max length to avoid overflow
  if (currentVal.value.length >= 10) return;
  emit('update:modelValue', currentVal.value + digit);
};

const handleBackspace = () => {
  if (props.disabled) return;
  if (currentVal.value.length > 0) {
    emit('update:modelValue', currentVal.value.slice(0, -1));
  }
};

const handleClear = () => {
  if (props.disabled) return;
  emit('update:modelValue', '');
};

const handleSubmit = () => {
  if (props.disabled || currentVal.value.trim() === '') return;
  emit('submit');
};

// Physical keyboard listener so PC / laptop users can also type seamlessly
const handleKeyDown = (e: KeyboardEvent) => {
  if (props.disabled) return;
  // Ignore if user is inside another form input
  const target = e.target as HTMLElement | null;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') && !target.classList.contains('numpad-receiver')) {
    return;
  }

  if (/^[0-9]$/.test(e.key)) {
    e.preventDefault();
    handleDigit(e.key);
  } else if (e.key === '?' && props.allowQuestionMark) {
    e.preventDefault();
    handleDigit('?');
  } else if (e.key === 'Backspace') {
    e.preventDefault();
    handleBackspace();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    handleSubmit();
  } else if (e.key === 'Escape') {
    e.preventDefault();
    handleClear();
  }
};

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="w-full max-w-xs mx-auto flex flex-col items-center select-none">
    <!-- Value Display Box Above Numpad -->
    <div 
      class="w-full bg-slate-900/95 dark:bg-slate-900 border-2 border-indigo-500/40 rounded-2xl p-3 mb-3 flex items-center justify-between shadow-inner relative"
    >
      <div class="flex-1 text-center font-mono text-2xl sm:text-3xl font-black text-amber-300 tracking-widest min-h-[36px] flex items-center justify-center">
        <span v-if="currentVal">{{ currentVal }}</span>
        <span v-else class="text-slate-600 font-sans text-sm font-normal">Ketik angka jawaban...</span>
        <!-- Blinking cursor indicator -->
        <span class="inline-block w-0.5 h-6 bg-amber-400 ml-1 animate-pulse"></span>
      </div>

      <!-- Quick Clear Button -->
      <button
        v-if="currentVal"
        type="button"
        @click="handleClear"
        class="text-slate-400 hover:text-rose-400 p-1 rounded-lg transition"
        title="Hapus Semua"
      >
        <RotateCcw class="w-4 h-4" />
      </button>
    </div>

    <!-- Numpad Grid (3 columns x 4 rows) -->
    <div class="w-full grid grid-cols-3 gap-2 sm:gap-2.5 touch-manipulation">
      <!-- Row 1: 7, 8, 9 -->
      <button 
        type="button"
        @click="handleDigit('7')"
        :disabled="disabled"
        class="numpad-key"
      >
        7
      </button>
      <button 
        type="button"
        @click="handleDigit('8')"
        :disabled="disabled"
        class="numpad-key"
      >
        8
      </button>
      <button 
        type="button"
        @click="handleDigit('9')"
        :disabled="disabled"
        class="numpad-key"
      >
        9
      </button>

      <!-- Row 2: 4, 5, 6 -->
      <button 
        type="button"
        @click="handleDigit('4')"
        :disabled="disabled"
        class="numpad-key"
      >
        4
      </button>
      <button 
        type="button"
        @click="handleDigit('5')"
        :disabled="disabled"
        class="numpad-key"
      >
        5
      </button>
      <button 
        type="button"
        @click="handleDigit('6')"
        :disabled="disabled"
        class="numpad-key"
      >
        6
      </button>

      <!-- Row 3: 1, 2, 3 -->
      <button 
        type="button"
        @click="handleDigit('1')"
        :disabled="disabled"
        class="numpad-key"
      >
        1
      </button>
      <button 
        type="button"
        @click="handleDigit('2')"
        :disabled="disabled"
        class="numpad-key"
      >
        2
      </button>
      <button 
        type="button"
        @click="handleDigit('3')"
        :disabled="disabled"
        class="numpad-key"
      >
        3
      </button>

      <!-- Row 4: ⌫, 0, ✓ -->
      <button 
        type="button"
        @click="handleBackspace"
        :disabled="disabled || !currentVal"
        class="numpad-action-key bg-slate-800/80 hover:bg-slate-700/80 active:bg-slate-600 text-rose-300"
        title="Backspace"
      >
        <Delete class="w-6 h-6" />
      </button>
      <button 
        type="button"
        @click="handleDigit('0')"
        :disabled="disabled"
        class="numpad-key"
      >
        0
      </button>
      <button 
        type="button"
        @click="handleSubmit"
        :disabled="disabled || !currentVal"
        class="numpad-action-key bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white shadow-lg shadow-emerald-600/30"
        title="Kirim Jawaban"
      >
        <Check class="w-6 h-6 stroke-[3]" />
      </button>
    </div>

    <!-- Optional counter ? key if enabled -->
    <div v-if="allowQuestionMark" class="w-full mt-2">
      <button 
        type="button"
        @click="handleDigit('?')"
        :disabled="disabled"
        class="w-full py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl font-bold text-sm transition"
      >
        ? (Berapa / なん)
      </button>
    </div>
  </div>
</template>

<style scoped>
.numpad-key {
  height: 3.5rem;
  border-radius: 1rem;
  background-color: rgb(30 41 59 / 0.9);
  color: rgb(241 245 249);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 1.5rem;
  line-height: 2rem;
  font-weight: 700;
  border: 1px solid rgb(51 65 85 / 0.8);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition: all 100ms cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

@media (min-width: 640px) {
  .numpad-key {
    height: 4rem;
    font-size: 1.875rem;
    line-height: 2.25rem;
  }
}

.numpad-key:hover {
  background-color: rgb(51 65 85);
}

.numpad-key:active {
  background-color: rgb(79 70 229);
  color: #ffffff;
  transform: scale(0.95);
}

.numpad-action-key {
  height: 3.5rem;
  border-radius: 1rem;
  font-weight: 700;
  border: 1px solid rgb(51 65 85 / 0.8);
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition: all 100ms cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

@media (min-width: 640px) {
  .numpad-action-key {
    height: 4rem;
  }
}

.numpad-action-key:active {
  transform: scale(0.95);
}
</style>

