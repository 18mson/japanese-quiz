<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import type { StrokeData } from '../services/strokeDataService';

const props = withDefaults(
  defineProps<{
    char: string;
    strokeData?: StrokeData | null;
    speed?: number;
    autoplay?: boolean;
    isActive?: boolean;
    boxSizeClass?: string;
  }>(),
  {
    strokeData: null,
    speed: 800,
    autoplay: true,
    isActive: true,
    boxSizeClass: 'w-16 h-16 sm:w-20 sm:h-20'
  }
);

const emit = defineEmits<{
  (e: 'animation-complete'): void;
}>();

const pathRefs = ref<SVGPathElement[]>([]);
const pathLengths = ref<number[]>([]);
const strokeOffsets = ref<number[]>([]);
const activeStrokeIndex = ref<number>(-1);
const isComplete = ref<boolean>(false);
const isPaused = ref<boolean>(false);
let rafId: number | null = null;
let strokeTimeout: any = null;
let animSessionId = 0;
let currentStrokeStartTime = 0;
let currentStrokeDuration = 0;
let currentStrokeTotalLen = 0;
let currentStrokeElapsedBeforePause = 0;

const strokes = computed(() => props.strokeData?.strokes || []);
const hasStrokes = computed(() => !props.strokeData?.skip && strokes.value.length > 0);

const measureAllPaths = () => {
  pathLengths.value = strokes.value.map((_, idx) => {
    const el = pathRefs.value[idx];
    if (el && typeof el.getTotalLength === 'function') {
      const len = el.getTotalLength();
      return len > 0 ? len : 180;
    }
    return 180;
  });
  // Initialize offsets to full length (hidden)
  strokeOffsets.value = [...pathLengths.value];
};

const cancelCurrentAnimation = () => {
  animSessionId++;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
  if (strokeTimeout !== null) {
    clearTimeout(strokeTimeout);
    strokeTimeout = null;
  }
};

const runStrokeStep = (index: number, initialElapsed = 0, sessionId = animSessionId) => {
  if (sessionId !== animSessionId) return;
  if (!hasStrokes.value || index >= strokes.value.length) {
    isComplete.value = true;
    activeStrokeIndex.value = strokes.value.length;
    emit('animation-complete');
    return;
  }

  activeStrokeIndex.value = index;
  currentStrokeTotalLen = pathLengths.value[index] || 180;

  // Length-proportional duration ensures constant, natural writing velocity across all stroke lengths.
  // Short dots/ticks take a reasonable time, while long strokes take proportionally more time so they never rush.
  const len = currentStrokeTotalLen;
  const speedMultiplier = (props.speed || 800) / 650;
  const baseMs = 380 * speedMultiplier;
  const msPerPx = 5.5 * speedMultiplier;
  currentStrokeDuration = Math.max(480 * speedMultiplier, baseMs + (len * msPerPx));

  currentStrokeStartTime = performance.now();
  currentStrokeElapsedBeforePause = initialElapsed;

  const step = (now: number) => {
    if (sessionId !== animSessionId) return;
    if (isPaused.value) return;
    const elapsed = (now - currentStrokeStartTime) + currentStrokeElapsedBeforePause;
    const progress = Math.min(1, elapsed / currentStrokeDuration);
    
    // Smooth calligraphy ease-in-out (sine): gentle touchdown, steady stroke movement, gentle lift
    const easeProgress = -(Math.cos(Math.PI * progress) - 1) / 2;
    strokeOffsets.value[index] = currentStrokeTotalLen * (1 - easeProgress);

    if (progress < 1) {
      rafId = requestAnimationFrame(step);
    } else {
      strokeOffsets.value[index] = 0;
      rafId = null;
      currentStrokeElapsedBeforePause = 0;

      // Natural brush-lift pause before next stroke
      if (index + 1 < strokes.value.length) {
        strokeTimeout = setTimeout(() => {
          strokeTimeout = null;
          if (sessionId === animSessionId && !isPaused.value) {
            runStrokeStep(index + 1, 0, sessionId);
          }
        }, 120);
      } else {
        runStrokeStep(index + 1, 0, sessionId);
      }
    }
  };

  rafId = requestAnimationFrame(step);
};

const startAnimation = () => {
  cancelCurrentAnimation();
  const currentSession = animSessionId;
  isComplete.value = false;
  isPaused.value = false;
  activeStrokeIndex.value = -1;
  currentStrokeElapsedBeforePause = 0;

  nextTick(() => {
    if (currentSession !== animSessionId) return;
    measureAllPaths();
    if (strokes.value.length > 0) {
      runStrokeStep(0, 0, currentSession);
    } else {
      isComplete.value = true;
      emit('animation-complete');
    }
  });
};

const pause = () => {
  if (isPaused.value || isComplete.value) return;
  isPaused.value = true;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
    if (activeStrokeIndex.value >= 0 && activeStrokeIndex.value < strokes.value.length) {
      currentStrokeElapsedBeforePause += (performance.now() - currentStrokeStartTime);
    }
  }
  if (strokeTimeout !== null) {
    clearTimeout(strokeTimeout);
    strokeTimeout = null;
  }
};

