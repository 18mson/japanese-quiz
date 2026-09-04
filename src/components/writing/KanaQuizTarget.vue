<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { createQuizHanziWriter, fetchCharacterData, preloadCharacterData } from '../../services/hanziWriterService';
import { useSettingsStore } from '../../stores/settingsStore';
import { RotateCcw, Loader2 } from '@lucide/vue';

const settingsStore = useSettingsStore();

const props = withDefaults(
  defineProps<{
    targetChar: string;
    romaji?: string;
    size?: number;
    showGrid?: boolean;
    leniency?: number;
    isFinished?: boolean;
  }>(),
  {
    size: 290,
    showGrid: true,
    leniency: 1.2,
    isFinished: false
  }
);

const emit = defineEmits<{
  (e: 'correct-stroke', data: { strokeNum: number; totalStrokes: number }): void;
  (e: 'mistake', data: { strokeNum: number }): void;
  (e: 'complete', data: { totalMistakes: number; character: string }): void;
  (e: 'fail-max-mistakes', data: { totalMistakes: number; character: string }): void;
  (e: 'ready', data: { totalStrokes: number }): void;
}>();

const isLoading = ref(true);
const consecutiveMistakes = ref(0);
const charMistakes = ref(0);
const totalQuestionMistakes = ref(0);
const isFailedMaxMistakes = ref(false);
const isEntireCombinationComplete = ref(false);

// Multi-character support for combination letters (e.g. ぎゃ -> ['ぎ', 'ゃ'])
const charList = computed(() => Array.from(props.targetChar || ''));
const isCombination = computed(() => charList.value.length > 1);

// Proportional sizing: Main box is 220px, small sub-character box is 148px (~67% of main box)
const mainBoxSize = computed(() => (isCombination.value ? 220 : props.size));
const smallBoxSize = computed(() => Math.max(148, Math.round(mainBoxSize.value * 0.67)));

const getBoxSize = (idx: number) => {
  if (!isCombination.value) return props.size;
  return idx === 0 ? mainBoxSize.value : smallBoxSize.value;
};

// Vertical centering offset for second character in combination:
// In raw font glyph data (kana-json), small kana (ゃ, ゅ, ょ, っ) sit ~300 units lower in the 1024 em-box,
// which causes them to sit near the bottom of the canvas with a huge empty gap on top.
// Shifting them up vertically aligns their center precisely with the canvas crosshairs (symmetrical top/bottom).
const secondCharVerticalOffset = computed(() => {
  if (!isCombination.value || charList.value.length < 2) return 0;
  const second = charList.value[1];
  if (['ゃ', 'ゅ', 'ょ', 'っ'].includes(second)) return -4;
  if (second === 'ュ') return -2;
  return 0;
});

// Theme-adaptive grid guide line colors (light & dark mode)
const gridOuterColor = computed(() => settingsStore.isDarkMode ? 'rgba(148, 163, 184, 0.12)' : 'rgba(100, 116, 139, 0.20)');
const gridMainColor = computed(() => settingsStore.isDarkMode ? 'rgba(148, 163, 184, 0.18)' : 'rgba(100, 116, 139, 0.28)');
const gridDiagColor = computed(() => settingsStore.isDarkMode ? 'rgba(148, 163, 184, 0.05)' : 'rgba(100, 116, 139, 0.12)');
const gridSmallColor = computed(() => settingsStore.isDarkMode ? 'rgba(148, 163, 184, 0.15)' : 'rgba(100, 116, 139, 0.25)');

const activeCharIndex = ref(0);
const boxContainerRefs = ref<HTMLElement[]>([]);
const setBoxRef = (el: any, idx: number) => {
  if (el) boxContainerRefs.value[idx] = el as HTMLElement;
};

// Tracking strokes per character
const strokeCountPerChar = ref<number[]>([1, 1]);
const currentStrokeInActiveChar = ref(0);
const completedCharStrokes = ref<number[]>([0, 0]);
const isOutlineVisibleList = ref<boolean[]>([false, false]);

