<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { resolveCharacter, type StrokeData } from '../services/strokeDataService';
import StrokeCharacter from './StrokeCharacter.vue';
import { RotateCcw, Loader2, Play, Pause } from '@lucide/vue';

const props = withDefaults(
  defineProps<{
    text: string;
    speed?: number;
    autoplay?: boolean;
    loopDelay?: number;
  }>(),
  {
    speed: 800,
    autoplay: true,
    loopDelay: 1600
  }
);

interface CharEntry {
  char: string;
  strokeData: StrokeData | null;
}

const activeCharIndex = ref<number>(0);
const isLoading = ref<boolean>(true);
const characterEntries = ref<CharEntry[]>([]);
const strokeCharRefs = ref<InstanceType<typeof StrokeCharacter>[]>([]);
const isPlaying = ref<boolean>(props.autoplay);
const isFinishedAll = ref<boolean>(false);
let loopTimeout: any = null;

const clearLoopTimeout = () => {
  if (loopTimeout !== null) {
    clearTimeout(loopTimeout);
    loopTimeout = null;
  }
};

// Responsive compact box sizing based on total character count
const boxSizeClass = computed(() => {
  const count = characterEntries.value.length;
  if (count <= 1) return 'w-28 h-28 min-[380px]:w-32 min-[380px]:h-32 sm:w-36 sm:h-36 max-w-[144px] max-h-[144px]';
  if (count === 2) return 'w-24 h-24 min-[380px]:w-26 min-[380px]:h-26 sm:w-28 sm:h-28 max-w-[116px] max-h-[116px]';
  if (count === 3) return 'w-18 h-18 min-[380px]:w-20 min-[380px]:h-20 sm:w-24 sm:h-24 max-w-[96px] max-h-[96px]';
  if (count <= 5) return 'w-15 h-15 min-[380px]:w-16 min-[380px]:h-16 sm:w-18 sm:h-18 max-w-[76px] max-h-[76px]';
  return 'w-12 h-12 sm:w-14 sm:h-14 max-w-[58px] max-h-[58px]';
});

const loadCharacters = async (targetText: string) => {
  clearLoopTimeout();
  isLoading.value = true;
  activeCharIndex.value = 0;
  isFinishedAll.value = false;
  strokeCharRefs.value = [];
  const chars = [...(targetText || '')];
  
  if (chars.length === 0) {
    characterEntries.value = [];
    isLoading.value = false;
    return;
  }

  const entries: CharEntry[] = [];
  for (const c of chars) {
    try {
      const data = await resolveCharacter(c);
      entries.push({ char: c, strokeData: data });
    } catch (e) {
      entries.push({ char: c, strokeData: { skip: true, error: true } });
    }
  }

  characterEntries.value = entries;
  isLoading.value = false;
  
  nextTick(() => {
    if (isPlaying.value) {
      replayAll();
    } else {
      strokeCharRefs.value.forEach(refEl => {
        if (refEl && typeof refEl.reset === 'function') {
          refEl.reset();
        }
      });
    }
  });
};

const handleCharComplete = (idx: number) => {
  if (!isPlaying.value) return;
  if (idx === activeCharIndex.value) {
    if (activeCharIndex.value < characterEntries.value.length - 1) {
      activeCharIndex.value = idx + 1;
      nextTick(() => {
        if (!isPlaying.value) return;
        const nextRef = strokeCharRefs.value[idx + 1];
        if (nextRef && typeof nextRef.replay === 'function') {
          nextRef.replay();
        }
      });
    } else {
      // Entire text is finished
      isFinishedAll.value = true;
      clearLoopTimeout();
      if (isPlaying.value) {
        loopTimeout = setTimeout(() => {
          if (isPlaying.value) {
            replayAll();
          }
        }, props.loopDelay);
      }
    }
  }
};