const resume = () => {
  if (!isPaused.value) return;
  isPaused.value = false;
  if (isComplete.value) {
    startAnimation();
    return;
  }
  if (activeStrokeIndex.value >= 0 && activeStrokeIndex.value < strokes.value.length) {
    runStrokeStep(activeStrokeIndex.value, currentStrokeElapsedBeforePause, animSessionId);
  } else {
    startAnimation();
  }
};

const reset = () => {
  cancelCurrentAnimation();
  activeStrokeIndex.value = -1;
  isComplete.value = false;
  isPaused.value = false;
  currentStrokeElapsedBeforePause = 0;
  strokeOffsets.value = pathLengths.value.length > 0 ? [...pathLengths.value] : [];
};

const replay = () => {
  startAnimation();
};

defineExpose({
  replay,
  reset,
  pause,
  resume,
  isComplete,
  isPaused
});

watch(
  () => props.strokeData,
  () => {
    if (props.autoplay && props.isActive) {
      startAnimation();
    }
  },
  { deep: true }
);

watch(
  () => props.isActive,
  (active) => {
    if (!active) {
      reset();
    } else if (props.autoplay && (activeStrokeIndex.value === -1 || !isComplete.value)) {
      startAnimation();
    }
  }
);

onMounted(() => {
  if (props.autoplay && props.isActive) {
    startAnimation();
  }
});

onUnmounted(() => {
  cancelCurrentAnimation();
});
</script>

<template>
  <div class="relative flex flex-col items-center justify-center select-none group shrink-0 max-w-fit">
    <!-- Main Stroke Animation Container (Standard KanjiVG 109x109) -->
    <div 
      :class="[
        boxSizeClass,
        'aspect-square shrink-0 bg-slate-900/95 dark:bg-slate-950/90 border border-slate-700/80 dark:border-slate-800 rounded-xl p-1 shadow-inner flex items-center justify-center relative overflow-hidden'
      ]"
    >
      <!-- Background Guide Grid Lines (Traditional Japanese Genkouyoushi Square) -->
      <svg class="absolute inset-0 w-full h-full pointer-events-none p-1" viewBox="0 0 109 109">
        <!-- Outer Box -->
        <rect x="1" y="1" width="107" height="107" fill="none" stroke="rgba(148, 163, 184, 0.15)" stroke-width="1" />
        <!-- Horizontal Center Dashed Line -->
        <line x1="1" y1="54.5" x2="108" y2="54.5" stroke="rgba(148, 163, 184, 0.2)" stroke-width="1" stroke-dasharray="3,3" />
        <!-- Vertical Center Dashed Line -->
        <line x1="54.5" y1="1" x2="54.5" y2="108" stroke="rgba(148, 163, 184, 0.2)" stroke-width="1" stroke-dasharray="3,3" />
      </svg>

      <!-- If has stroke data: render progressive KanjiVG stroke animation -->
      <svg 
        v-if="hasStrokes"
        class="w-full h-full relative z-10 p-0" 
        viewBox="0 0 109 109"
      >
        <!-- 1. Background Ghost Guide Paths (Faint outline of entire character) -->
        <g class="opacity-25 dark:opacity-35">
          <path
            v-for="(d, idx) in strokes"
            :key="'guide-' + idx"
            :d="d"
            fill="none"
            stroke="currentColor"
            class="text-slate-400 dark:text-slate-500"
            stroke-width="5.2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </g>

        <!-- 2. Active Progressive Animated Strokes -->
        <g>
          <path
            v-for="(d, idx) in strokes"
            :key="'stroke-' + idx"
            :ref="(el) => { if (el) pathRefs[idx] = el as SVGPathElement; }"
            :d="d"
            fill="none"
            stroke="#fbbf24"
            class="drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]"
            :style="{
              strokeWidth: '5.6',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeDasharray: pathLengths[idx] || 180,
              strokeDashoffset: strokeOffsets[idx] !== undefined ? strokeOffsets[idx] : (pathLengths[idx] || 180),
              opacity: (idx <= activeStrokeIndex && (strokeOffsets[idx] !== undefined ? strokeOffsets[idx] < (pathLengths[idx] || 180) : false)) || idx < activeStrokeIndex ? 1 : 0
            }"
          />
        </g>

        <!-- 3. Current Stroke Order Badge Indicator -->
        <g v-if="activeStrokeIndex >= 0 && activeStrokeIndex < strokes.length && !isComplete">
          <circle
            cx="13"
            cy="13"
            r="8.5"
            fill="#d97706"
          />
          <text
            x="13"
            y="16"
            text-anchor="middle"
            fill="#ffffff"
            font-size="8.5"
            font-weight="900"
            font-family="sans-serif"
          >
            {{ activeStrokeIndex + 1 }}
          </text>
        </g>
      </svg>

      <!-- Fallback: When character has skip or cannot be fetched -->
      <div 
        v-else 
        class="relative z-10 flex flex-col items-center justify-center animate-fadeIn text-center"
      >
        <span class="text-3xl sm:text-4xl min-[400px]:text-4xl font-black text-amber-300 font-jp drop-shadow-md">
          {{ char }}
        </span>
      </div>
    </div>

    <!-- Character Label Under Box -->
    <div class="mt-1 flex items-center gap-1 text-[11px] sm:text-xs font-bold text-slate-400 font-jp">
      <span>{{ char }}</span>
      <span v-if="hasStrokes" class="text-[9.5px] font-sans text-amber-400/80">({{ strokes.length }})</span>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
.animate-fadeIn {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
