<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { createQuizHanziWriter, preloadCharacterData } from '../../services/hanziWriterService';
import { RotateCcw, Check, Sparkles } from '@lucide/vue';

interface Point {
  x: number;
  y: number;
  time: number;
}

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
    leniency: 1.3
  }
);

const emit = defineEmits<{
  (e: 'graded', result: { accuracy: number; passed: boolean; totalMistakes: number }): void;
  (e: 'stroke-drawn', data: { strokeCount: number }): void;
  (e: 'clear'): void;
}>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const hwContainerRef = ref<HTMLDivElement | null>(null);

let ctx: CanvasRenderingContext2D | null = null;
let hwInstance: any = null;

// Drawing state
let isDrawing = false;
let activePointerId: number | null = null;
let currentStrokePoints: Point[] = [];
let lastLineWidth = 4;
let userStrokesCount = ref(0);
let totalMistakes = ref(0);
let totalTargetStrokes = ref(1);
let completedStrokes = ref(0);
let isCharacterComplete = ref(false);
let isSubmitting = ref(false);
let autoSubmitTimer: any = null;

// Stroke visual history for canvas redraws
interface SavedStroke {
  points: Point[];
  widths: number[];
}
const drawnStrokes: SavedStroke[] = [];

/**
 * Setup high-DPI canvas
 */
const setupCanvas = () => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = props.size * dpr;
  canvas.height = props.size * dpr;
  canvas.style.width = `${props.size}px`;
  canvas.style.height = `${props.size}px`;

  ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.scale(dpr, dpr);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    drawBackgroundGrid();
  }
};

/**
 * Draw classic Japanese calligraphy practice grid (t-grid with dashed guide lines)
 */
const drawBackgroundGrid = () => {
  if (!ctx || !props.showGrid) return;
  const s = props.size;

  ctx.save();
  ctx.clearRect(0, 0, s, s);

  // Outer border guide
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(1, 1, s - 2, s - 2);

  // Center cross lines (dashed)
  ctx.setLineDash([4, 4]);
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
  ctx.lineWidth = 1;

  // Horizontal center
  ctx.beginPath();
  ctx.moveTo(0, s / 2);
  ctx.lineTo(s, s / 2);
  ctx.stroke();

  // Vertical center
  ctx.beginPath();
  ctx.moveTo(s / 2, 0);
  ctx.lineTo(s / 2, s);
  ctx.stroke();

  // Diagonals (very subtle)
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.08)';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(s, s);
  ctx.moveTo(s, 0);
  ctx.lineTo(0, s);
  ctx.stroke();

  ctx.restore();
};

/**
 * Redraw all saved strokes on top of the grid
 */
const redrawCanvas = () => {
  if (!ctx) return;
  drawBackgroundGrid();

  for (const stroke of drawnStrokes) {
    drawSmoothStroke(stroke.points, stroke.widths);
  }
};

/**
 * Calculate dynamic line width based on velocity between points
 */
const getDynamicLineWidth = (p1: Point, p2: Point, currentWidth: number): number => {
  const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
  const time = Math.max(1, p2.time - p1.time);
  const velocity = dist / time; // px per ms

  // Velocity clamp: 0.1 (slow) -> 2.5 (fast)
  // Slow = thicker line (max ~5.5px), Fast = thinner line (min ~2px)
  const minWidth = 2.0;
  const maxWidth = 5.5;
  const targetWidth = Math.max(minWidth, Math.min(maxWidth, maxWidth - velocity * 1.8));

  // Exponential smoothing to avoid sudden jumps
  return currentWidth * 0.65 + targetWidth * 0.35;
};

/**
 * Draw a smooth bezier stroke from a list of points and widths
 */
const drawSmoothStroke = (points: Point[], widths: number[]) => {
  if (!ctx || points.length === 0) return;

  ctx.save();
  ctx.strokeStyle = '#38bdf8'; // Sky blue calligraphy ink

  if (points.length === 1) {
    ctx.beginPath();
    ctx.arc(points[0].x, points[0].y, (widths[0] || 4) / 2, 0, Math.PI * 2);
    ctx.fillStyle = '#38bdf8';
    ctx.fill();
    ctx.restore();
    return;
  }

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = points[i];
    const p2 = points[i + 1];
    const w = widths[i] || 4;

    ctx.beginPath();
    ctx.lineWidth = w;

    if (i === 0) {
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    } else {
      const prev = points[i - 1];
      const mid1X = (prev.x + p1.x) / 2;
      const mid1Y = (prev.y + p1.y) / 2;
      const mid2X = (p1.x + p2.x) / 2;
      const mid2Y = (p1.y + p2.y) / 2;

      ctx.moveTo(mid1X, mid1Y);
      ctx.quadraticCurveTo(p1.x, p1.y, mid2X, mid2Y);
    }
    ctx.stroke();
  }

  ctx.restore();
};

/**
 * Convert client coordinate to local canvas coordinate
 */
