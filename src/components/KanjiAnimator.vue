<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { resolveCharacter, type StrokeData } from '../services/strokeDataService';
import StrokeCharacter from './StrokeCharacter.vue';
import { RotateCcw, Loader2 } from '@lucide/vue';

const props = withDefaults(
  defineProps<{
    text: string;
    speed?: number;
    autoplay?: boolean;
  }>(),
  {
    speed: 650,
    autoplay: true
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
  isLoading.value = true;
  activeCharIndex.value = 0;
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
    replayAll();
  });
};

const handleCharComplete = (idx: number) => {
  if (idx === activeCharIndex.value) {
    if (activeCharIndex.value < characterEntries.value.length - 1) {
      activeCharIndex.value = idx + 1;
      nextTick(() => {
        const nextRef = strokeCharRefs.value[idx + 1];
        if (nextRef && typeof nextRef.replay === 'function') {
          nextRef.replay();
        }
      });
    }
  }
};

const replayAll = () => {
  activeCharIndex.value = 0;
  // Reset all characters first
  strokeCharRefs.value.forEach((refEl) => {
    if (refEl && typeof refEl.reset === 'function') {
      refEl.reset();
    }
  });

  nextTick(() => {
    // Start character 0
    const firstRef = strokeCharRefs.value[0];
    if (firstRef && typeof firstRef.replay === 'function') {
      firstRef.replay();
    }
  });
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

defineExpose({
  replayAll
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
      <!-- Top Right Compact Replay Icon Button (Offside to top-right corner) -->
      <button
        type="button"
        @click="replayAll"
        class="absolute -top-4 -right-3 p-1.5 rounded-lg bg-slate-800/95 hover:bg-slate-700 text-amber-400 dark:text-amber-300 border border-slate-700/80 dark:border-slate-800 transition active:scale-95 cursor-pointer shadow-xs z-30"
        title="Ulangi Animasi Goresan"
      >
        <RotateCcw class="w-3.5 h-3.5" />
      </button>

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
