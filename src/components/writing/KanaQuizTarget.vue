<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { createQuizHanziWriter, preloadCharacterData } from '../../services/hanziWriterService';
import { RotateCcw, Loader2 } from '@lucide/vue';

const props = withDefaults(
  defineProps<{
    targetChar: string;
    size?: number;
    showGrid?: boolean;
    leniency?: number;
  }>(),
  {
    size: 300,
    showGrid: true,
    leniency: 1.2
  }
);

const emit = defineEmits<{
  (e: 'correct-stroke', data: { strokeNum: number; totalStrokes: number }): void;
  (e: 'mistake', data: { strokeNum: number }): void;
  (e: 'complete', data: { totalMistakes: number; character: string }): void;
  (e: 'fail-max-mistakes', data: { totalMistakes: number; character: string }): void;
  (e: 'ready', data: { totalStrokes: number }): void;
}>();

const targetContainerRef = ref<HTMLDivElement | null>(null);
const isLoading = ref(true);
const currentStrokeProgress = ref({ current: 0, total: 1 });
const consecutiveMistakes = ref(0);
const totalMistakes = ref(0);
const isOutlineVisible = ref(false);
const isFailedMaxMistakes = ref(false);
let writerInstance: any = null;

// Multi-character support for combination letters (e.g., きゃ -> ['き', 'ゃ'])
const charList = computed(() => Array.from(props.targetChar || ''));
const activeCharIndex = ref(0);
const activeChar = computed(() => charList.value[activeCharIndex.value] || props.targetChar);

const initSingleCharQuiz = async () => {
  if (!targetContainerRef.value || !activeChar.value) return;
  isLoading.value = true;
  consecutiveMistakes.value = 0;
  isOutlineVisible.value = false;

  // Cleanup old instance if present
  if (writerInstance) {
    try {
      writerInstance.cancelQuiz();
    } catch (e) {
      // ignore
    }
    writerInstance = null;
  }
  targetContainerRef.value.innerHTML = '';

  // Preload character stroke & median data for active character
  await preloadCharacterData(activeChar.value);

  // Mount HanziWriter to target container (Garis panduan dihilangkan di awal)
  writerInstance = createQuizHanziWriter(targetContainerRef.value, activeChar.value, props.size, {
    showOutline: false,
    showCharacter: false,
    outlineColor: 'rgba(148, 163, 184, 0.28)',
    drawingWidth: Math.max(68, Math.round(props.size * 0.26)), // Bold brush stroke matching Japanese font thickness
    strokeColor: '#38bdf8', // Blue sky confirmed
    drawingColor: '#818cf8', // Indigo drawing in progress
    highlightColor: '#34d399', // Emerald flash
    renderer: 'svg',
    leniency: props.leniency
  });

  setupPathSmoother();

  // Start HanziWriter quiz with real-time callbacks
  writerInstance.quiz({
    leniency: props.leniency,
    showHintAfterMisses: 3,
    acceptBackwardsStrokes: true,
    highlightOnComplete: true,
    onCorrectStroke: (strokeData: any) => {
      if (isFailedMaxMistakes.value) return;
      // Goresan benar me-reset counter salah berturut-turut
      consecutiveMistakes.value = 0;
      const current = strokeData.strokeNum + 1;
      const total = strokeData.strokeNum + strokeData.strokesRemaining + 1;
      currentStrokeProgress.value = { current, total };
      emit('correct-stroke', { strokeNum: current, totalStrokes: total });
    },
    onMistake: (strokeData: any) => {
      if (isFailedMaxMistakes.value) return;
      totalMistakes.value++;
      consecutiveMistakes.value++;
      const strokeNum = strokeData.strokeNum + 1;
      emit('mistake', { strokeNum });

      // 1. Setelah salah 3x berturut-turut: munculkan garis panduan
      if (consecutiveMistakes.value >= 3 && !isOutlineVisible.value) {
        isOutlineVisible.value = true;
        if (writerInstance) {
          try {
            writerInstance.showOutline({ duration: 400 });
          } catch (e) {
            try { writerInstance.showOutline(); } catch (err) {}
          }
        }
      }

      // 2. Jika salah 5x: jawaban salah, tampilkan huruf asli & kunci
      if (totalMistakes.value >= 5) {
        isFailedMaxMistakes.value = true;
        if (writerInstance) {
          try {
            writerInstance.cancelQuiz();
            writerInstance.showCharacter({ duration: 400 });
          } catch (e) {}
        }
        emit('fail-max-mistakes', {
          totalMistakes: totalMistakes.value,
          character: props.targetChar
        });
      }
    },
    onComplete: (_summary: any) => {
      if (isFailedMaxMistakes.value) return;

      // Jika masih ada karakter berikutnya dalam kombinasi (misal 'ゃ' setelah 'き' di 'きゃ')
      if (activeCharIndex.value < charList.value.length - 1) {
        setTimeout(() => {
          activeCharIndex.value++;
          initSingleCharQuiz();
        }, 320);
      } else {
        // Semua karakter gabungan selesai ditulis
        emit('complete', {
          totalMistakes: totalMistakes.value,
          character: props.targetChar
        });
      }
    }
  });

  // Query character stroke count
  if (writerInstance._character?.strokes) {
    const count = writerInstance._character.strokes.length;
    currentStrokeProgress.value = { current: 0, total: count };
    emit('ready', { totalStrokes: count });
  }

  isLoading.value = false;
};