const getCanvasCoords = (e: PointerEvent): { x: number; y: number } => {
  const canvas = canvasRef.value;
  if (!canvas) return { x: 0, y: 0 };
  const rect = canvas.getBoundingClientRect();
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top
  };
};

/**
 * Initialize HanziWriter quiz in background
 */
const initHanziWriterQuiz = async () => {
  if (!hwContainerRef.value || !props.targetChar) return;

  // Clear previous instance
  if (hwInstance) {
    try {
      hwInstance.cancelQuiz();
    } catch (e) {
      // ignore
    }
    hwInstance = null;
  }
  hwContainerRef.value.innerHTML = '';

  // Preload data
  await preloadCharacterData(props.targetChar);

  // Initialize HanziWriter container
  hwInstance = createQuizHanziWriter(hwContainerRef.value, props.targetChar, props.size, {
    showOutline: false,
    showCharacter: false,
    renderer: 'canvas',
    leniency: props.leniency
  });

  // Start HanziWriter quiz
  hwInstance.quiz({
    leniency: props.leniency,
    showHintAfterMisses: false,
    acceptBackwardsStrokes: true,
    highlightOnComplete: false,
    onMistake: (_strokeData: any) => {
      totalMistakes.value++;
    },
    onCorrectStroke: (strokeData: any) => {
      completedStrokes.value = strokeData.strokeNum + 1;
      totalTargetStrokes.value = strokeData.strokeNum + strokeData.strokesRemaining + 1;
    },
    onComplete: (summary: any) => {
      isCharacterComplete.value = true;
      submitEvaluation(summary.totalMistakes);
    }
  });
};

/**
 * Pointer Down Event Handler
 */
