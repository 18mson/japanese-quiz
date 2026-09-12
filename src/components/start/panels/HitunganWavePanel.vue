<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle2 } from '@lucide/vue';
import { useQuizStore } from '../../../stores/quizStore';
import { HITUNGAN_WAVES, type HitunganWaveDef } from '../../../data/hitunganWaves';

const props = defineProps<{
  selectedTab: 'angka' | 'counter' | 'campuran';
  selectedWaveKey: string;
  direction: 'number_to_kana' | 'kana_to_number';
}>();

const emit = defineEmits<{
  (e: 'update:selectedWaveKey', key: string): void;
  (e: 'update:direction', dir: 'number_to_kana' | 'kana_to_number'): void;
  (e: 'openTutorial', wave: HitunganWaveDef): void;
  (e: 'interact'): void;
}>();

const quizStore = useQuizStore();

// Responsive screen detection
const isMobile = ref(false);
const updateResponsive = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 640;
  }
};

onMounted(() => {
  updateResponsive();
  window.addEventListener('resize', updateResponsive);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateResponsive);
});

const filteredWaves = computed(() => {
  if (props.selectedTab === 'angka') {
    return HITUNGAN_WAVES.filter(w => w.type === 'number_range');
  }
  if (props.selectedTab === 'counter') {
    return HITUNGAN_WAVES.filter(w => w.type === 'counter');
  }
  return HITUNGAN_WAVES.filter(w => w.type === 'mixed');
});

const currentWave = computed(() => {
  return HITUNGAN_WAVES.find(w => w.wave_key === props.selectedWaveKey) || filteredWaves.value[0] || HITUNGAN_WAVES[0];
});

// Hitungan Wave Pagination State (2 on mobile, 3 on desktop)
const hitunganWaveStartIndex = ref(0);
const hitunganWavePageSize = computed(() => {
  if (isMobile.value) return 2;
  return 3;
});

const visibleWaves = computed(() => {
  return filteredWaves.value.slice(
    hitunganWaveStartIndex.value,
    hitunganWaveStartIndex.value + hitunganWavePageSize.value
  );
});

const canPrevWaves = computed(() => hitunganWaveStartIndex.value > 0);
const canNextWaves = computed(() => {
  return hitunganWaveStartIndex.value + hitunganWavePageSize.value < filteredWaves.value.length;
});

const prevWaves = () => {
  emit('interact');
  hitunganWaveStartIndex.value = Math.max(0, hitunganWaveStartIndex.value - hitunganWavePageSize.value);
};

const nextWaves = () => {
  emit('interact');
  if (canNextWaves.value) {
    hitunganWaveStartIndex.value = Math.min(
      filteredWaves.value.length - hitunganWavePageSize.value,
      hitunganWaveStartIndex.value + hitunganWavePageSize.value
    );
  }
};

const selectWave = (key: string) => {
  emit('interact');
  emit('update:selectedWaveKey', key);
};

const selectDirection = (dir: 'number_to_kana' | 'kana_to_number') => {
  emit('interact');
  emit('update:direction', dir);
};

watch(() => props.selectedWaveKey, (newVal) => {
  const idx = filteredWaves.value.findIndex(w => w.wave_key === newVal);
  if (idx !== -1) {
    if (idx < hitunganWaveStartIndex.value || idx >= hitunganWaveStartIndex.value + hitunganWavePageSize.value) {
      hitunganWaveStartIndex.value = Math.floor(idx / hitunganWavePageSize.value) * hitunganWavePageSize.value;
    }
  }
});

watch(hitunganWavePageSize, (newSize) => {
  if (hitunganWaveStartIndex.value + newSize > filteredWaves.value.length) {
    hitunganWaveStartIndex.value = Math.max(0, filteredWaves.value.length - newSize);
  }
});

watch(() => props.selectedTab, () => {
  hitunganWaveStartIndex.value = 0;
});
</script>

