<script setup lang="ts">
import { ref, computed } from 'vue';
import { useSettingsStore, type KeyboardHeight } from '../stores/settingsStore';

const props = withDefaults(defineProps<{
  theme?: 'light' | 'dark' | 'auto';
  disabled?: boolean;
  showEnter?: boolean;
  enterLabel?: string;
  enableSound?: boolean;
  keyboardHeight?: KeyboardHeight;
}>(), {
  theme: 'auto',
  disabled: false,
  showEnter: true,
  enterLabel: 'SUBMIT',
  enableSound: true,
});

const emit = defineEmits<{
  (e: 'key', char: string): void;
  (e: 'backspace'): void;
  (e: 'enter'): void;
}>();

const settingsStore = useSettingsStore();

const activeKeyboardHeight = computed(() => props.keyboardHeight || settingsStore.keyboardHeight);

const keyHeightClass = computed(() => 
  activeKeyboardHeight.value === 'tall' ? 'h-14 sm:h-16' : 'h-11 sm:h-12'
);

const row1 = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'];
const row2 = ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'];
const row3 = ['z', 'x', 'c', 'v', 'b', 'n', 'm'];

const activeKey = ref<string | null>(null);
let activeKeyTimer: ReturnType<typeof setTimeout> | null = null;
let audioCtx: AudioContext | null = null;

function playClickSound() {
  if (!props.enableSound) return;
  try {
    if (typeof window === 'undefined') return;
    const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtxClass) return;
    if (!audioCtx) {
      audioCtx = new AudioCtxClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(550, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, audioCtx.currentTime + 0.015);

    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.015);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.015);
  } catch {}
}

function triggerVisualEffect(keyId: string) {
  activeKey.value = keyId;
  if (activeKeyTimer) clearTimeout(activeKeyTimer);
  activeKeyTimer = setTimeout(() => {
    activeKey.value = null;
  }, 120);
}

function handleKeyPress(char: string) {
  if (props.disabled) return;
  triggerVisualEffect(char);
  playClickSound();
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(10); } catch {}
  }
  emit('key', char);
}

function handleBackspace() {
  if (props.disabled) return;
  triggerVisualEffect('backspace');
  playClickSound();
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(15); } catch {}
  }
  emit('backspace');
}

function handleEnter() {
  if (props.disabled) return;
  triggerVisualEffect('enter');
  playClickSound();
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(15); } catch {}
  }
  emit('enter');
}

const isDark = computed(() => props.theme === 'dark' || (props.theme === 'auto' && settingsStore.isDarkMode));

const containerClass = computed(() => isDark.value
  ? 'bg-slate-950/98 backdrop-blur-xl border-t border-slate-800/90 text-white shadow-2xl'
  : 'bg-white/98 backdrop-blur-xl border-t border-slate-200/90 text-slate-900 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]'
);

const keyBaseClass = computed(() => isDark.value
  ? 'bg-slate-800/90 hover:bg-slate-700/90 text-slate-100 border-slate-700/60 active:bg-indigo-600 active:text-white active:scale-90 active:shadow-[0_0_12px_rgba(99,102,241,0.6)]'
  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-800 border-slate-200/80 active:bg-indigo-600 active:text-white active:scale-90 active:shadow-[0_0_12px_rgba(79,70,229,0.5)] shadow-xs'
);

const backspaceClass = computed(() => isDark.value
  ? 'bg-slate-800/90 hover:bg-rose-900/60 text-rose-400 border-rose-500/30 active:bg-rose-600 active:text-white active:scale-90 active:shadow-[0_0_12px_rgba(244,63,94,0.6)]'
  : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200 active:bg-rose-600 active:text-white active:scale-90 active:shadow-[0_0_12px_rgba(225,29,72,0.5)] shadow-xs'
);

const enterClass = computed(() => isDark.value
  ? 'bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/50 active:bg-indigo-700 active:scale-90 shadow-md shadow-indigo-600/30 font-bold'
  : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 active:bg-indigo-800 active:scale-90 shadow-md shadow-indigo-600/20 font-bold'
);
</script>