// Unified Stroke Counter: Combined across all characters
const combinedTotalStrokes = computed(() => {
  if (!isCombination.value) return strokeCountPerChar.value[0] || 1;
  return (strokeCountPerChar.value[0] || 0) + (strokeCountPerChar.value[1] || 0);
});

const currentCombinedStrokes = computed(() => {
  if (!isCombination.value) return currentStrokeInActiveChar.value;
  if (activeCharIndex.value === 0) {
    return currentStrokeInActiveChar.value;
  } else {
    // Character 0 is fully completed + progress in character 1
    return (strokeCountPerChar.value[0] || 0) + currentStrokeInActiveChar.value;
  }
});

let writerInstances: any[] = [];
let pathObservers: MutationObserver[] = [];

/**
 * Bezier Curve Smoothing Helper: Converts sharp piecewise L segments into smooth quadratic bezier curves
 */
function smoothPathString(d: string): string {
  const parts = d.trim().split(/(?=[MLCZQ])/i);
  const points: { x: number; y: number }[] = [];

  for (const part of parts) {
    const type = part[0];
    const coords = part.slice(1).trim().split(/[\s,]+/).map(Number);
    if (type === 'M' || type === 'm') {
      if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
        points.push({ x: coords[0], y: coords[1] });
      }
    } else if (type === 'L' || type === 'l') {
      for (let i = 0; i < coords.length; i += 2) {
        if (!isNaN(coords[i]) && !isNaN(coords[i + 1])) {
          points.push({ x: coords[i], y: coords[i + 1] });
        }
      }
    }
  }

  if (points.length < 3) return d;

  let smoothed = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2;
    smoothed += ` Q ${p1.x} ${p1.y} ${midX} ${midY}`;
  }
  const last = points[points.length - 1];
  smoothed += ` L ${last.x} ${last.y}`;
  return smoothed;
}

const setupPathSmootherForContainer = (container: HTMLElement) => {
  const observer = new MutationObserver(() => {
    const paths = container.querySelectorAll('path');
    paths.forEach(path => {
      const d = path.getAttribute('d');
      if (d && !d.includes('Q') && d.includes('L')) {
        const smoothD = smoothPathString(d);
        if (smoothD !== d) {
          path.setAttribute('d', smoothD);
        }
      }
    });
  });

  observer.observe(container, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['d']
  });

  pathObservers.push(observer);
};

/**
 * Start quiz on character at index idx
 */
const startCharQuiz = (idx: number) => {
  const writer = writerInstances[idx];
  if (!writer) return;

  activeCharIndex.value = idx;
  charMistakes.value = 0;
  consecutiveMistakes.value = 0;
  currentStrokeInActiveChar.value = 0;

  writer.quiz({
    leniency: props.leniency,
    showHintAfterMisses: 3,
    acceptBackwardsStrokes: true,
    highlightOnComplete: true,
    onCorrectStroke: (strokeData: any) => {
      if (isFailedMaxMistakes.value) return;
      consecutiveMistakes.value = 0;
      charMistakes.value = 0;
      if (isOutlineVisibleList.value[idx]) {
        isOutlineVisibleList.value[idx] = false;
        try {
          writer.hideOutline({ duration: 300 });
        } catch (e) {}
      }
      const current = strokeData.strokeNum + 1;
      currentStrokeInActiveChar.value = current;

      emit('correct-stroke', {
        strokeNum: currentCombinedStrokes.value,
        totalStrokes: combinedTotalStrokes.value
      });
    },
    onMistake: (strokeData: any) => {
      if (isFailedMaxMistakes.value) return;
      charMistakes.value++;
      totalQuestionMistakes.value++;
      consecutiveMistakes.value++;
      const strokeNum = strokeData.strokeNum + 1;
      emit('mistake', { strokeNum });

      // 1. Setelah salah 3x berturut-turut pada karakter ini: tampilkan garis panduan bantuan
      if (consecutiveMistakes.value >= 3 && !isOutlineVisibleList.value[idx]) {
        isOutlineVisibleList.value[idx] = true;
        try {
          writer.showOutline({ duration: 400 });
        } catch (e) {
          try { writer.showOutline(); } catch (err) {}
        }
      }

      // 2. Jika salah 4x pada karakter ini: jawaban salah, tampilkan huruf asli di semua kotak
      if (charMistakes.value >= 4) {
        isFailedMaxMistakes.value = true;
        writerInstances.forEach(w => {
          try {
            w?.cancelQuiz();
            w?.showCharacter({ duration: 400 });
          } catch (e) {}
        });
        emit('fail-max-mistakes', {
          totalMistakes: totalQuestionMistakes.value,
          character: props.targetChar
        });
      }
    },
    onComplete: (_summary: any) => {
      if (isFailedMaxMistakes.value) return;

      completedCharStrokes.value[idx] = strokeCountPerChar.value[idx];
      currentStrokeInActiveChar.value = strokeCountPerChar.value[idx];

      if (idx < charList.value.length - 1) {
        // Otomatis berpindah fokus ke karakter kecil (Area Kecil) di kanan-bawah
        setTimeout(() => {
          startCharQuiz(idx + 1);
        }, 280);
      } else {
        // Seluruh kombinasi kana selesai digambar secara terpadu dalam 1 layar
        isEntireCombinationComplete.value = true;
        emit('complete', {
          totalMistakes: totalQuestionMistakes.value,
          character: props.targetChar
        });
      }
    }
  });
};