const initWriterQuiz = async () => {
  activeCharIndex.value = 0;
  totalMistakes.value = 0;
  isFailedMaxMistakes.value = false;
  await initSingleCharQuiz();
};

/**
 * Restart current character quiz
 */
const restartQuiz = () => {
  activeCharIndex.value = 0;
  consecutiveMistakes.value = 0;
  totalMistakes.value = 0;
  isOutlineVisible.value = false;
  isFailedMaxMistakes.value = false;
  initSingleCharQuiz();
};

watch(
  () => props.targetChar,
  async () => {
    await nextTick();
    initWriterQuiz();
  }
);

onMounted(async () => {
  await nextTick();
  initWriterQuiz();
});

let pathObserver: MutationObserver | null = null;
let isSmoothing = false;

/**
 * Converts jagged polyline path into a smooth quadratic Bezier curve
 */
function smoothSvgPath(d: string): string {
  if (!d || !d.includes(' L ')) return d;
  const parts = d.trim().split(/\s*L\s*/);
  const mPart = parts[0].replace(/^M\s*/, '');
  const [startX, startY] = mPart.split(/\s+/).map(Number);
  if (isNaN(startX) || isNaN(startY)) return d;

  const points: { x: number; y: number }[] = [{ x: startX, y: startY }];
  for (let i = 1; i < parts.length; i++) {
    const coords = parts[i].trim().split(/\s+/).map(Number);
    if (coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])) {
      points.push({ x: coords[0], y: coords[1] });
    }
  }

  if (points.length < 3) return d;

  let out = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length - 1; i++) {
    const midX = (points[i].x + points[i + 1].x) / 2;
    const midY = (points[i].y + points[i + 1].y) / 2;
    out += ` Q ${points[i].x} ${points[i].y}, ${midX} ${midY}`;
  }
  out += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;
  return out;
}

/**
 * Observes user stroke path in HanziWriter SVG and applies Bezier curve smoothing
 */
const setupPathSmoother = () => {
  if (pathObserver) {
    pathObserver.disconnect();
    pathObserver = null;
  }
  if (!targetContainerRef.value) return;

  pathObserver = new MutationObserver((mutations) => {
    if (isSmoothing) return;
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'd') {
        const target = mutation.target as SVGPathElement;
        const d = target.getAttribute('d');
        if (d && d.includes(' L ') && !d.includes(' Q ')) {
          const smoothed = smoothSvgPath(d);
          if (smoothed !== d) {
            isSmoothing = true;
            target.setAttribute('d', smoothed);
            isSmoothing = false;
          }
        }
      }
    }
  });

  pathObserver.observe(targetContainerRef.value, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['d']
  });
};

onUnmounted(() => {
  if (pathObserver) {
    pathObserver.disconnect();
    pathObserver = null;
  }
  if (writerInstance) {
    try {
      writerInstance.cancelQuiz();
    } catch (e) {
      // ignore
    }
    writerInstance = null;
  }
});

const KANA_TO_ROMAJI: Record<string, string> = {
  // Hiragana
  'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
  'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
  'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
  'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
  'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
  'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
  'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
  'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
  'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
  'わ': 'wa', 'を': 'wo', 'ん': 'n',
  'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
  'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
  'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
  'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
  'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
  'ゃ': 'ya', 'ゅ': 'yu', 'ょ': 'yo', 'っ': 'tsu',
  'ぁ': 'a', 'ぃ': 'i', 'ぅ': 'u', 'ぇ': 'e', 'ぉ': 'o',

  // Katakana
  'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
  'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
  'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
  'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
  'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
  'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
  'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
  'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
  'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
  'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n',
  'ガ': 'ga', 'ギ': 'gi', 'グ': 'gu', 'ゲ': 'ge', 'ゴ': 'go',
  'ザ': 'za', 'ジ': 'ji', 'ズ': 'zu', 'ゼ': 'ze', 'ゾ': 'zo',
  'ダ': 'da', 'ヂ': 'ji', 'ヅ': 'zu', 'デ': 'de', 'ド': 'do',
  'バ': 'ba', 'ビ': 'bi', 'ブ': 'bu', 'ベ': 'be', 'ボ': 'bo',
  'パ': 'pa', 'ピ': 'pi', 'プ': 'pu', 'ペ': 'pe', 'ポ': 'po',
  'ャ': 'ya', 'ュ': 'yu', 'ョ': 'yo', 'ッ': 'tsu',
  'ァ': 'a', 'ィ': 'i', 'ゥ': 'u', 'ェ': 'e', 'ォ': 'o'
};