<template>
  <div
    class="w-full p-1.5 pb-4 sm:p-2.5 flex flex-col gap-1.5 select-none z-40 touch-none transition-colors duration-200"
    :class="[containerClass, { 'opacity-60 pointer-events-none': disabled }]"
  >
    <!-- Custom Top Content / Action Bar Slot -->
    <div v-if="$slots.top" class="w-full px-1 pb-1 flex items-center justify-between gap-2 border-b border-slate-200/60 dark:border-slate-800/60 mb-0.5">
      <slot name="top" />
    </div>

    <!-- Row 1 -->
    <div class="flex justify-center gap-1 w-full">
      <button
        v-for="key in row1"
        :key="key"
        type="button"
        :disabled="disabled"
        @touchstart.prevent="handleKeyPress(key)"
        @mousedown.prevent="handleKeyPress(key)"
        class="flex-1 max-w-[38px] sm:max-w-[46px] rounded-lg font-bold text-lg sm:text-xl uppercase border transition-all duration-75 flex items-center justify-center cursor-pointer transform"
        :class="[
          keyBaseClass,
          keyHeightClass,
          activeKey === key ? '!scale-90 !bg-indigo-600 !text-white !ring-2 !ring-indigo-400 shadow-md' : ''
        ]"
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
        class="flex-1 max-w-[38px] sm:max-w-[46px] rounded-lg font-bold text-lg sm:text-xl uppercase border transition-all duration-75 flex items-center justify-center cursor-pointer transform"
        :class="[
          keyBaseClass,
          keyHeightClass,
          activeKey === key ? '!scale-90 !bg-indigo-600 !text-white !ring-2 !ring-indigo-400 shadow-md' : ''
        ]"
      >
        {{ key }}
      </button>
    </div>

    <!-- Row 3: Comma, Z X C V B N M, Backspace -->
    <div class="flex justify-between gap-1 w-full">
      <!-- Comma key (flush to the left edge, matching Q on Row 1) -->
      <button
        type="button"
        :disabled="disabled"
        @touchstart.prevent="handleKeyPress(',')"
        @mousedown.prevent="handleKeyPress(',')"
        class="flex-1.5 min-w-[50px] sm:min-w-[62px] rounded-lg font-bold text-lg sm:text-xl border transition-all duration-75 flex items-center justify-center cursor-pointer transform"
        :class="[
          keyBaseClass,
          keyHeightClass,
          activeKey === ',' ? '!scale-90 !bg-indigo-600 !text-white !ring-2 !ring-indigo-400 shadow-md' : ''
        ]"
        title="Comma"
      >
        ,
      </button>

      <button
        v-for="key in row3"
        :key="key"
        type="button"
        :disabled="disabled"
        @touchstart.prevent="handleKeyPress(key)"
        @mousedown.prevent="handleKeyPress(key)"
        class="flex-1 max-w-[38px] sm:max-w-[46px] rounded-lg font-bold text-lg sm:text-xl uppercase border transition-all duration-75 flex items-center justify-center cursor-pointer transform"
        :class="[
          keyBaseClass,
          keyHeightClass,
          activeKey === key ? '!scale-90 !bg-indigo-600 !text-white !ring-2 !ring-indigo-400 shadow-md' : ''
        ]"
      >
        {{ key }}
      </button>

      <!-- Backspace key (flush to the right edge, matching P on Row 1) -->
      <button
        type="button"
        :disabled="disabled"
        @touchstart.prevent="handleBackspace"
        @mousedown.prevent="handleBackspace"
        class="flex-1.5 min-w-[50px] sm:min-w-[62px] rounded-lg font-bold text-base sm:text-lg border transition-all duration-75 flex items-center justify-center cursor-pointer transform"
        :class="[
          backspaceClass,
          keyHeightClass,
          activeKey === 'backspace' ? '!scale-90 !bg-rose-600 !text-white !ring-2 !ring-rose-400 shadow-md' : ''
        ]"
        title="Backspace"
      >
        ⌫
      </button>
    </div>

    <!-- Row 4: Hyphen, Space bar & Enter/Submit -->
    <div class="flex justify-center gap-1.5 w-full px-1">
      <button
        type="button"
        :disabled="disabled"
        @touchstart.prevent="handleKeyPress('-')"
        @mousedown.prevent="handleKeyPress('-')"
        class="w-11 sm:w-14 rounded-lg font-bold text-xl border transition-all duration-75 flex items-center justify-center cursor-pointer transform"
        :class="[
          keyBaseClass,
          keyHeightClass,
          activeKey === '-' ? '!scale-90 !bg-indigo-600 !text-white !ring-2 !ring-indigo-400 shadow-md' : ''
        ]"
      >
        -
      </button>
      <button
        type="button"
        :disabled="disabled"
        @touchstart.prevent="handleKeyPress(' ')"
        @mousedown.prevent="handleKeyPress(' ')"
        class="flex-1 rounded-lg font-semibold text-xs sm:text-sm tracking-wider uppercase border transition-all duration-75 flex items-center justify-center cursor-pointer transform"
        :class="[
          keyBaseClass,
          keyHeightClass,
          activeKey === ' ' ? '!scale-90 !bg-indigo-600 !text-white !ring-2 !ring-indigo-400 shadow-md' : ''
        ]"
      >
        SPACE
      </button>
      <button
        v-if="showEnter"
        type="button"
        :disabled="disabled"
        @touchstart.prevent="handleEnter"
        @mousedown.prevent="handleEnter"
        class="w-20 sm:w-24 rounded-lg text-xs sm:text-sm tracking-wider uppercase border transition-all duration-75 flex items-center justify-center gap-1 cursor-pointer transform"
        :class="[
          enterClass,
          keyHeightClass,
          activeKey === 'enter' ? '!scale-90 !bg-indigo-700 !ring-2 !ring-indigo-400 shadow-lg' : ''
        ]"
      >
        <span>{{ enterLabel }}</span>
        <span class="text-sm font-normal">⏎</span>
      </button>
    </div>
  </div>
</template>