/**
 * Initialize all boxes for the target character (single large card OR unified combination card)
 */
const initWriterQuiz = async () => {
  isLoading.value = true;
  activeCharIndex.value = 0;
  charMistakes.value = 0;
  totalQuestionMistakes.value = 0;
  consecutiveMistakes.value = 0;
  isFailedMaxMistakes.value = false;
  isEntireCombinationComplete.value = false;
  isOutlineVisibleList.value = [false, false];
  completedCharStrokes.value = [0, 0];
  currentStrokeInActiveChar.value = 0;

  // Cleanup old writer instances and observers
  writerInstances.forEach(w => {
    try { w?.cancelQuiz(); } catch (e) {}
  });
  writerInstances = [];

  pathObservers.forEach(obs => obs.disconnect());
  pathObservers = [];

  // Preload character stroke & median data for all sub-characters
  await preloadCharacterData(props.targetChar);
  await nextTick();

  // Initialize HanziWriter for each character in charList
  for (let i = 0; i < charList.value.length; i++) {
    const ch = charList.value[i];
    const container = boxContainerRefs.value[i];
    if (!container) continue;

    container.innerHTML = '';

    const charData = await fetchCharacterData(ch).catch(() => null);
    const strokeCount = charData?.strokes?.length || 1;
    strokeCountPerChar.value[i] = strokeCount;

    const size = getBoxSize(i);
    // Area utama gets standard brush stroke, area kecil gets proportional thickness
    const drawingWidth = isCombination.value
      ? (i === 0 ? 56 : 48)
      : Math.max(68, Math.round(size * 0.26));

    // Optimasi ukuran & padding untuk huruf kedua di kombinasi (karakter Youon kecil):
    // Semua karakter kecil kana (ゃ, ゅ, ょ, ャ, ュ, ョ, dll.) pada data font aslinya hanya mengisi
    // sebagian kecil dari glyph box (500-670 unit). Dengan padding default (+14px), huruf kedua
    // terasa terlalu kecil dan menyisakan banyak area kosong yang belum terisi di kanvas.
    // Memberikan padding -10px untuk semua huruf kedua di kombinasi memperbesar skala
    // secara proporsional (~42%), memangkas ruang kosong, dan membuat tulisan lebih pas & nyaman.
    const isSecondCombinationChar = isCombination.value && i === 1;
    const padding = isSecondCombinationChar ? -10 : Math.round(size * 0.1);

    const isDark = settingsStore.isDarkMode;
    const strokeColor = isDark ? '#38bdf8' : '#0284c7';
    const drawingColor = isDark ? '#818cf8' : '#4f46e5';
    const highlightColor = isDark ? '#34d399' : '#059669';
    const outlineColor = isDark ? 'rgba(148, 163, 184, 0.28)' : 'rgba(100, 116, 139, 0.30)';

    const writer = createQuizHanziWriter(container, ch, size, {
      padding,
      showOutline: false,
      showCharacter: false,
      outlineColor,
      drawingWidth,
      strokeColor,
      drawingColor,
      highlightColor,
      renderer: 'svg',
      leniency: props.leniency
    });

    writerInstances[i] = writer;
    setupPathSmootherForContainer(container);
  }

  emit('ready', { totalStrokes: combinedTotalStrokes.value });
  isLoading.value = false;

  // Start quiz on Area Utama (character 0)
  startCharQuiz(0);
};