<template>
  <div class="bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-rose-50/80 dark:from-amber-950/50 dark:via-orange-950/30 dark:to-rose-950/50 border border-amber-300/80 dark:border-amber-800/80 rounded-2xl p-3 sm:p-3.5 flex flex-col gap-2.5 w-full animate-fadeIn">
    <!-- Wave Chips Selector with Prev/Next Navigation + Pattern Modal Trigger -->
    <div class="flex items-center gap-1 sm:gap-1.5 w-full">
      <!-- Prev Button -->
      <button
        v-if="filteredWaves.length > hitunganWavePageSize"
        type="button"
        @click.stop="prevWaves"
        :disabled="!canPrevWaves"
        class="p-2 sm:p-2 rounded-xl border border-amber-200/80 dark:border-amber-800/80 bg-white/80 dark:bg-slate-800/80 text-amber-900 dark:text-amber-200 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-amber-50 dark:hover:bg-amber-900/40 transition cursor-pointer shrink-0 shadow-2xs"
        title="Level Sebelumnya"
      >
        <ChevronLeft class="w-3.5 h-3.5" />
      </button>

      <!-- Paginated Visible Waves -->
      <div class="flex items-center gap-1 sm:gap-1.5 flex-1 min-w-0">
        <button
          v-for="wave in visibleWaves"
          :key="wave.wave_key"
          type="button"
          @click.stop="selectWave(wave.wave_key)"
          :class="[
            'flex-1 py-2 px-1 sm:px-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center gap-1 shadow-2xs min-w-0',
            selectedWaveKey === wave.wave_key
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 border-amber-400 font-black shadow-xs scale-[1.02]'
              : 'bg-white/85 dark:bg-slate-800/85 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border-amber-200/60 dark:border-slate-700'
          ]"
        >
          <span class="truncate font-semibold text-[11px] sm:text-xs">
            {{ wave.shortTitle }}
          </span>
          <!-- Checkmark if tutorial already seen -->
          <CheckCircle2 
            v-if="quizStore.hitunganProgressMap[wave.wave_key]?.tutorial_seen" 
            class="w-3.5 h-3.5 shrink-0" 
            :class="selectedWaveKey === wave.wave_key ? 'text-slate-950' : 'text-emerald-500'" 
          />
        </button>
      </div>

      <!-- Next Button -->
      <button
        v-if="filteredWaves.length > hitunganWavePageSize"
        type="button"
        @click.stop="nextWaves"
        :disabled="!canNextWaves"
        class="p-2 sm:p-2 rounded-xl border border-amber-200/80 dark:border-amber-800/80 bg-white/80 dark:bg-slate-800/80 text-amber-900 dark:text-amber-200 disabled:opacity-25 disabled:cursor-not-allowed hover:bg-amber-50 dark:hover:bg-amber-900/40 transition cursor-pointer shrink-0 shadow-2xs"
        title="Level Berikutnya"
      >
        <ChevronRight class="w-3.5 h-3.5" />
      </button>

      <div class="w-px h-6 bg-amber-200 dark:bg-amber-800/60 shrink-0 mx-0.5"></div>

      <!-- Preview Pattern Button -->
      <button
        type="button"
        @click.stop="emit('openTutorial', currentWave)"
        class="py-2 px-2.5 sm:px-3 rounded-xl bg-white/90 dark:bg-slate-800 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700/80 text-xs font-bold transition hover:bg-amber-100 dark:hover:bg-amber-900/40 flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
        title="Buka Penjelasan Pola & Pengecualian"
      >
        <BookOpen class="w-3.5 h-3.5 text-amber-500" />
        <span class="whitespace-nowrap hidden sm:inline">Lihat Pola</span>
        <span class="whitespace-nowrap sm:hidden">Pola</span>
      </button>
    </div>

    <!-- Direction Selector -->
    <div class="flex items-center justify-between pt-1 border-t border-amber-200/60 dark:border-amber-800/50 flex-wrap gap-1.5">
      <span class="text-[10px] font-extrabold uppercase tracking-wider text-amber-900 dark:text-amber-300">
        Arah Latihan:
      </span>

      <div class="flex items-center gap-1 bg-white/70 dark:bg-slate-900/70 p-0.5 rounded-xl border border-amber-200 dark:border-amber-800/60">
        <button
          type="button"
          @click.stop="selectDirection('number_to_kana')"
          :class="[
            'px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer',
            direction === 'number_to_kana'
              ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          ]"
        >
          Angka ➔ かな
        </button>
        <button
          type="button"
          @click.stop="selectDirection('kana_to_number')"
          :class="[
            'px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer',
            direction === 'kana_to_number'
              ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          ]"
        >
          かな ➔ Angka
        </button>
      </div>
    </div>
  </div>
</template>