const replayAll = () => {
  clearLoopTimeout();
  isFinishedAll.value = false;
  activeCharIndex.value = 0;

  // Reset all characters first
  strokeCharRefs.value.forEach((refEl) => {
    if (refEl && typeof refEl.reset === 'function') {
      refEl.reset();
    }
  });

  nextTick(() => {
    if (!isPlaying.value) return;
    // Start character 0
    const firstRef = strokeCharRefs.value[0];
    if (firstRef && typeof firstRef.replay === 'function') {
      firstRef.replay();
    }
  });
};

const togglePlayPause = () => {
  if (isPlaying.value) {
    // Pause
    isPlaying.value = false;
    clearLoopTimeout();
    const currentRef = strokeCharRefs.value[activeCharIndex.value];
    if (currentRef && typeof currentRef.pause === 'function') {
      currentRef.pause();
    }
  } else {
    // Play
    isPlaying.value = true;
    if (isFinishedAll.value) {
      replayAll();
    } else {
      const currentRef = strokeCharRefs.value[activeCharIndex.value];
      if (currentRef && typeof currentRef.resume === 'function') {
        currentRef.resume();
      } else {
        replayAll();
      }
    }
  }
};

const handleManualReplay = () => {
  isPlaying.value = true;
  replayAll();
};

watch(
  () => props.text,
  (newText) => {
    loadCharacters(newText);
  }
);

onMounted(() => {
  loadCharacters(props.text);
});

onUnmounted(() => {
  clearLoopTimeout();
});

defineExpose({
  replayAll,
  togglePlayPause,
  isPlaying
});
</script>

<template>
  <div class="w-full flex flex-col items-center justify-center select-none relative">
    <!-- Loading State -->
    <div v-if="isLoading" class="py-4 flex flex-col items-center justify-center text-slate-400 gap-1.5">
      <Loader2 class="w-5 h-5 text-amber-400 animate-spin" />
      <span class="text-xs font-semibold">Memuat goresan...</span>
    </div>

    <!-- Character Stroke Viewport -->
    <div 
      v-else-if="characterEntries.length > 0"
      class="w-full flex flex-col items-center relative"
    >
      <!-- Top Right Compact Controls (Play/Pause & Replay) -->
      <div class="absolute -top-3.5 -right-2 flex items-center gap-1.5 z-30">
        <!-- Play / Pause Button -->
        <button
          type="button"
          @click="togglePlayPause"
          class="p-1.5 rounded-lg bg-slate-800/95 hover:bg-slate-700 text-amber-400 dark:text-amber-300 border border-slate-700/80 dark:border-slate-800 transition active:scale-95 cursor-pointer shadow-xs flex items-center justify-center"
          :title="isPlaying ? 'Jeda Animasi (Pause)' : 'Putar Animasi (Play)'"
        >
          <Pause v-if="isPlaying" class="w-3.5 h-3.5 fill-current" />
          <Play v-else class="w-3.5 h-3.5 fill-current ml-0.5" />
        </button>

        <!-- Replay Button -->
        <button
          type="button"
          @click="handleManualReplay"
          class="p-1.5 rounded-lg bg-slate-800/95 hover:bg-slate-700 text-amber-400 dark:text-amber-300 border border-slate-700/80 dark:border-slate-800 transition active:scale-95 cursor-pointer shadow-xs flex items-center justify-center"
          title="Ulangi Dari Awal (Restart)"
        >
          <RotateCcw class="w-3.5 h-3.5" />
        </button>
      </div>

      <!-- Horizontal Compact Character Row (Tighter Gap) -->
      <div class="flex items-center justify-center gap-0.5 flex-wrap max-w-full py-0.5">
        <StrokeCharacter
          v-for="(item, idx) in characterEntries"
          :key="item.char + '_' + idx"
          :ref="(el) => { if (el) strokeCharRefs[idx] = el as any; }"
          :char="item.char"
          :stroke-data="item.strokeData"
          :speed="speed"
          :autoplay="false"
          :is-active="idx <= activeCharIndex"
          :box-size-class="boxSizeClass"
          @animation-complete="handleCharComplete(idx)"
        />
      </div>
    </div>

    <!-- Empty Fallback -->
    <div v-else class="py-3 text-xs text-slate-400">
      Tidak ada teks untuk dianimasikan
    </div>
  </div>
</template>