const getKanaRomaji = (char: string): string => {
  return KANA_TO_ROMAJI[char] || char;
};

defineExpose({
  restartQuiz
});
</script>

<template>
  <div class="flex flex-col items-center gap-3 select-none">
    <!-- Multi-Character Combination Indicator in Romaji (e.g. Bagian ni, Bagian yu) -->
    <div 
      v-if="charList.length > 1" 
      class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shadow-xs animate-fadeIn"
    >
      <div class="flex items-center gap-2">
        <span 
          v-for="(ch, idx) in charList" 
          :key="idx"
          :class="[
            'px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all font-mono',
            idx === activeCharIndex ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/50 ring-1 ring-indigo-400' :
            idx < activeCharIndex ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
            'bg-slate-800/80 text-slate-500'
          ]"
        >
          <span>Bagian {{ getKanaRomaji(ch) }}</span>
          <span v-if="idx < activeCharIndex" class="text-[11px] font-sans">✓</span>
        </span>
      </div>
    </div>

    <!-- Drawing Stage Card -->
    <div 
      class="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700/80 bg-slate-950 flex items-center justify-center p-1"
      :style="{ width: `${size + 8}px`, height: `${size + 8}px` }"
    >
      <!-- Practice Kanji/Kana Grid Overlay (T-Grid with dashed cross lines) -->
      <svg 
        v-if="showGrid" 
        class="absolute inset-1 w-full h-full pointer-events-none z-0" 
        :viewBox="`0 0 ${size} ${size}`"
      >
        <!-- Outer border -->
        <rect x="1" y="1" :width="size - 2" :height="size - 2" fill="none" stroke="rgba(148, 163, 184, 0.12)" stroke-width="1.5" />
        <!-- Horizontal dashed center -->
        <line x1="0" :y1="size / 2" :x2="size" :y2="size / 2" stroke="rgba(148, 163, 184, 0.18)" stroke-width="1" stroke-dasharray="5 5" />
        <!-- Vertical dashed center -->
        <line :x1="size / 2" y1="0" :x2="size / 2" :y2="size" stroke="rgba(148, 163, 184, 0.18)" stroke-width="1" stroke-dasharray="5 5" />
        <!-- Diagonals -->
        <line x1="0" y1="0" :x2="size" :y2="size" stroke="rgba(148, 163, 184, 0.06)" stroke-width="1" />
        <line :x1="size" y1="0" x2="0" :y2="size" stroke="rgba(148, 163, 184, 0.06)" stroke-width="1" />
      </svg>

      <!-- HanziWriter Target DOM (Direct Vector & Pointer Surface) -->
      <div 
        ref="targetContainerRef" 
        class="relative z-10 touch-none cursor-crosshair hw-surface"
        :style="{ width: `${size}px`, height: `${size}px` }"
      ></div>

      <!-- Loading State Overlay -->
      <div 
        v-if="isLoading" 
        class="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-2 z-20"
      >
        <Loader2 class="w-6 h-6 text-indigo-400 animate-spin" />
        <span class="text-[11px] font-bold text-slate-400">Menyiapkan huruf...</span>
      </div>

      <!-- Badges: Failed after 5 mistakes or Outline Active after 3 consecutive mistakes -->
      <div 
        v-if="isFailedMaxMistakes"
        class="absolute top-2.5 left-3 text-[10px] font-bold px-2.5 py-1 rounded-md bg-rose-500/25 border border-rose-500/50 text-rose-300 z-20 pointer-events-none shadow-xs animate-fadeIn flex items-center gap-1"
      >
        <span>❌ 5x salah - Huruf ini salah</span>
      </div>
      <div 
        v-else-if="isOutlineVisible"
        class="absolute top-2.5 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-300 z-20 pointer-events-none shadow-xs animate-fadeIn flex items-center gap-1"
      >
        <span>💡 Garis bantuan aktif (3x salah)</span>
      </div>

      <!-- Stroke Counter Pill -->
      <div 
        v-if="!isLoading && currentStrokeProgress.total > 0"
        class="absolute bottom-2.5 right-3 text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-900/80 border border-slate-800 text-slate-400 z-20 pointer-events-none shadow-xs"
      >
        Goresan: <strong class="text-white">{{ currentStrokeProgress.current }}</strong> / {{ currentStrokeProgress.total }}
      </div>
    </div>

    <!-- Action Toolbar -->
    <div class="flex items-center justify-between gap-3 w-full max-w-[310px] pt-1">
      <button
        type="button"
        @click="restartQuiz"
        :disabled="isLoading"
        class="w-full py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 disabled:opacity-40 font-bold text-xs border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs active:scale-98"
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
}

.hw-surface :deep(path) {
  stroke-linecap: round !important;
  stroke-linejoin: round !important;
  shape-rendering: geometricPrecision;
}
</style>
