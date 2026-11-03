<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useSettingsStore, type KeyboardHeight } from '../stores/settingsStore';
import { generateScrambleTiles, type ScrambleResult, type ScrambleTile } from '../utils/scrambleGenerator';

const props = withDefaults(defineProps<{
  theme?: 'light' | 'dark' | 'auto';
  disabled?: boolean;
  showEnter?: boolean;
  enterLabel?: string;
  enableSound?: boolean;
  keyboardHeight?: KeyboardHeight;
  // Scramble mode props
  inputMode?: 'qwerty' | 'scramble';
  enableScramble?: boolean;
  targetAnswer?: string;
  scrambleMode?: 'romaji' | 'kana' | 'meaning';
}>(), {
  theme: 'auto',
  disabled: false,
  showEnter: true,
  enterLabel: 'SUBMIT',
  enableSound: true,
  inputMode: 'qwerty',
  enableScramble: false,
  targetAnswer: '',
  scrambleMode: 'romaji',
});

const emit = defineEmits<{
  (e: 'key', char: string): void;
  (e: 'backspace'): void;
  (e: 'enter'): void;
  (e: 'append', payload: { text: string; isMultiWord: boolean }): void;
  (e: 'undoChunk', payload: { text: string; isMultiWord: boolean }): void;
  (e: 'clear'): void;
  (e: 'update:inputMode', mode: 'qwerty' | 'scramble'): void;
}>();

const settingsStore = useSettingsStore();

// Scramble state
const scrambleData = ref<ScrambleResult | null>(null);
const selectedTiles = ref<string[]>([]); // stack of selected tile IDs

function initScramble() {
  if (!props.targetAnswer) {
    scrambleData.value = null;
    selectedTiles.value = [];
    return;
  }
  scrambleData.value = generateScrambleTiles(props.targetAnswer, props.scrambleMode);
  selectedTiles.value = [];
}

watch(() => props.targetAnswer, () => {
  initScramble();
}, { immediate: true });

const activeTileId = ref<string | null>(null);
let activeTileTimer: ReturnType<typeof setTimeout> | null = null;

function triggerTileVisualEffect(tileId: string) {
  activeTileId.value = tileId;
  if (activeTileTimer) clearTimeout(activeTileTimer);
  activeTileTimer = setTimeout(() => {
    activeTileId.value = null;
  }, 120);
}

function handleTileClick(tile: ScrambleTile) {
  if (props.disabled || selectedTiles.value.includes(tile.id)) return;
  triggerTileVisualEffect(tile.id);
  playClickSound();
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(10); } catch {}
  }
  selectedTiles.value.push(tile.id);
  emit('append', { 
    text: tile.text, 
    isMultiWord: scrambleData.value?.isMultiWord ?? false 
  });
}

function handleScrambleBackspace() {
  if (props.disabled) return;
  playClickSound();
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate(12); } catch {}
  }
  if (selectedTiles.value.length === 0) {
    emit('backspace');
    return;
  }
  const lastId = selectedTiles.value.pop();
  const lastTile = scrambleData.value?.tiles.find(t => t.id === lastId);
  emit('undoChunk', { 
    text: lastTile?.text || '', 
    isMultiWord: scrambleData.value?.isMultiWord ?? false 
  });
}

function handleScrambleReset() {
  if (props.disabled) return;
  playClickSound();
  selectedTiles.value = [];
  emit('clear');
}

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
  ? 'bg-slate-950/98 backdrop-blur-xl border-t border-slate-800/90 text-slate-100 shadow-2xl'
  : 'bg-white/98 backdrop-blur-xl border-t border-slate-200/90 text-slate-900 shadow-[0_-8px_30px_rgba(0,0,0,0.12)]'
);

const keyBaseClass = computed(() => isDark.value
  ? 'bg-slate-900/90 hover:bg-slate-800/90 text-slate-100 border-slate-800/70 active:bg-torii active:text-white active:scale-90 active:shadow-[0_0_12px_rgba(224,90,71,0.6)]'
  : 'bg-slate-100 hover:bg-slate-200/80 text-slate-800 border-slate-200/80 active:bg-indigo-600 active:text-white active:scale-90 active:shadow-[0_0_12px_rgba(79,70,229,0.5)] shadow-xs'
);

const backspaceClass = computed(() => isDark.value
  ? 'bg-slate-900/90 hover:bg-torii/20 text-torii-light border-torii/30 active:bg-torii active:text-white active:scale-90 active:shadow-[0_0_12px_rgba(224,90,71,0.6)]'
  : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border-rose-200 active:bg-rose-600 active:text-white active:scale-90 active:shadow-[0_0_12px_rgba(225,29,72,0.5)] shadow-xs'
);

const enterClass = computed(() => isDark.value
  ? 'bg-torii hover:bg-torii-hover text-white border-torii/50 active:bg-torii-600 active:scale-90 shadow-md shadow-torii/30 font-bold'
  : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 active:bg-indigo-800 active:scale-90 shadow-md shadow-indigo-600/20 font-bold'
);