const onPointerDown = (e: PointerEvent) => {
  if (isCharacterComplete.value || isSubmitting.value) return;

  const canvas = canvasRef.value;
  if (!canvas) return;

  // Capture pointer to track gestures even when dragging outside canvas boundaries
  try {
    canvas.setPointerCapture(e.pointerId);
  } catch (err) {
    // fallback
  }

  isDrawing = true;
  activePointerId = e.pointerId;
  const coords = getCanvasCoords(e);
  const now = performance.now();

  currentStrokePoints = [{ x: coords.x, y: coords.y, time: now }];
  lastLineWidth = 4;

  // Notify HanziWriter quiz of user stroke start
  if (hwInstance?._quiz) {
    try {
      hwInstance._quiz.startUserStroke(coords);
    } catch (err) {
      // ignore
    }
  }

  // Draw initial dot
  if (ctx) {
    ctx.save();
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.arc(coords.x, coords.y, lastLineWidth / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};

/**
 * Pointer Move Event Handler (utilizing getCoalescedEvents for highest fidelity)
 */
const onPointerMove = (e: PointerEvent) => {
  if (!isDrawing || e.pointerId !== activePointerId) return;

  // Retrieve batched coalesced events if supported by browser/driver
  const rawEvents = typeof e.getCoalescedEvents === 'function' ? e.getCoalescedEvents() : [e];
  const events = rawEvents.length > 0 ? rawEvents : [e];

  for (const evt of events) {
    const coords = getCanvasCoords(evt);
    const now = performance.now();
    const newPoint: Point = { x: coords.x, y: coords.y, time: now };

    const lastPoint = currentStrokePoints[currentStrokePoints.length - 1];
    if (lastPoint) {
      const lineWidth = getDynamicLineWidth(lastPoint, newPoint, lastLineWidth);
      lastLineWidth = lineWidth;

      if (ctx) {
        ctx.save();
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.beginPath();
        if (currentStrokePoints.length === 1) {
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(newPoint.x, newPoint.y);
        } else {
          const prev = currentStrokePoints[currentStrokePoints.length - 2];
          const mid1X = (prev.x + lastPoint.x) / 2;
          const mid1Y = (prev.y + lastPoint.y) / 2;
          const mid2X = (lastPoint.x + newPoint.x) / 2;
          const mid2Y = (lastPoint.y + newPoint.y) / 2;

          ctx.moveTo(mid1X, mid1Y);
          ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, mid2X, mid2Y);
        }
        ctx.stroke();
        ctx.restore();
      }
    }

    currentStrokePoints.push(newPoint);

    // Forward coalesced point to HanziWriter
    if (hwInstance?._quiz) {
      try {
        hwInstance._quiz.continueUserStroke(coords);
      } catch (err) {
        // ignore
      }
    }
  }
};

/**
 * Pointer Up / Cancel Event Handler
 */
const onPointerUp = (e: PointerEvent) => {
  if (!isDrawing || e.pointerId !== activePointerId) return;

  isDrawing = false;
  activePointerId = null;

  const canvas = canvasRef.value;
  if (canvas) {
    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch (err) {
      // ignore
    }
  }

  // End HanziWriter stroke
  if (hwInstance?._quiz) {
    try {
      hwInstance._quiz.endUserStroke();
    } catch (err) {
      // ignore
    }
  }

  if (currentStrokePoints.length > 0) {
    userStrokesCount.value++;
    // Save to drawn strokes
    const widths = currentStrokePoints.map(() => lastLineWidth);
    drawnStrokes.push({
      points: [...currentStrokePoints],
      widths
    });
    currentStrokePoints = [];
    emit('stroke-drawn', { strokeCount: userStrokesCount.value });

    // Set auto-submit check timer if user stops drawing for 2.2 seconds
    clearTimeout(autoSubmitTimer);
    autoSubmitTimer = setTimeout(() => {
      if (userStrokesCount.value > 0 && !isCharacterComplete.value) {
        // Prompt or soft evaluate if user has drawn enough strokes
        if (completedStrokes.value >= Math.max(1, totalTargetStrokes.value)) {
          submitEvaluation();
        }
      }
    }, 2200);
  }
};

/**
 * Clear canvas and reset quiz
 */
const clearCanvas = () => {
  drawnStrokes.length = 0;
  currentStrokePoints = [];
  userStrokesCount.value = 0;
  totalMistakes.value = 0;
  completedStrokes.value = 0;
  isCharacterComplete.value = false;
  clearTimeout(autoSubmitTimer);

  redrawCanvas();
  initHanziWriterQuiz();
  emit('clear');
};

/**
 * Submit and emit evaluation result
 */
const submitEvaluation = (forcedMistakes?: number) => {
  if (isSubmitting.value) return;
  isSubmitting.value = true;
  clearTimeout(autoSubmitTimer);

  const mistakes = typeof forcedMistakes === 'number' ? forcedMistakes : totalMistakes.value;
  const target = Math.max(1, totalTargetStrokes.value);

  // Generous threshold for handwriting accuracy
  const maxAllowedMistakes = Math.ceil(target * 0.75);
  const passed = isCharacterComplete.value || (completedStrokes.value >= target && mistakes <= maxAllowedMistakes);

  const accuracy = Math.max(0, Math.min(1, 1 - mistakes / (target * 2.5)));

  emit('graded', {
    accuracy: Number(accuracy.toFixed(2)),
    passed,
    totalMistakes: mistakes
  });

  setTimeout(() => {
    isSubmitting.value = false;
  }, 400);
};

watch(
  () => props.targetChar,
  async () => {
    clearCanvas();
  }
);

onMounted(async () => {
  await nextTick();
  setupCanvas();
  await initHanziWriterQuiz();
});

onUnmounted(() => {
  clearTimeout(autoSubmitTimer);
  if (hwInstance) {
    try {
      hwInstance.cancelQuiz();
    } catch (e) {
      // ignore
    }
    hwInstance = null;
  }
});
</script>

<template>
  <div class="flex flex-col items-center gap-3 select-none">
    <!-- Main Drawing Stage -->
    <div 
      class="relative rounded-3xl overflow-hidden shadow-2xl border-2 border-slate-700/80 bg-slate-950 flex items-center justify-center p-1"
      :style="{ width: `${size + 8}px`, height: `${size + 8}px` }"
    >
      <!-- Background HanziWriter Engine (Hidden / Used for Math & Evaluation) -->
      <div 
        ref="hwContainerRef" 
        class="absolute inset-0 pointer-events-none opacity-0"
        :style="{ width: `${size}px`, height: `${size}px` }"
      ></div>

      <!-- High-Precision Calligraphy Canvas -->
      <canvas
        ref="canvasRef"
        class="cursor-crosshair touch-none rounded-2xl block relative z-10"
        @pointerdown="onPointerDown"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerUp"
      ></canvas>

      <!-- Corner Guide Label -->
      <div class="absolute bottom-2.5 right-3 text-[10px] text-slate-500 font-mono pointer-events-none select-none z-20">
        {{ userStrokesCount }} goresan
      </div>
    </div>

    <!-- Action Toolbar (Clear & Submit) -->
    <div class="flex items-center justify-between gap-3 w-full max-w-[310px] pt-1">
      <button
        type="button"
        @click="clearCanvas"
        :disabled="userStrokesCount === 0 || isSubmitting"
        class="flex-1 py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 disabled:opacity-40 disabled:pointer-events-none font-bold text-xs border border-slate-700 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span>Hapus</span>
      </button>

      <button
        type="button"
        @click="submitEvaluation()"
        :disabled="userStrokesCount === 0 || isSubmitting"
        class="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white disabled:opacity-40 disabled:pointer-events-none font-bold text-xs border border-emerald-500/40 transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-emerald-950/40"
      >
        <Check v-if="!isSubmitting" class="w-3.5 h-3.5" />
        <Sparkles v-else class="w-3.5 h-3.5 animate-spin" />
        <span>Periksa</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
canvas {
  touch-action: none;
  -webkit-user-select: none;
  user-select: none;
}
</style>