const restartQuiz = () => {
  initWriterQuiz();
};

watch(
  () => props.targetChar,
  async () => {
    await nextTick();
    initWriterQuiz();
  }
);

watch(
  () => settingsStore.isDarkMode,
  () => {
    initWriterQuiz();
  }
);

onMounted(() => {
  initWriterQuiz();
});

onUnmounted(() => {
  pathObservers.forEach(obs => obs.disconnect());
  pathObservers = [];
  writerInstances.forEach(w => {
    try { w?.cancelQuiz(); } catch (e) {}
  });
  writerInstances = [];
});

defineExpose({
  restartQuiz
});
</script>

<template>
  <div class="flex flex-col items-center gap-3 select-none w-full">
    <!-- Top Row: Romaji Clue & Unified Combined Stroke Counter -->
    <div class="flex items-center justify-between w-full max-w-sm px-2 text-xs">
      <span class="font-black text-slate-700 dark:text-slate-300 font-mono tracking-wider text-sm">
        {{ props.romaji || props.targetChar }}
      </span>

      <div class="flex items-center gap-2">
        <!-- Single Unified Checkmark: ONLY appears when BOTH characters are complete -->
        <span 
          v-if="isEntireCombinationComplete" 
          class="flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-md animate-scaleUp"
        >
          ✓ Selesai
        </span>

        <!-- Combined Stroke Counter: (e.g. Goresan: 0 / 9) -->
        <div 
          v-if="!isLoading && combinedTotalStrokes > 0"
          class="text-[11px] font-mono px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-xs"
        >
          Goresan: <strong :class="isEntireCombinationComplete ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-900 dark:text-white font-bold'">{{ currentCombinedStrokes }}</strong> / {{ combinedTotalStrokes }}
        </div>
      </div>
    </div>

    <!-- Main Canvas Card: 1 Unified Visual Surface for Genkouyoushi -->
    <div 
      class="relative rounded-3xl transition-all duration-300 bg-slate-50/90 dark:bg-slate-950 flex items-center justify-center p-2 sm:p-3.5 shadow-xs dark:shadow-md"
      :class="[
        isEntireCombinationComplete ? 'border-2 border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-emerald-950/20 dark:shadow-emerald-950/40' :
        'border-2 border-indigo-200 dark:border-indigo-500/70 ring-2 ring-indigo-500/10 dark:ring-indigo-500/20 shadow-indigo-950/10 dark:shadow-indigo-950/50'
      ]"
    >
      <!-- Single Character Mode (Centered large box) -->
      <template v-if="!isCombination">
        <div 
          class="relative rounded-2xl overflow-hidden flex items-center justify-center"
          :style="{ width: `${mainBoxSize}px`, height: `${mainBoxSize}px` }"
        >
          <!-- Grid Overlay -->
          <svg 
            v-if="showGrid" 
            class="absolute inset-0 w-full h-full pointer-events-none z-0" 
            :viewBox="`0 0 ${mainBoxSize} ${mainBoxSize}`"
          >
            <rect x="1" y="1" :width="mainBoxSize - 2" :height="mainBoxSize - 2" fill="none" :stroke="gridOuterColor" stroke-width="1.5" />
            <line x1="0" :y1="mainBoxSize / 2" :x2="mainBoxSize" :y2="mainBoxSize / 2" :stroke="gridMainColor" stroke-width="1" stroke-dasharray="4 4" />
            <line :x1="mainBoxSize / 2" y1="0" :x2="mainBoxSize" :y2="mainBoxSize" :stroke="gridMainColor" stroke-width="1" stroke-dasharray="4 4" />
            <line x1="0" y1="0" :x2="mainBoxSize" :y2="mainBoxSize" :stroke="gridDiagColor" stroke-width="1" />
            <line :x1="mainBoxSize" y1="0" x2="0" :y2="mainBoxSize" :stroke="gridDiagColor" stroke-width="1" />
          </svg>

          <!-- Target Surface -->
          <div 
            :ref="el => setBoxRef(el, 0)" 
            class="relative z-10 touch-none hw-surface cursor-crosshair"
            :style="{ width: `${mainBoxSize}px`, height: `${mainBoxSize}px` }"
          ></div>

          <!-- Outline Hint Active Badge -->
          <div 
            v-if="isOutlineVisibleList[0]"
            class="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 z-20 pointer-events-none shadow-xs animate-fadeIn"
          >
            💡 Bantuan
          </div>
        </div>
      </template>

      <!-- Combination Kana Mode (Unified surface with Overlapping Area Kecil in Bottom-Right) -->
      <template v-else>
        <div 
          class="relative select-none"
          :style="{ 
            width: `${mainBoxSize + 90}px`, 
            height: `${mainBoxSize}px` 
          }"
        >
          <!-- 1. Area Utama (Huruf Besar, e.g. ぎ) -->
          <div 
            class="absolute top-0 left-0 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-300"
            :class="activeCharIndex === 0 ? 'z-10' : 'z-0 pointer-events-none'"
            :style="{ width: `${mainBoxSize}px`, height: `${mainBoxSize}px` }"
          >
            <!-- Grid Overlay -->
            <svg 
              v-if="showGrid" 
              class="absolute inset-0 w-full h-full pointer-events-none z-0" 
              :viewBox="`0 0 ${mainBoxSize} ${mainBoxSize}`"
            >
              <rect x="1" y="1" :width="mainBoxSize - 2" :height="mainBoxSize - 2" fill="none" :stroke="gridOuterColor" stroke-width="1.5" />
              <line x1="0" :y1="mainBoxSize / 2" :x2="mainBoxSize" :y2="mainBoxSize / 2" :stroke="gridMainColor" stroke-width="1" stroke-dasharray="4 4" />
              <line :x1="mainBoxSize / 2" y1="0" :x2="mainBoxSize" :y2="mainBoxSize" :stroke="gridMainColor" stroke-width="1" stroke-dasharray="4 4" />
              <line x1="0" y1="0" :x2="mainBoxSize" :y2="mainBoxSize" :stroke="gridDiagColor" stroke-width="1" />
              <line :x1="mainBoxSize" y1="0" x2="0" :y2="mainBoxSize" :stroke="gridDiagColor" stroke-width="1" />
            </svg>

            <!-- Target Surface -->
            <div 
              :ref="el => setBoxRef(el, 0)" 
              class="relative z-10 touch-none hw-surface"
              :class="activeCharIndex === 0 ? 'cursor-crosshair' : 'pointer-events-none'"
              :style="{ width: `${mainBoxSize}px`, height: `${mainBoxSize}px` }"
            ></div>

            <!-- Outline Hint Active Badge -->
            <div 
              v-if="isOutlineVisibleList[0]"
              class="absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 z-20 pointer-events-none shadow-xs animate-fadeIn"
            >
              💡 Bantuan
            </div>
          </div>

          <!-- 2. Area Kecil (Huruf Youon Kecil, OVERLAPPING di Pojok Kanan-Bawah - Transparan & Terposisi Bawah) -->
          <div 
            class="absolute bottom-2 sm:bottom-3 right-0 rounded-2xl overflow-hidden transition-all duration-300 bg-transparent flex items-center justify-center shadow-none"
            :class="[
              activeCharIndex === 1 ? 'z-30 pointer-events-auto border border-dashed border-indigo-500/80 dark:border-slate-500/80 opacity-100' :
              completedCharStrokes[1] > 0 ? 'z-20 pointer-events-none border border-dashed border-slate-300 dark:border-slate-700/40 opacity-100' :
              'z-10 pointer-events-none border border-dashed border-slate-200 dark:border-slate-700/30 opacity-60'
            ]"
            :style="{ 
              width: `${smallBoxSize}px`, 
              height: `${smallBoxSize}px`, 
              background: 'transparent'
            }"
          >
            <!-- Grid Overlay for Area Kecil -->
            <svg 
              v-if="showGrid" 
              class="absolute inset-0 w-full h-full pointer-events-none z-0" 
              :viewBox="`0 0 ${smallBoxSize} ${smallBoxSize}`"
            >
              <line x1="0" :y1="smallBoxSize / 2" :x2="smallBoxSize" :y2="smallBoxSize / 2" :stroke="gridSmallColor" stroke-width="1" stroke-dasharray="3 3" />
              <line :x1="smallBoxSize / 2" y1="0" :x2="smallBoxSize" :y2="smallBoxSize / 2" :stroke="gridSmallColor" stroke-width="1" stroke-dasharray="3 3" />
            </svg>

            <!-- Target Surface for Area Kecil -->
            <div 
              :ref="el => setBoxRef(el, 1)" 
              class="relative z-10 touch-none hw-surface bg-transparent"
              :class="activeCharIndex === 1 ? 'cursor-crosshair' : 'pointer-events-none'"
              :style="{ 
                width: `${smallBoxSize}px`, 
                height: `${smallBoxSize}px`, 
                background: 'transparent',
                transform: `translateY(${secondCharVerticalOffset}px)`
              }"
            ></div>

            <!-- Outline Hint Active Badge -->
            <div 
              v-if="isOutlineVisibleList[1]"
              class="absolute top-1 left-1 text-[8px] font-bold px-1 py-0.5 rounded bg-amber-500/15 dark:bg-amber-500/20 border border-amber-500/30 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 z-20 pointer-events-none shadow-xs animate-fadeIn"
            >
              💡
            </div>
          </div>
        </div>
      </template>

      <!-- Loading State Overlay -->
      <div 
        v-if="isLoading" 
        class="absolute inset-0 bg-white/85 dark:bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-40 rounded-3xl"
      >
        <Loader2 class="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <span class="text-xs font-bold text-slate-600 dark:text-slate-400">Menyiapkan huruf...</span>
      </div>
    </div>

    <!-- Failed Max Mistakes Banner -->
    <div 
      v-if="isFailedMaxMistakes"
      class="text-[11px] font-bold px-3 py-1 rounded-lg bg-rose-500/15 dark:bg-rose-500/20 border border-rose-500/30 dark:border-rose-500/40 text-rose-700 dark:text-rose-300 shadow-xs animate-fadeIn flex items-center gap-1.5"
    >
      <span>❌ 4x salah - Huruf ini salah</span>
    </div>

    <!-- Action Toolbar (Resets Both Instances simultaneously - only visible during writing) -->
    <div 
      v-if="!isFinished && !isFailedMaxMistakes && !isEntireCombinationComplete" 
      class="flex items-center justify-center gap-3 w-full max-w-sm pt-1"
    >
      <button
        type="button"
        @click="restartQuiz"
        :disabled="isLoading"
        class="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-700/90 text-slate-700 dark:text-slate-300 disabled:opacity-40 font-bold text-xs border border-slate-200 dark:border-slate-700 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-98"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span>Ulangi Gambar</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.hw-surface :deep(svg),
.hw-surface :deep(canvas) {
  touch-action: none;
  user-select: none;
  -webkit-user-select: none;
  shape-rendering: geometricPrecision;
  background: transparent !important;
  background-color: transparent !important;
}

.hw-surface :deep(rect) {
  fill: none !important;
}

.hw-surface :deep(path) {
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
  shape-rendering: geometricPrecision;
}
</style>