const activeKeyClass = computed(() => isDark.value
  ? '!scale-90 !bg-torii !text-white !ring-2 !ring-torii-light shadow-md'
  : '!scale-90 !bg-indigo-600 !text-white !ring-2 !ring-indigo-400 shadow-md'
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

    <!-- Scramble Mode: Tile Bubbles & Action Buttons -->
    <template v-if="inputMode === 'scramble' && enableScramble">
      <div class="w-full flex flex-col gap-2.5 py-1 px-1">
        <!-- Tile Bubbles Container -->
        <div class="w-full flex flex-wrap justify-center items-center content-center gap-2.5 sm:gap-3 min-h-[150px] sm:min-h-[175px] p-3 bg-slate-100/70 dark:bg-slate-900/70 rounded-2xl border border-slate-200/70 dark:border-slate-800/70">
          <button
            v-for="tile in scrambleData?.tiles || []"
            :key="tile.id"
            type="button"
            :disabled="disabled || selectedTiles.includes(tile.id)"
            @touchstart.prevent="handleTileClick(tile)"
            @mousedown.prevent="handleTileClick(tile)"
            class="relative box-border min-h-[52px] min-w-[52px] px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl font-black border-2 transition-all duration-100 transform flex items-center justify-center cursor-pointer select-none shadow-xs touch-manipulation"
            :class="[
              tile.text.length <= 2 
                ? 'text-2xl sm:text-3xl' 
                : (tile.text.length <= 5 ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'),
              selectedTiles.includes(tile.id)
                ? 'opacity-20 scale-90 border-dashed bg-slate-200 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700 pointer-events-none'
                : (activeTileId === tile.id
                  ? (isDark ? '!scale-90 !bg-torii !text-white !border-torii-light' : '!scale-90 !bg-indigo-600 !text-white !border-indigo-400')
                  : (isDark 
                    ? 'bg-slate-900 hover:bg-slate-800 text-slate-100 border-slate-700 active:scale-95 active:bg-torii' 
                    : 'bg-white hover:bg-slate-50 text-slate-900 border-slate-300 active:scale-95 active:bg-indigo-600 active:text-white'))
            ]"
          >
            <!-- Hit-area expansion: pastikan area sentuh hingga batas border & 4px keluar tetap clickable -->
            <span class="absolute -inset-1 rounded-2xl pointer-events-none" aria-hidden="true"></span>
            <span class="pointer-events-none select-none" :class="{'font-jp': scrambleMode === 'kana'}">{{ tile.text }}</span>
          </button>
        </div>

        <!-- Scramble Action Row (Reset, Backspace, Submit) -->
        <div class="flex items-center justify-between gap-2.5 w-full pt-1">
          <!-- Reset Button -->
          <button
            type="button"
            :disabled="disabled || selectedTiles.length === 0"
            @touchstart.prevent="handleScrambleReset"
            @mousedown.prevent="handleScrambleReset"
            class="h-12 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-1.5 border cursor-pointer select-none active:scale-95 touch-manipulation"
            :class="selectedTiles.length === 0
              ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'
              : (isDark
                ? 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300')"
          >
            <span>↺ Reset</span>
          </button>

          <!-- Backspace Button -->
          <button
            type="button"
            :disabled="disabled || selectedTiles.length === 0"
            @touchstart.prevent="handleScrambleBackspace"
            @mousedown.prevent="handleScrambleBackspace"
            class="h-12 flex-1 px-4 rounded-xl text-xs sm:text-sm font-bold transition flex items-center justify-center gap-1.5 border cursor-pointer select-none active:scale-95 touch-manipulation"
            :class="selectedTiles.length === 0
              ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800'
              : backspaceClass"
          >
            <span>⌫ Hapus Kata</span>
          </button>

          <!-- Submit Button -->
          <button
            type="button"
            :disabled="disabled"
            @touchstart.prevent="handleEnter"
            @mousedown.prevent="handleEnter"
            class="h-12 px-6 rounded-xl text-xs sm:text-sm font-bold tracking-wider uppercase border transition-all duration-75 flex items-center justify-center gap-1.5 cursor-pointer transform select-none active:scale-95 touch-manipulation"
            :class="enterClass"
          >
            <span>{{ enterLabel }}</span>
            <span class="text-sm font-normal">⏎</span>
          </button>
        </div>
      </div>
    </template>

    <!-- Standard QWERTY Keyboard Layout -->
    <template v-else>
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
            activeKey === key ? activeKeyClass : ''
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
            activeKey === key ? activeKeyClass : ''
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
            activeKey === ',' ? activeKeyClass : ''
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
            activeKey === key ? activeKeyClass : ''
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
            activeKey === 'backspace' ? '!scale-90 !bg-torii !text-white !ring-2 !ring-torii-light shadow-md' : ''
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
            activeKey === '-' ? activeKeyClass : ''
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
            activeKey === ' ' ? activeKeyClass : ''
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
            activeKey === 'enter' ? (isDark ? '!scale-90 !bg-torii-600 !ring-2 !ring-torii-light shadow-lg' : '!scale-90 !bg-indigo-700 !ring-2 !ring-indigo-400 shadow-lg') : ''
          ]"
        >
          <span>{{ enterLabel }}</span>
          <span class="text-sm font-normal">⏎</span>
        </button>
      </div>
    </template>
  </div>
</template>
